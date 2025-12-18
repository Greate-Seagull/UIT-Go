# ADR: Sử dụng Redis để lưu vị trí tài xế

## Quyết định
Sử dụng **Redis** để lưu trữ vị trí hiện tại của tài xế thay vì SQL Engine như **PostgresQL**.

## Lý do
1. **Hiệu năng cao**: Redis lưu dữ liệu trên **memory**, nên các thao tác đọc/ghi có tốc độ cực nhanh, phù hợp với việc cập nhật vị trí nhiều liên tục của tài xế.
2. **Hỗ trợ dữ liệu địa lý**: Redis cung cấp các **Geo commands** (`GEOADD`, `GEORADIUS`, `GEODIST`) để lưu trữ và tìm kiếm vị trí theo kinh độ/vĩ độ, tính khoảng cách giữa các điểm, thuận tiện cho việc tìm tài xế gần khách hàng.