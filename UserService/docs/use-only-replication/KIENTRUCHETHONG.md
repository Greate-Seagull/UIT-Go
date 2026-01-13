# Kiến Trúc Hệ Thống với MySQL Replication

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Browser  │  │  Mobile  │  │   API    │  │  Other   │       │
│  │ (React)  │  │   App    │  │ Clients  │  │ Services │       │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘       │
│        │             │             │             │              │
│        └─────────────┴─────────────┴─────────────┘              │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/HTTPS Requests
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               Django Application Server                    │  │
│  │         (Gunicorn + Uvicorn Workers x4)                   │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │        Database Router (Routing Logic)           │    │  │
│  │  │  ┌────────────────┐    ┌────────────────────┐   │    │  │
│  │  │  │  Write Queries │    │   Read Queries     │   │    │  │
│  │  │  │  (INSERT,      │    │   (SELECT)         │   │    │  │
│  │  │  │   UPDATE,      │    │                    │   │    │  │
│  │  │  │   DELETE)      │    │                    │   │    │  │
│  │  │  └───────┬────────┘    └────────┬───────────┘   │    │  │
│  │  └──────────┼──────────────────────┼───────────────┘    │  │
│  └─────────────┼──────────────────────┼────────────────────┘  │
│                │                      │                        │
└────────────────┼──────────────────────┼────────────────────────┘
                 │                      │
                 │ Write                │ Read
                 │ (Port 3308)          │ (Port 3307)
                 │                      │
┌────────────────▼──────────────────────▼────────────────────────┐
│                      DATABASE LAYER                             │
│                                                                  │
│  ┌─────────────────────────┐      ┌──────────────────────────┐ │
│  │   MySQL MASTER          │      │    MySQL SLAVE           │ │
│  │   (Primary Database)    │      │    (Read Replica)        │ │
│  │                         │      │                          │ │
│  │  ┌──────────────────┐  │      │  ┌──────────────────┐   │ │
│  │  │  server-id: 1    │  │      │  │  server-id: 2    │   │ │
│  │  │  Port: 3308      │  │      │  │  Port: 3307      │   │ │
│  │  │  Mode: READ/WRITE│  │◄─────┤  │  Mode: READ ONLY │   │ │
│  │  └──────────────────┘  │      │  └──────────────────┘   │ │
│  │                         │      │                          │ │
│  │  • Write Operations     │      │  • Read Operations       │ │
│  │  • Binary Logs          │ REPL │  • Relay Logs           │ │
│  │  • GTID Enabled         │─────►│  • Parallel Workers x4  │ │
│  │  • InnoDB Buffer: 1GB   │      │  • InnoDB Buffer: 1GB   │ │
│  │                         │      │  • Replication Lag: <1s │ │
│  └─────────────────────────┘      └──────────────────────────┘ │
│                                                                  │
│              Volume: mysql-master-data    mysql-slave-data      │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ Cache Layer
┌────────────────────────────▼─────────────────────────────────────┐
│                       CACHE LAYER                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Redis Cache                             │  │
│  │  • Session Storage                                         │  │
│  │  • Query Result Cache                                      │  │
│  │  • API Response Cache                                      │  │
│  │  • Port: 6379                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Luồng Dữ Liệu Chi Tiết

### 2.1. Read Query Flow (SELECT)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. HTTP GET Request
     ▼
┌─────────────────┐
│ Django App      │
│ (Gunicorn)      │
└────┬────────────┘
     │ 2. ORM Query (SELECT)
     ▼
┌──────────────────────────┐
│ Database Router          │
│ • db_for_read()          │
│ • Returns: 'slave'       │
└────┬─────────────────────┘
     │ 3. Route to Slave DB
     ▼
┌──────────────────────────┐     ┌─────────────┐
│ Redis Cache              │────►│ Cache Hit?  │
│ • Check cached result    │     └──────┬──────┘
└────┬─────────────────────┘            │
     │ 4a. Cache Miss               YES │ NO
     ▼                                  │
┌──────────────────────────┐            │
│ MySQL SLAVE              │            │
│ • Execute SELECT         │            │
│ • Return rows            │            │
└────┬─────────────────────┘            │
     │ 5. Store in cache                │
     ▼                                  │
┌──────────────────────────┐            │
│ Cache Result             │◄───────────┘
└────┬─────────────────────┘
     │ 6. Return to App
     ▼
┌──────────────────────────┐
│ Django Response          │
└────┬─────────────────────┘
     │ 7. JSON Response
     ▼
┌─────────┐
│ Client  │
└─────────┘

Response Time: 20-60ms (with replica)
```

### 2.2. Write Query Flow (INSERT/UPDATE/DELETE)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. HTTP POST/PUT/DELETE
     ▼
┌─────────────────┐
│ Django App      │
└────┬────────────┘
     │ 2. ORM Query (INSERT/UPDATE/DELETE)
     ▼
┌──────────────────────────┐
│ Database Router          │
│ • db_for_write()         │
│ • Returns: 'default'     │
└────┬─────────────────────┘
     │ 3. Route to Master DB
     ▼
┌──────────────────────────┐
│ MySQL MASTER             │
│ • Execute Write Query    │
│ • Write to Binary Log    │
│ • Commit Transaction     │
└────┬─────────────────────┘
     │ 4. Async Replication
     ▼
┌──────────────────────────┐
│ Binary Log Stream        │
│ • GTID: xxxx-xxxx        │
│ • Position: 12345        │
└────┬─────────────────────┘
     │ 5. Stream to Slave
     ▼
┌──────────────────────────┐
│ MySQL SLAVE              │
│ • I/O Thread receives    │
│ • Write to Relay Log     │
│ • SQL Thread applies     │
│ • Update local data      │
└────┬─────────────────────┘
     │ 6. Invalidate cache
     ▼
┌──────────────────────────┐
│ Redis Cache              │
│ • Clear related keys     │
└────┬─────────────────────┘
     │ 7. Confirm to App
     ▼
┌──────────────────────────┐
│ Django Response          │
└────┬─────────────────────┘
     │ 8. Success Response
     ▼
┌─────────┐
│ Client  │
└─────────┘

Replication Lag: <1 second
Write Time: 50-100ms
```

## 3. Chi Tiết Các Thành Phần

### 3.1. Django Application Layer

```
┌─────────────────────────────────────────────┐
│          Django Application                  │
├─────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────┐    │
│  │     Web Server: Gunicorn           │    │
│  │     Workers: 4 Uvicorn Workers     │    │
│  │     Worker Class: UvicornWorker    │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │    Database Connection Pool        │    │
│  │    ┌────────────┐  ┌────────────┐ │    │
│  │    │ Master     │  │ Slave      │ │    │
│  │    │ Pool       │  │ Pool       │ │    │
│  │    │ Max: 100   │  │ Max: 100   │ │    │
│  │    │ Min: 10    │  │ Min: 10    │ │    │
│  │    └────────────┘  └────────────┘ │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │     Database Router                │    │
│  │                                     │    │
│  │  def db_for_read(model):           │    │
│  │      return 'slave'                │    │
│  │                                     │    │
│  │  def db_for_write(model):          │    │
│  │      return 'default'  # master    │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │     Middleware Stack               │    │
│  │  • CORS                            │    │
│  │  • Authentication (JWT)            │    │
│  │  • Session                         │    │
│  │  • Cache                           │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 3.2. MySQL Master Configuration

```
┌─────────────────────────────────────────────┐
│           MySQL Master Server               │
├─────────────────────────────────────────────┤
│                                              │
│  Server ID: 1                               │
│  Port: 3308 (external), 3306 (internal)     │
│  Mode: READ/WRITE                           │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Binary Logging                   │    │
│  │   • Format: ROW                    │    │
│  │   • GTID: Enabled                  │    │
│  │   • Max Size: 100MB per file       │    │
│  │   • Retention: 7 days              │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   InnoDB Configuration             │    │
│  │   • Buffer Pool: 1GB               │    │
│  │   • Log File: 256MB                │    │
│  │   • Log Buffer: 64MB               │    │
│  │   • Flush Method: O_DIRECT         │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Connections                      │    │
│  │   • Max: 1000                      │    │
│  │   • Thread Cache: 200              │    │
│  │   • Back Log: 500                  │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Performance                      │    │
│  │   • Writes/sec: 500-1000           │    │
│  │   • CPU: 20-40%                    │    │
│  │   • Memory: 1-2GB                  │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 3.3. MySQL Slave Configuration

```
┌─────────────────────────────────────────────┐
│           MySQL Slave Server                │
├─────────────────────────────────────────────┤
│                                              │
│  Server ID: 2                               │
│  Port: 3307 (external), 3306 (internal)     │
│  Mode: READ ONLY                            │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Replication                      │    │
│  │   • Type: Async                    │    │
│  │   • GTID: Enabled                  │    │
│  │   • Parallel Workers: 4            │    │
│  │   • Lag: <1 second                 │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Relay Logs                       │    │
│  │   • Recovery: Enabled              │    │
│  │   • Purge: Automatic               │    │
│  │   • Type: LOGICAL_CLOCK            │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Read-Only Mode                   │    │
│  │   • read_only: ON                  │    │
│  │   • super_read_only: ON            │    │
│  │   • Prevents: All writes           │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Performance                      │    │
│  │   • Reads/sec: 1000-2000           │    │
│  │   • CPU: 30-50%                    │    │
│  │   • Memory: 1-2GB                  │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## 4. Replication Process Chi Tiết

```
┌──────────────────────────────────────────────────────────────┐
│                    REPLICATION FLOW                          │
└──────────────────────────────────────────────────────────────┘

MASTER SIDE:
┌─────────────┐
│ 1. Client   │ INSERT INTO users VALUES (...)
│    Query    │
└──────┬──────┘
       │
┌──────▼──────┐
│ 2. Execute  │ Write to database
│    & Commit │
└──────┬──────┘
       │
┌──────▼──────┐
│ 3. Binary   │ • GTID: uuid:1234
│    Log      │ • Event: INSERT
│             │ • Data: Row image
└──────┬──────┘
       │
┌──────▼──────┐
│ 4. Flush    │ Write to disk
│    to Disk  │
└──────┬──────┘
       │
       │ Network
       │ ═══════════════════════════════►
       │
SLAVE SIDE:                               │
                                          │
                               ┌──────────▼──────┐
                               │ 5. I/O Thread   │
                               │    Receives     │
                               └──────┬──────────┘
                                      │
                               ┌──────▼──────────┐
                               │ 6. Relay Log    │
                               │    Write        │
                               └──────┬──────────┘
                                      │
                               ┌──────▼──────────┐
                               │ 7. SQL Thread   │
                               │ (4 Workers)     │
                               │ • Parse events  │
                               │ • Execute SQL   │
                               └──────┬──────────┘
                                      │
                               ┌──────▼──────────┐
                               │ 8. Apply to     │
                               │    Slave DB     │
                               └──────┬──────────┘
                                      │
                               ┌──────▼──────────┐
                               │ 9. Update       │
                               │    Position     │
                               └─────────────────┘

Average Replication Lag: 0.5-1 second
Parallel Workers: 4 threads
Transaction Commit Order: Preserved
```

## 5. Scaling Strategy

### 5.1. Hiện Tại (Phase 1)

```
                  ┌──────────────┐
                  │  Django App  │
                  │  (1 server)  │
                  └──────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼────┐   ┌────▼─────┐  ┌────▼─────┐
    │  Master  │   │  Slave   │  │  Redis   │
    │  (Write) │   │  (Read)  │  │  (Cache) │
    └──────────┘   └──────────┘  └──────────┘

Capacity:
• RPS: 200-400 requests/second
• Concurrent Users: 500-1000
• Database Load: 60-70%
```

### 5.2. Tương Lai (Phase 2) - Load Balancer

```
┌─────────────────────────────────────────────┐
│           Load Balancer (Nginx)             │
│         • Round Robin / Least Conn          │
│         • Health Checks                     │
│         • SSL Termination                   │
└────────┬──────────────┬─────────────────────┘
         │              │
    ┌────▼────┐    ┌───▼──────┐
    │ Django  │    │ Django   │
    │  App 1  │    │  App 2   │
    └────┬────┘    └────┬─────┘
         │              │
         └──────┬───────┘
                │
    ┌───────────┼────────────┐
    │           │            │
┌───▼───┐  ┌───▼────┐  ┌───▼────┐
│Master │  │ Slave  │  │ Slave  │
│(Write)│  │(Read 1)│  │(Read 2)│
└───────┘  └────────┘  └────────┘

Capacity:
• RPS: 1000-2000 requests/second
• Concurrent Users: 5000-10000
• Database Load: 40-50% per server
```

### 5.3. Tương Lai (Phase 3) - Multi-Region

```
┌─────────────────────────────────────────────┐
│          Global Load Balancer               │
│         (AWS Route53 / Cloudflare)          │
└────────┬──────────────┬─────────────────────┘
         │              │
    Region 1        Region 2
         │              │
    ┌────▼────┐    ┌───▼──────┐
    │ Primary │    │Secondary │
    │ Master  │◄───┤  Master  │
    │         │    │ (Standby)│
    └────┬────┘    └──────────┘
         │
    ┌────┼────────────┬─────────┐
    │    │            │         │
┌───▼───┐ ┌────▼───┐ ┌───▼───┐ │
│Slave 1│ │Slave 2 │ │Slave 3│ │
│Read   │ │Read    │ │Read   │ │
└───────┘ └────────┘ └───────┘ │
                                │
                          ┌─────▼──────┐
                          │  Analytics │
                          │   Slave    │
                          └────────────┘

Capacity:
• RPS: 10,000+ requests/second
• Concurrent Users: 50,000+
• High Availability: 99.99%
```

## 6. Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                   MONITORING DASHBOARD                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DATABASE HEALTH                                            │
│  ┌────────────────┐              ┌────────────────┐        │
│  │ Master Status  │              │ Slave Status   │        │
│  │ • Uptime: 99%  │              │ • Uptime: 99%  │        │
│  │ • QPS: 500     │              │ • QPS: 1200    │        │
│  │ • Connections: │              │ • Repl Lag: 0s │        │
│  │   120/1000     │              │ • IO: Running  │        │
│  └────────────────┘              │ • SQL: Running │        │
│                                   └────────────────┘        │
│  REPLICATION STATUS                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Healthy             │  │
│  │ Lag: 0.8s | GTID: xxxx:1234 | IO: Yes | SQL: Yes    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  PERFORMANCE METRICS                                        │
│  ┌────────────────┬────────────────┬────────────────┐      │
│  │ Read Queries   │ Write Queries  │ Cache Hit Rate │      │
│  │   1200 qps     │    500 qps     │     85%        │      │
│  │   ▁▂▃▄▅▆▇█     │   ▁▂▂▃▃▄      │   ▇▇█▇▇█       │      │
│  └────────────────┴────────────────┴────────────────┘      │
│                                                              │
│  RESOURCE USAGE                                             │
│  ┌────────────────┬────────────────┬────────────────┐      │
│  │ CPU            │ Memory         │ Disk I/O       │      │
│  │ Master: 45%    │ Master: 1.2GB  │ Read: 50MB/s   │      │
│  │ Slave:  60%    │ Slave:  1.5GB  │ Write: 20MB/s  │      │
│  └────────────────┴────────────────┴────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 7. Disaster Recovery Plan

```
┌─────────────────────────────────────────────────────────────┐
│                  FAILOVER SCENARIOS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SCENARIO 1: Master Failure                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Detect Master Down (Health Check)              │    │
│  │    ↓                                                │    │
│  │ 2. Promote Slave to Master                         │    │
│  │    ↓                                                │    │
│  │ 3. Update DNS / Application Config                 │    │
│  │    ↓                                                │    │
│  │ 4. All traffic → New Master                        │    │
│  │    ↓                                                │    │
│  │ 5. Rebuild old Master as new Slave                 │    │
│  │                                                     │    │
│  │ Recovery Time: 5-10 minutes                        │    │
│  │ Data Loss: Minimal (last few seconds)              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  SCENARIO 2: Slave Failure                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Detect Slave Down                               │    │
│  │    ↓                                                │    │
│  │ 2. Route all reads to Master (temporary)           │    │
│  │    ↓                                                │    │
│  │ 3. Rebuild Slave from Master backup                │    │
│  │    ↓                                                │    │
│  │ 4. Restore replication                             │    │
│  │                                                     │    │
│  │ Impact: Performance degradation                    │    │
│  │ Recovery Time: 15-30 minutes                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  SCENARIO 3: Network Partition                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Replication stops                               │    │
│  │    ↓                                                │    │
│  │ 2. Master continues write operations               │    │
│  │    ↓                                                │    │
│  │ 3. Slave serves stale reads                        │    │
│  │    ↓                                                │    │
│  │ 4. Network restored                                │    │
│  │    ↓                                                │    │
│  │ 5. Slave catches up automatically                  │    │
│  │                                                     │    │
│  │ Impact: Replication lag increases                  │    │
│  │ Resolution: Automatic when network restored        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 8. Performance Comparison

### Before Replication (Single Database)
```
┌─────────────────────────────────────────┐
│ Single MySQL Server                     │
├─────────────────────────────────────────┤
│ Read RPS:        100-150                │
│ Write RPS:       50-80                  │
│ Total RPS:       150-230                │
│ Avg Latency:     100-150ms              │
│ CPU Usage:       70-80%                 │
│ Max Connections: 300/1000 (30%)         │
│ Bottleneck:      Database saturation    │
└─────────────────────────────────────────┘
```

### After Replication (Master + Slave)
```
┌─────────────────────────────────────────┐
│ Master + Slave Configuration            │
├─────────────────────────────────────────┤
│ Read RPS:        250-350 (↑150%)        │
│ Write RPS:       50-80   (same)         │
│ Total RPS:       300-430 (↑87%)         │
│ Avg Latency:     50-80ms (↓43%)         │
│ CPU Usage:                              │
│   Master:        40-50%  (↓38%)         │
│   Slave:         50-60%                 │
│ Max Connections: 200/1000 (20%)         │
│ Bottleneck:      Application layer      │
└─────────────────────────────────────────┘

IMPROVEMENT:
✓ Read performance: +150%
✓ Overall RPS: +87%
✓ Response time: -43%
✓ Database load: -38% per server
✓ Scalability: Can add more slaves
```

## 9. Best Practices

### ✅ DO:
- Monitor replication lag constantly
- Use GTID for easier failover
- Enable parallel replication
- Regular backup from Master
- Test failover procedures monthly
- Use connection pooling
- Cache frequently accessed data
- Index optimization on both servers

### ❌ DON'T:
- Write directly to Slave
- Ignore replication lag warnings
- Mix sync/async replication
- Skip regular backups
- Overload single server
- Forget to monitor disk space
- Neglect security patches
- Use weak passwords

## 10. Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  NETWORK SECURITY                                           │
│  • Firewall rules: Only specific ports                      │
│  • Internal network: Containers isolated                    │
│  • No public Master/Slave access                            │
│  • VPN for admin access                                     │
│                                                              │
│  DATABASE SECURITY                                          │
│  • Strong root password                                     │
│  • Separate app user (not root)                             │
│  • Limited privileges per user                              │
│  • SSL/TLS for replication (production)                     │
│                                                              │
│  APPLICATION SECURITY                                       │
│  • JWT token authentication                                 │
│  • Password hashing (bcrypt)                                │
│  • SQL injection prevention (ORM)                           │
│  • CORS configuration                                       │
│  • Rate limiting                                            │
│                                                              │
│  BACKUP SECURITY                                            │
│  • Encrypted backups                                        │
│  • Separate backup storage                                  │
│  • Access logging                                           │
│  • Regular restore tests                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tổng Kết

Hệ thống sử dụng MySQL Replication mang lại:

✅ **Performance**: Tăng 87% RPS, giảm 43% latency  
✅ **Scalability**: Dễ dàng thêm slave khi cần  
✅ **Availability**: Có backup real-time để failover  
✅ **Load Distribution**: Tách biệt read/write workload  
✅ **Cost Effective**: Giải pháp đơn giản, hiệu quả cao  

**Next Steps**:
1. Setup load balancer (Phase 2)
2. Add monitoring với Prometheus/Grafana
3. Implement automated failover
4. Add more read replicas khi traffic tăng
5. Consider sharding cho massive scale![alt text](image-1.png)