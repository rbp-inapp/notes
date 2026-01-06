import boto3
import os
from botocore.exceptions import ClientError

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def upload_file(file_content: str, key: str):
    try:
        s3_client.put_object(Bucket=AWS_BUCKET_NAME, Key=key, Body=file_content)
        return True
    except ClientError as e:
        print(e)
        return False

def get_presigned_url(key: str):
    try:
        url = s3_client.generate_presigned_url('get_object',
                                                Params={'Bucket': AWS_BUCKET_NAME,
                                                        'Key': key},
                                                ExpiresIn=3600)
        return url
    except ClientError as e:
        print(e)
        return None

def delete_file(key: str):
    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=key)
        return True
    except ClientError as e:
        print(e)
        return False
