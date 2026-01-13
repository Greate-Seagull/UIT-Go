#!/bin/bash

# Complete reset and rebuild script
set -e

echo "========================================="
echo "  COMPLETE RESET & REBUILD"
echo "========================================="
echo ""
echo "⚠️  WARNING: This will delete all MySQL data!"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1: Stopping all containers..."
docker-compose down
echo "✓ Stopped"

echo ""
echo "Step 2: Removing MySQL volumes..."
docker volume rm userservice_mysql-master-data 2>/dev/null && echo "  ✓ Removed mysql-master-data" || echo "  - mysql-master-data not found"
docker volume rm userservice_mysql-slave-data 2>/dev/null && echo "  ✓ Removed mysql-slave-data" || echo "  - mysql-slave-data not found"
docker volume rm userservice_redis-data 2>/dev/null && echo "  ✓ Removed redis-data" || echo "  - redis-data not found"

# Alternative: prune all dangling volumes
docker volume prune -f

echo ""
echo "Step 3: Removing containers (if any)..."
docker rm -f mysql-master mysql-slave redis django-app 2>/dev/null || echo "  - No containers to remove"

echo ""
echo "Step 4: Creating log directories..."
mkdir -p mysql/logs/master mysql/logs/slave
chmod 755 mysql/logs/master mysql/logs/slave

echo ""
echo "Step 5: Fixing config file permissions..."
chmod 644 mysql/master/my.cnf
chmod 644 mysql/slave/my.cnf
echo "✓ Permissions set to 644"

echo ""
echo "Step 6: Verifying config files..."
MASTER_ID=$(grep "^server-id=" mysql/master/my.cnf | cut -d= -f2 | tr -d ' ')
SLAVE_ID=$(grep "^server-id=" mysql/slave/my.cnf | cut -d= -f2 | tr -d ' ')

echo "  Master config: server-id=$MASTER_ID"
echo "  Slave config: server-id=$SLAVE_ID"



echo "✓ Config files are correct"

echo ""
echo "Step 7: Checking .env file..."
if [ ! -f "UserService/.env" ]; then
    echo "  ✗ ERROR: UserService/.env not found!"
    echo "  Please create it from .env.example"
    exit 1
fi

echo "  Checking database credentials..."
if grep -q "USER_SERVICE_DB_USER=root" UserService/.env 2>/dev/null; then
    echo "  ⚠️  WARNING: Using 'root' as DB user may cause issues"
    echo "  Recommended: Change to 'django_user'"
    read -p "  Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

echo "✓ .env file exists"

echo ""
echo "Step 8: Building and starting containers..."
docker-compose up -d --build

echo ""
echo "Step 9: Waiting for MySQL to initialize (45 seconds)..."
for i in {45..1}; do
    echo -ne "  Waiting: $i seconds\r"
    sleep 1
done
echo ""

echo ""
echo "Step 10: Verifying containers are running..."
docker-compose ps

echo ""
echo "Step 11: Testing MySQL connections..."
sleep 5

echo "  Testing Master..."
docker exec mysql-master mysqladmin ping -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" 2>/dev/null && echo "    ✓ Master is alive" || echo "    ✗ Master connection failed"

echo "  Testing Slave..."
docker exec mysql-slave mysqladmin ping -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" 2>/dev/null && echo "    ✓ Slave is alive" || echo "    ✗ Slave connection failed"

echo ""
echo "Step 12: Verifying Server IDs..."
MASTER_SERVER_ID=$(docker exec mysql-master mysql -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" -BN -e "SELECT @@server_id;" 2>/dev/null || echo "ERROR")
SLAVE_SERVER_ID=$(docker exec mysql-slave mysql -uroot -p"${MYSQL_ROOT_PASSWORD:-root_password_change_me}" -BN -e "SELECT @@server_id;" 2>/dev/null || echo "ERROR")

echo "  Master Server ID: $MASTER_SERVER_ID"
echo "  Slave Server ID: $SLAVE_SERVER_ID"

if [ "$MASTER_SERVER_ID" == "1" ] && [ "$SLAVE_SERVER_ID" == "2" ]; then
    echo ""
    echo "========================================="
    echo "  ✓✓✓ SUCCESS! Ready for replication"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Setup replication:"
    echo "     ./setup-replication.sh"
    echo ""
    echo "  2. Run migrations:"
    echo "     docker-compose exec server python manage.py migrate"
    echo ""
    echo "  3. Create superuser:"
    echo "     docker-compose exec server python manage.py createsuperuser"
    echo ""
else
    echo ""
    echo "========================================="
    echo "  ✗✗✗ ERROR: Server IDs are incorrect!"
    echo "========================================="
    echo ""
    echo "Expected: Master=1, Slave=2"
    echo "Got: Master=$MASTER_SERVER_ID, Slave=$SLAVE_SERVER_ID"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Master logs:"
    echo "     docker logs mysql-master | tail -50"
    echo ""
    echo "  2. Check Slave logs:"
    echo "     docker logs mysql-slave | tail -50"
    echo ""
    echo "  3. Verify config in running container:"
    echo "     docker exec mysql-master cat /etc/mysql/conf.d/my.cnf | grep server-id"
    echo "     docker exec mysql-slave cat /etc/mysql/conf.d/my.cnf | grep server-id"
    echo ""
    echo "  4. Check if config is being loaded:"
    echo "     docker exec mysql-master mysql -uroot -p -e 'SHOW VARIABLES LIKE \"server_id\";'"
    echo "     docker exec mysql-slave mysql -uroot -p -e 'SHOW VARIABLES LIKE \"server_id\";'"
    echo ""
fi

echo "========================================="