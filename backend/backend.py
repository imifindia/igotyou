import json
import os
import boto3
import uuid
import re
from collections import defaultdict
import pytz
from datetime import datetime

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME')
persons_table_name = os.environ.get('PERSONS_TABLE_NAME')
table = dynamodb.Table(table_name)
persons_table = dynamodb.Table(persons_table_name)

# Get the current datetime in IST timezone
ist = pytz.timezone('Asia/Kolkata')
now_ist = datetime.now(ist)
# Get the current date and time together in IST
current_datetime_ist = now_ist.strftime("%Y-%m-%dT%H:%M:%S")

# List of fields which neednt be sent back in the get API call
unwanted_fields = ['id', 'user_details','history']

def clean_up_unwanted_fields(items):
    # Logic to remove unwanted fields from the item
    for record in items:
        for field in unwanted_fields:
            if field in record:
                del record[field]
    #print(f"clean_up_unwanted_fields: {items}")
    return items

# Function to get the values from the DB
def get_records(path_params, query_params):
    if query_params is not None and 'id' in query_params:
        # Get a single item by ID
        response = table.get_item(Key={'id': query_params['id']})
        item = response.get('Item')
        print("Record Detail fetched successfully")
    elif query_params is not None and 'persons' in query_params:
        # Scan the table for all items
        response = persons_table.scan()
        item = response.get('Items', [])
        print(f"{len(item)} Records fetched successfully")
        cleaned_up = clean_up_unwanted_fields(item)
        # Return the response
        print(cleaned_up)
        return cleaned_up    
    else:
        # Scan the table for all items
        response = table.scan()
        item = response.get('Items', [])
        print(f"{len(item)} Records fetched successfully")
        cleaned_up = clean_up_unwanted_fields(item)
        # Return the response
        print(cleaned_up)
        return cleaned_up

# Function to add records into DB
def add_records(request_body):
    
    del request_body["magic"]

    person_details = request_body.get("persons","")
    for person in person_details:
        person["id"] = str(uuid.uuid4())
        person["updated_time"] = current_datetime_ist
        person["report_id"] = request_body["id"]
        person['up_vote'] = "0"
        person['down_vote'] = "0"
        person['prev_status'] = ""
        person['prev_counter'] = "0"
        person['history']=[]
        person["updated_by"] = {}
        person["updated_by"]["name"] = ""
        person["updated_by"]["place"] = ""
        person["updated_by"]["phone"] = ""      
        # Insert into Person Details table
        persons_table.put_item(Item=person)
        print(f"Person Details added successfully {person}")
    #remove person records from request
    del request_body["persons"]
    # Create a new report
    table.put_item(Item=request_body)
    print(f"Report Details added successfully {request_body}")

    #item = request_body
    print("Details captured successfully")

# Function to update records in the DB
def update_records(query_params, request_body, x_forwarded_for):
    if 'person' in query_params:
        print(request_body['id'])
        # Fetch a specific person details from person table
        person_response = persons_table.get_item(Key={'id': request_body['id']})
        print(person_response)
        person_details = person_response.get('Item')
        print(f"Updating Person : {person_details['id']}")
        # Create a copy of person_details without the "history" key
        person_details_copy = dict(person_details)
        del person_details_copy["history"]

        # Append the copy to the history list
        person_details["history"].append(person_details_copy)
        # update the columns up_vote, down_vote, prev_status, pre_counter in persons table
        person_details["updated_time"] = current_datetime_ist
        person_details['up_vote'] = str(int(request_body['up_vote'])+int(person_details['up_vote']))
        person_details['down_vote'] = str(int(request_body['down_vote'])+int(person_details['down_vote']))
        #Store the current status into previous status field
        person_details['prev_status'] = person_details['status']

        person_details['status'] = request_body['status']
        person_details['prev_counter'] = str(int(person_details['up_vote'])-int(person_details['down_vote']))
        person_details["updated_by"]["x_forwarded_for"] = x_forwarded_for
        person_details["updated_by"]["name"] = request_body['updated_by'].get("name","")
        person_details["updated_by"]["place"] = request_body['updated_by'].get("place","")
        person_details["updated_by"]["phone"] = request_body['updated_by'].get("phone","")
        persons_table.put_item(Item=person_details)
        print(f"Person Details updated successfully {person_details}")

    elif 'id' in query_params:
        # Update an existing item
        table.put_item(Item={**request_body, 'id': query_params['id']})
        print("Details updated successfully")

    else:
        # Return an error if the ID is not provided
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing Person ID'})
        }

# Function to delete records from the DB
def delete_records(path_params):
    if path_params is not None  and 'id' in path_params:
        # Delete an item by ID
        table.delete_item(Key={'id': path_params['id']})
        item = {'id': path_params['id']}
        print("Details deletion skipped Successfully")
    else:
        # Return an error if the ID is not provided
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing Person ID'})
        }

def multiparttojson(content):
    
    #print(f"Content : {content}")
    try: 
        return json.loads(content)
    except Exception as e:
        data = defaultdict(list)
        boundary = re.findall(r'------(.+)', content)[0]
        parts = content.split(f'------{boundary}')
        
        for part in parts[1:-1]:
            match = re.search(r'Content-Disposition: form-data; name="(.+?)"\r\n\r\n(.+?)\r\n', part)
            if match:
                name, value = match.groups()
                if name != "magic" and name != "images":
                    data[name] = value
        
        # Convert to JSON format
        json_data = json.dumps(data, indent=4)
        return json_data

def lambda_handler(event, context):

    #print(f"Received event: {event}")
    try:
        origin = event['headers'].get("origin","")
        if origin != "https://imifindia.github.io":
            print("Request Not Allowed")
            return {
                'statusCode': 501,
                'statusDescription': 'Request Not Allowed'
            }
        x_forwarded_for = event['headers'].get("X-Forwarded-For","")
        print(f"X-Forwarded-For: {x_forwarded_for}")
    except Exception as e:
        print("Header missing in the request. Cannot proceed.")
        exit(0)
    
    # Get the HTTP method from the API Gateway event
    http_method = event['httpMethod']
    print(f"http_method: {http_method}")
    
    # Get the path parameters (if any)
    path_params = event.get('pathParameters', {})
    print(f"path_params: {path_params}")
    
    # Get the query string parameters (if any)
    query_params = event.get('queryStringParameters', {})
    print(f"query_params: {query_params}")

    request_body = ""
    item = ""
    status_message = ""

    # Perform the requested operation based on the HTTP method
    if http_method == 'GET':
        print("Inside Get")
        item = get_records(path_params, query_params)
    elif http_method == 'POST':
        # Get the request body (if any)
        requestbody = event.get('body', '')
        print(requestbody)
        #request_body = multiparttojson(requestbody)
        request_body = json.loads(requestbody)

        request_body['id'] = str(uuid.uuid4())
        request_body['user_details'] = x_forwarded_for
        request_body['updated_time'] = current_datetime_ist
        print(f"request_body: {request_body}")        
        print("Inside Post")
        add_records(request_body)
    elif http_method == 'PUT':
        # Get the request body (if any)
        requestbody = event.get('body', '')
        print(requestbody)
        #request_body = multiparttojson(requestbody)
        request_body = json.loads(requestbody)
        print("Inside Put")
        update_records(query_params, request_body, x_forwarded_for)
    elif http_method == 'DELETE':
        print("Inside Delete")
        # Delete Skipped for now
        print("Delete Skipped")
        #delete_records(path_params, request_body)
    else:
        # Return an error for unsupported HTTP methods
        print("ERROR: unsupported methods")
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Return the response
    print("SUCCESS: Sending Response")
    print(json.dumps(item))
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },        
        'body': json.dumps(item)
    }
