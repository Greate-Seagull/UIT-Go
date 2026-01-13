#!/bin/bash

# Script to fix replication issues
set -e

echo "========================================="
echo "  FIX MySQL Replication Issues"
echo "========================================="
echo ""

echo "Step 1: Stopping containers..."
docker-compose down

echo "✓ Containers stopped"
echo ""

echo "Step 2: Removing old MySQL volumes..."
docker volume rm $(docker volume ls -q | grep mysql) 2>/dev/null || echo "No volumes to remove"

echo "✓ Volumes removed"
echo ""

echo "Step 3: Fixing config file permissions..."
chmod 644 mysql/master/my.cnf 2>/dev/null || true
chmod 644 mysql/slave/my.cnf 2>/dev/null || true

echo "✓ Permissions fixed"
echo ""

echo "Step 4: Verifying config files..."

echo "Checking Master config..."
if grep -q "server-id=1" mysql/master/my.cnf; then
    echo "✓ Master server-id=1 (correct)"
else
    echo "✗ ERROR: Master server-id not set to 1"
    exit 1
fi

echo "Checking Slave config..."
if grep -q "server-id=2" mysql/slave/my.cnf; then
    echo "✓ Slave server-id=2 (correct)"
else
    echo "✗ ERROR: Slave server-id not set to 2"
    exit 1
fi

echo ""
echo "Step 5: Checking .env file..."
if [ -f "UserService/.env" ]; then
    if grep -q "USER_SERVICE_DB_USER=root" UserService/.env 2>/dev/null; then
        echo "⚠ WARNING: You are using 'root' as database user"
        echo "  This may cause connection issues"
        echo "  Recommended: Use 'django_user' instead"
    else
        echo "✓ Database user configuration looks good"
    fi
else
    echo "⚠ WARNING: .env file not found at UserService/.env"
    echo "  Please create it from .env.example"
fi

echo ""
echo "Step 6: Starting containers with fresh configuration..."
docker-compose up -d

echo ""
echo "Waiting 30 seconds for MySQL to initialize..."
sleep 30

echo ""
echo "Step 7: Checking container health..."
docker-compose ps

echo ""
echo "Step 8: Verifying server IDs..."

MASTER_ID=$(docker exec mysql-master mysql -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" -BN -e "SELECT @@server_id;" 2>/dev/null || echo "ERROR")
SLAVE_ID=$(docker exec mysql-slave mysql -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" -BN -e "SELECT @@server_id;" 2>/dev/null || echo "ERROR")

echo "Master Server ID: $MASTER_ID"
echo "Slave Server ID: $SLAVE_ID"

if [ "$MASTER_ID" == "1" ] && [ "$SLAVE_ID" == "2" ]; then
    echo "✓✓✓ Server IDs are correct!"
    echo ""
    echo "========================================="
    echo "  Ready to setup replication!"
    echo "========================================="
    echo ""
    echo "Run this command:"
    echo "  ./setup-replication.sh"
    echo ""
else
    echo ""
    echo "✗✗✗ ERROR: Server IDs are not correct!"
    echo "Master should be 1, Slave should be 2"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker-compose logs mysql-master mysql-slave"
    echo "2. Verify config files: cat mysql/master/my.cnf | grep server-id"
    echo "3. Try running this script again"
fi

echo ""
echo "========================================="