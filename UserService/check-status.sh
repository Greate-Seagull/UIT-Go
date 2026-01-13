#!/bin/bash

# Quick status check script for MySQL Replication

MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password_change_me}"

echo "========================================="
echo "  MySQL Replication Status Check"
echo "========================================="
echo ""

# Check if containers are running
echo "1. Container Status:"
echo "-------------------------------------------"
docker-compose ps
echo ""

# Check Master status
echo "2. Master Status:"
echo "-------------------------------------------"
docker exec mysql-master mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW MASTER STATUS\G" 2>/dev/null || echo "Error connecting to Master"
echo ""

# Check Slave status
echo "3. Slave Status:"
echo "-------------------------------------------"
SLAVE_STATUS=$(docker exec mysql-slave mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW SLAVE STATUS\G" 2>/dev/null)

if [ -z "$SLAVE_STATUS" ]; then
    echo "Error: Cannot connect to Slave or replication not configured"
else
    IO_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_IO_Running:" | awk '{print $2}')
    SQL_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_SQL_Running:" | awk '{print $2}')
    SECONDS_BEHIND=$(echo "$SLAVE_STATUS" | grep "Seconds_Behind_Master:" | awk '{print $2}')
    LAST_ERROR=$(echo "$SLAVE_STATUS" | grep "Last_Error:" | cut -d: -f2-)
    
    echo "Slave_IO_Running:  $IO_RUNNING"
    echo "Slave_SQL_Running: $SQL_RUNNING"
    echo "Seconds_Behind_Master: $SECONDS_BEHIND"
    
    if [ "$IO_RUNNING" == "Yes" ] && [ "$SQL_RUNNING" == "Yes" ]; then
        echo ""
        echo "✓ Replication Status: HEALTHY"
        
        if [ "$SECONDS_BEHIND" == "0" ]; then
            echo "✓ Replication Lag: NONE"
        elif [ "$SECONDS_BEHIND" -lt 5 ]; then
            echo "⚠ Replication Lag: LOW ($SECONDS_BEHIND seconds)"
        else
            echo "✗ Replication Lag: HIGH ($SECONDS_BEHIND seconds)"
        fi
    else
        echo ""
        echo "✗ Replication Status: UNHEALTHY"
        if [ ! -z "$LAST_ERROR" ]; then
            echo "Last Error: $LAST_ERROR"
        fi
    fi
fi

echo ""

# Check connections
echo "4. Active Connections:"
echo "-------------------------------------------"
echo "Master:"
docker exec mysql-master mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | tail -n1
echo ""
echo "Slave:"
docker exec mysql-slave mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | tail -n1

echo ""
echo "========================================="
echo "  Check complete!"
echo "========================================="