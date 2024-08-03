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
unwanted_fields = ['id', 'user_details']

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
        person["created_at"] = current_datetime_ist
        person["report_id"] = request_body["id"]
        person['up_vote'] = "0"
        person['down_vote'] = "0"
        person['prev_status'] = ""
        person['prev_counter'] = "0"
        # Insert into Person Details table
        persons_table.put_item(Item=person)
        print(f"Person Details added successfully {person}")
    #remove person records from request
    del request_body["persons"]
    # Create a new report
    table.put_item(Item=request_body)
    print(f"Report Details added successfully {request_body}")

    #item = request_body
    print("Detailed captured successfully")

# Function to update records in the DB
def update_records(path_params, request_body):
    if 'id' in path_params:
        # Update an existing item
        table.put_item(Item={**request_body, 'id': path_params['id']})
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
    if http_method != 'GET':
        # Get the request body (if any)
        requestbody = event.get('body', '')
        print(requestbody)
        #request_body = multiparttojson(requestbody)
        request_body = json.loads(requestbody)

        request_body['id'] = str(uuid.uuid4())
        request_body['user_details'] = x_forwarded_for
        request_body['updated_time'] = current_datetime_ist
        print(f"request_body: {request_body}")
    
    # Perform the requested operation based on the HTTP method
    if http_method == 'GET':
        item = get_records(path_params, query_params)
    elif http_method == 'POST':
        add_records(request_body)
    elif http_method == 'PUT':
        update_records(path_params, request_body)
    elif http_method == 'DELETE':
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
