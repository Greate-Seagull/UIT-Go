#!/bin/bash

# Script to setup MySQL Master-Slave Replication
# Run this after docker-compose up

set -e

echo "=================================="
echo "MySQL Replication Setup Script"
echo "=================================="

# Configuration
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password_change_me}"
REPLICATION_USER="repl_user"
REPLICATION_PASSWORD="repl_password_change_me"
MASTER_CONTAINER="mysql-master"
SLAVE_CONTAINER="mysql-slave"

echo ""
echo "Step 0: Verifying server IDs are different..."
MASTER_SERVER_ID=$(docker exec $MASTER_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -BN -e "SELECT @@server_id;" 2>/dev/null)
SLAVE_SERVER_ID=$(docker exec $SLAVE_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -BN -e "SELECT @@server_id;" 2>/dev/null)

echo "Master Server ID: $MASTER_SERVER_ID"
echo "Slave Server ID: $SLAVE_SERVER_ID"

if [ "$MASTER_SERVER_ID" == "$SLAVE_SERVER_ID" ]; then
    echo "ERROR: Master and Slave have the same server-id!"
    echo "Please check your my.cnf files and restart containers."
    exit 1
fi

echo "✓ Server IDs are different"

echo ""
echo "Step 1: Waiting for MySQL containers to be healthy..."
sleep 15

# Check if containers are running
if ! docker ps | grep -q "$MASTER_CONTAINER"; then
    echo "Error: Master container is not running!"
    exit 1
fi

if ! docker ps | grep -q "$SLAVE_CONTAINER"; then
    echo "Error: Slave container is not running!"
    exit 1
fi

echo "✓ Containers are running"

echo ""
echo "Step 2: Creating replication user on Master..."
docker exec -i $MASTER_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    CREATE USER IF NOT EXISTS '$REPLICATION_USER'@'%' IDENTIFIED WITH mysql_native_password BY '$REPLICATION_PASSWORD';
    GRANT REPLICATION SLAVE ON *.* TO '$REPLICATION_USER'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "✓ Replication user created"

echo ""
echo "Step 3: Getting Master status..."
MASTER_STATUS=$(docker exec $MASTER_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW MASTER STATUS\G")
echo "$MASTER_STATUS"

# Extract log file and position
LOG_FILE=$(echo "$MASTER_STATUS" | grep "File:" | awk '{print $2}')
LOG_POS=$(echo "$MASTER_STATUS" | grep "Position:" | awk '{print $2}')

echo ""
echo "Master Log File: $LOG_FILE"
echo "Master Log Position: $LOG_POS"

if [ -z "$LOG_FILE" ] || [ -z "$LOG_POS" ]; then
    echo "Error: Could not get master status!"
    exit 1
fi

echo ""
echo "Step 4: Configuring Slave to connect to Master..."
docker exec -i $SLAVE_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    STOP SLAVE;
    RESET SLAVE ALL;
    
    CHANGE MASTER TO
        MASTER_HOST='$MASTER_CONTAINER',
        MASTER_USER='$REPLICATION_USER',
        MASTER_PASSWORD='$REPLICATION_PASSWORD',
        MASTER_LOG_FILE='$LOG_FILE',
        MASTER_LOG_POS=$LOG_POS,
        GET_MASTER_PUBLIC_KEY=1;
    
    START SLAVE;
EOSQL

echo "✓ Slave configured and started"

echo ""
echo "Step 5: Checking Slave status..."
sleep 3

SLAVE_STATUS=$(docker exec $SLAVE_CONTAINER mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW SLAVE STATUS\G")
echo "$SLAVE_STATUS"

# Check if replication is working
IO_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_IO_Running:" | awk '{print $2}')
SQL_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_SQL_Running:" | awk '{print $2}')

echo ""
echo "=================================="
echo "Replication Status:"
echo "=================================="
echo "Slave_IO_Running: $IO_RUNNING"
echo "Slave_SQL_Running: $SQL_RUNNING"

if [ "$IO_RUNNING" == "Yes" ] && [ "$SQL_RUNNING" == "Yes" ]; then
    echo ""
    echo "✓✓✓ SUCCESS! Replication is working properly! ✓✓✓"
    echo ""
    echo "Master: mysql-master:3306"
    echo "Slave:  mysql-slave:3306"
    echo ""
    echo "You can now run Django migrations:"
    echo "  docker-compose exec server python manage.py migrate"
    echo ""
else
    echo ""
    echo "✗✗✗ WARNING! Replication may not be working properly ✗✗✗"
    echo "Please check the error messages above"
    echo ""
    
    # Show last error
    LAST_IO_ERROR=$(echo "$SLAVE_STATUS" | grep "Last_IO_Error:" | cut -d: -f2-)
    LAST_SQL_ERROR=$(echo "$SLAVE_STATUS" | grep "Last_SQL_Error:" | cut -d: -f2-)
    
    if [ ! -z "$LAST_IO_ERROR" ]; then
        echo "Last IO Error: $LAST_IO_ERROR"
    fi
    
    if [ ! -z "$LAST_SQL_ERROR" ]; then
        echo "Last SQL Error: $LAST_SQL_ERROR"
    fi
fi

echo ""
echo "=================================="