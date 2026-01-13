# Tối Ưu Hóa Kiến Trúc Load Balancing cho 1000+ RPS

## Tổng Quan Kiến Trúc

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    NGINX    │ (Load Balancer)
                    │   Port 80   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     ┌────▼───┐       ┌────▼───┐      ┌────▼───┐
     │Django 1│       │Django 2│ ...  │Django 4│
     └────┬───┘       └────┬───┘      └────┬───┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼──────┐
                    │  ProxySQL   │ (Connection Pool)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     ┌────▼────┐      ┌────▼─────┐    ┌────▼─────┐
     │ Master  │      │ Replica1 │    │ Replica2 │
     │ (Write) │      │  (Read)  │    │  (Read)  │
     └─────────┘      └──────────┘    └──────────┘
          │                ▲                ▲
          └────────────────┴────────────────┘
                    (Replication)
                    
          ┌─────────────┐
          │    Redis    │ (Cache)
          └─────────────┘
```

## Các Tối Ưu Hóa Đã Thực Hiện

### 1. ✅ NGINX Load Balancer

**File:** `nginx/nginx.conf`

**Các tối ưu:**
- Tăng `worker_connections` từ 4096 → 8192
- Tăng `worker_rlimit_nofile` từ 65535 → 100000
- Tăng `keepalive_requests` từ 1000 → 10000
- Tăng `keepalive` trong upstream từ 64 → 256
- Tối ưu buffer sizes cho high throughput
- Tăng rate limiting từ 200r/s → 500r/s với burst 1000
- Tối ưu proxy timeouts và buffering

**Kết quả:** NGINX có thể xử lý 1000+ concurrent connections và route requests hiệu quả hơn.

### 2. ✅ Django Application Servers (Gunicorn)

**File:** `Dockerfile`

**Các tối ưu:**
- Tăng workers từ 4 → 8 workers/server
- Tăng `worker-connections` từ 1000 → 2000
- Tăng `max-requests` từ 1000 → 5000 (giảm overhead restart)
- Tăng timeouts từ 30s → 60s
- Thêm `--preload` để tải ứng dụng trước khi fork workers
- Sử dụng `/dev/shm` cho worker temp directory (RAM disk)

**Tổng workers:** 4 servers × 8 workers = 32 workers total

**Kết quả:** Mỗi server có thể xử lý ~250-300 RPS, tổng ~1000-1200 RPS.

### 3. ✅ ProxySQL Configuration

**File:** `proxysql/proxysql.cnf` và `setup.sh`

**Các tối ưu:**
- Cấu hình read/write splitting tự động
- SELECT queries → Replicas (hostgroup 1)
- SELECT ... FOR UPDATE → Master (hostgroup 0)
- Write queries → Master (hostgroup 0)
- Connection pooling với max_connections = 1000/user
- Tự động cấu hình trong setup.sh

**Kết quả:** Giảm tải trên Master, phân tán read queries sang Replicas.

### 4. ✅ MySQL Master Configuration

**File:** `mysql/master/my.cnf`

**Các tối ưu:**
- Tăng `max_connections` từ 500 → 1000
- Tăng `innodb_buffer_pool_size` từ 512M → 1G
- Tăng `innodb_log_file_size` từ 128M → 256M
- Tối ưu InnoDB I/O threads (8 read, 8 write)
- Tăng `table_open_cache` từ 4000 → 8000
- Tắt Performance Schema (tiết kiệm memory)
- Tắt Query Cache (deprecated trong MySQL 8.0)

**Kết quả:** Master có thể xử lý nhiều write operations đồng thời hơn.

### 5. ✅ MySQL Replica Configuration

**File:** `mysql/replica/my.cnf`

**Các tối ưu:**
- Tương tự Master nhưng tối ưu cho read operations
- Bật `slave_parallel_workers = 4` cho parallel replication
- Sử dụng `LOGICAL_CLOCK` replication
- `read_only = 1` và `super_read_only = 1`

**Kết quả:** Replicas có thể xử lý nhiều read queries song song.

### 6. ✅ Redis Cache

**File:** `compose.yaml`

**Các tối ưu:**
- Tăng `maxmemory` từ 512mb → 1gb
- Tắt persistence (`--save ""`, `--appendonly no`) cho performance
- Tối ưu TCP settings
- Thêm healthcheck

**Kết quả:** Redis có thể cache nhiều data hơn và response nhanh hơn.

### 7. ✅ Django Database Connection Pooling

**File:** `UserService/UserService/settings.py`

**Các tối ưu:**
- Thêm `CONN_MAX_AGE = 300` (5 phút) để reuse connections
- Tối ưu database options
- Disable `ATOMIC_REQUESTS` cho performance

**Kết quả:** Giảm overhead tạo connection mới, tăng throughput.

## Ước Tính Hiệu Năng

### Capacity Planning

**NGINX:**
- Worker connections: 8192 × số workers
- Có thể xử lý: 10,000+ concurrent connections

**Django Servers:**
- 4 servers × 8 workers = 32 workers
- Mỗi worker: ~30-40 RPS
- **Tổng: ~1000-1200 RPS**

**Database:**
- Master: ~200-300 write RPS
- Replicas: ~400-600 read RPS mỗi replica
- ProxySQL: Connection pooling giảm overhead

**Redis:**
- Có thể xử lý: 100,000+ ops/second

## Các Vấn Đề Đã Sửa

1. ✅ **Thiếu ProxySQL configuration** - Đã tạo file cấu hình và script setup tự động
2. ✅ **Thiếu database connection pooling** - Đã thêm CONN_MAX_AGE
3. ✅ **Gunicorn workers chưa tối ưu** - Đã tăng workers và optimize settings
4. ✅ **MySQL chưa tối ưu cho high performance** - Đã optimize buffer pools và connections
5. ✅ **NGINX chưa tối ưu cho high throughput** - Đã tăng limits và optimize buffers
6. ✅ **Redis chưa tối ưu** - Đã tăng memory và tắt persistence

## Khuyến Nghị Để Đạt 1000+ RPS

### 1. Hardware Requirements

**Tối thiểu:**
- CPU: 8+ cores
- RAM: 16GB+
- Disk: SSD recommended
- Network: 1Gbps+

**Khuyến nghị:**
- CPU: 16+ cores
- RAM: 32GB+
- Disk: NVMe SSD
- Network: 10Gbps

### 2. Monitoring

Cài đặt monitoring để theo dõi:
- NGINX: Request rate, response time, error rate
- Django: Worker utilization, request queue
- ProxySQL: Connection pool usage, query distribution
- MySQL: Connection count, query performance, replication lag
- Redis: Memory usage, hit rate

### 3. Load Testing

Sử dụng tools như:
- `wrk` hoặc `ab` (Apache Bench)
- `locust` cho Python
- `k6` cho JavaScript

**Ví dụ test:**
```bash
wrk -t12 -c400 -d30s http://localhost/api/v1/users/
```

### 4. Tối Ưu Thêm (Nếu Cần)

1. **Thêm Django servers** nếu cần scale hơn
2. **Thêm MySQL replicas** nếu read-heavy
3. **Sử dụng Redis Cluster** nếu cần scale cache
4. **CDN** cho static files
5. **Database indexing** - đảm bảo indexes được tối ưu
6. **Query optimization** - sử dụng `select_related` và `prefetch_related`
7. **Caching strategy** - cache các queries phổ biến

### 5. Production Checklist

- [ ] Disable DEBUG mode
- [ ] Set ALLOWED_HOSTS properly
- [ ] Use environment variables for secrets
- [ ] Enable SSL/TLS
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Load test before deployment
- [ ] Review and optimize database queries
- [ ] Enable database query logging for slow queries

## Cách Chạy

1. **Setup môi trường:**
```bash
cd UserService
chmod +x setup.sh
./setup.sh
```

2. **Kiểm tra status:**
```bash
docker-compose ps
```

3. **Xem logs:**
```bash
docker-compose logs -f nginx
docker-compose logs -f server-1
```

4. **Test performance:**
```bash
# Install wrk
# Ubuntu/Debian: sudo apt-get install wrk
# macOS: brew install wrk

# Run test
wrk -t12 -c400 -d30s http://localhost/api/v1/users/
```

## Lưu Ý

- Các cấu hình này được tối ưu cho **local development/testing**
- Cho **production**, cần điều chỉnh thêm:
  - Security settings
  - Logging và monitoring
  - Backup và disaster recovery
  - Resource limits trong Docker
  - Network security

## Kết Luận

Với các tối ưu hóa này, kiến trúc của bạn có khả năng đạt **1000+ RPS** trên local environment. Tuy nhiên, performance thực tế phụ thuộc vào:
- Hardware specifications
- Application logic complexity
- Database query performance
- Network latency
- Request patterns

Hãy load test để xác nhận performance thực tế!

