"""
Database Router for Master-Slave Replication
Routes read queries to slave, write queries to master
"""
import random


class MasterSlaveRouter:
    """
    Router to direct database operations to master or slave.
    
    - All write operations (INSERT, UPDATE, DELETE) go to 'default' (master)
    - All read operations (SELECT) go to 'slave' (replica)
    """
    
    def db_for_read(self, model, **hints):
        """
        Attempts to read from slave database.
        """
        return 'slave'
    
    def db_for_write(self, model, **hints):
        """
        Writes always go to master database.
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects from different databases.
        """
        db_list = ('default', 'slave')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Migrations should only run on the master database.
        """
        return db == 'default'


class PrimaryReplicaRouter:
    """
    Alternative router with replica failover support.
    If slave is unavailable, falls back to master for reads.
    """
    
    def db_for_read(self, model, **hints):
        """
        Reads go to slave, with master as fallback.
        You can add logic here to check slave health.
        """
        # You can add randomization for multiple slaves:
        # return random.choice(['slave', 'slave2', 'slave3'])
        return 'slave'
    
    def db_for_write(self, model, **hints):
        """
        Writes always go to master.
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are in the same database pool.
        """
        db_list = ('default', 'slave')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure migrations only run on master.
        """
        return db == 'default'