ROOT_DIR=$(cd .. && pwd)
BUCKET=$(terraform -chdir=$ROOT_DIR output -raw compose_bucket_name)
FILE="docker-compose.yml"

aws s3 cp $FILE s3://$BUCKET/$FILE