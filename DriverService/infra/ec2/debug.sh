read -p "Enter command ID: " CMD_ID

aws ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "i-0815716b4fb184f6d" \
    --region ap-southeast-2