import json
import os
import boto3
import uuid

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):

    #print(f"Received event: {event}")
    try:
        x_forwarded_for = event['headers'].get("X-Forwarded-For","")
        print(f"X-Forwarded-For: {x_forwarded_for}")
    except Exception as e:
        print("X-Forwarded-For header missing in the request. Cannot proceed.")
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
        request_body = json.loads(event.get('body', '{}'))
        request_body['id'] = str(uuid.uuid4())
        request_body['user_details'] = x_forwarded_for
        print(f"request_body: {request_body}")
    
    # Perform the requested operation based on the HTTP method
    if http_method == 'GET':
        if path_params is not None and 'id' in path_params:
            # Get a single item by ID
            response = table.get_item(Key={'id': path_params['id']})
            item = response.get('Item')
            print("Record Detail fetched successfully")
        else:
            # Scan the table for all items
            response = table.scan()
            item = response.get('Items', [])
            print(f"{len(item)} Records fetched successfully")
    elif http_method == 'POST':
        # Create a new item
        table.put_item(Item=request_body)
        item = request_body
        print("Detailed captured successfully")
    elif http_method == 'PUT':
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
    elif http_method == 'DELETE':
        if path_params is not None  and 'id' in path_params:
            # Delete an item by ID
            #table.delete_item(Key={'id': path_params['id']})
            #item = {'id': path_params['id']}
            print("Details deletion skipped Successfully")
        else:
            # Return an error if the ID is not provided
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing Person ID'})
            }
    else:
        # Return an error for unsupported HTTP methods
        print("ERROR: unsupported HTTP methods")
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
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },        
        'body': json.dumps(item)
    }
