# Hướng dẫn triển khai hệ thống

## Tổng quan
Hệ thống gồm 3 service chính:
- **Driver Service**
- **User Service**
- **Trip Service**

README này hướng dẫn triển khai trên **Local** và **AWS Cloud**.

---

## 1. Triển khai trên môi trường Local

**Yêu cầu:**
- Docker
- Docker Compose

**Các bước triển khai:**

### Checklist
- [ ] Cài Docker & Docker Compose
- [ ] Chạy Driver Service
- [ ] Chạy User Service
- [ ] Chạy Trip Service

### Lệnh triển khai

**Driver Service:**
~~~bash
docker compose -f 'DriverService/server/docker-compose.yml' up -d --build driver-service
~~~

**User Service:**
~~~bash
docker compose -f 'UserService/compose.yaml' up -d --build server
~~~

**Trip Service:**
~~~bash
docker compose -f 'TripService/trip-service/docker-compose.yml' up -d --build trip-service
~~~

---

## 2. Triển khai trên môi trường Cloud (AWS)

**Yêu cầu:**
- IAM User với các policy:
  - `AmazonEC2ContainerRegistryFullAccess`
  - `AmazonEC2FullAccess`
  - `AmazonElastiCacheFullAccess`
  - `AmazonS3FullAccess`
  - `AmazonVPCFullAccess`
  - `IAMFullAccess`
  - `AmazonSSMFullAccess`
  - `SecretsManagerReadWrite`
- AWS CLI (`aws configure`)
- Terraform

### 2.1 Triển khai Driver Service trên AWS

#### Checklist
- [ ] Khởi tạo Terraform
- [ ] Tạo file biến môi trường `ec2.env`
- [ ] Áp dụng Terraform
- [ ] Chạy Docker trên EC2
- [ ] Đẩy dữ liệu lên S3
- [ ] Đẩy Docker image lên ECR
- [ ] Triển khai container trên EC2

#### Lệnh chi tiết

**1. Khởi tạo Terraform**
~~~bash
terraform -chdir=DriverService/infra init
~~~

**2. Tạo file `DriverService/infra/sm/ec2.env`**
~~~env
DATABASE_URL=postgresql://username:password@endpoint:5432/postgres?sslmode=require
REDIS_HOST=endpoint
REDIS_PORT=6379
TRIP_SERVICE_URL=https://uitgo-trip-service.azurewebsites.net
ECR_URL=endpoint/repo
SALT_ROUND=12
SECRET=secure
EXPIRY=15m
~~~

**3. Áp dụng Terraform**
~~~bash
terraform -chdir=DriverService/infra apply
~~~

**4. Chạy Driver Service trên AWS EC2**
~~~bash
docker compose -f 'DriverService/server/docker-compose.yml' up -d --build driver-service
~~~

**5. Đẩy dữ liệu lên S3**
~~~bash
bash DriverService/infra/s3/push_bucket_data.sh
~~~

**6. Đẩy Docker image lên ECR**
~~~bash
bash DriverService/infra/ecr/push_image.sh
~~~

**7. Triển khai Docker container trên EC2**
~~~bash
bash DriverService/infra/ec2/deploy.sh
~~~

---

## 3. Ghi chú quan trọng
- **Cập nhật đúng các biến môi trường** trước khi deploy (`DATABASE_URL`, `REDIS_HOST`, `ECR_URL`, ...).
- Đảm bảo Terraform và AWS CLI đã được cấu hình đúng.
- Kiểm tra version Docker, Docker Compose và AWS CLI để tránh lỗi deploy.

---

## 4. Tài liệu tham khảo
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Terraform](https://www.terraform.io/docs)
