supabase config

docker-compose.yml

kong environment:
KONG_PORT_MAPS: 443:8000

storage environment:
STORAGE_BACKEND: s3
TENANT_ID: stub
REGION: us-east-1
GLOBAL_S3_BUCKET: supabase
STORAGE_S3_ENDPOINT: https://s3.pub2.infomaniak.cloud
STORAGE_S3_FORCE_PATH_STYLE: "true"
AWS_ACCESS_KEY_ID:
AWS_SECRET_ACCESS_KEY:
TUS_ALLOW_S3_TAGS: "false"
REQUEST_ALLOW_X_FORWARDED_PATH: "true"
NODE_ENV: production
