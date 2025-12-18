# ADR: Sử dụng Request Queue cho server

## Quyết định
Sử dụng **Request Queue** để lưu trữ và điều phối các request gửi đến server, giúp xử lý theo khả năng của server và tránh quá tải hệ thống.

## Lý do
1. **Giảm tải cho server**: Khi lượng request tăng đột biến, queue giúp "buffer" các request, tránh tình trạng server bị quá tải hoặc crash.
2. **Tăng độ tin cậy**: Queue giúp đảm bảo request không bị mất trong trường hợp server không xử lý kịp thời.

## Trade-off
- **Độ trễ cao hơn**: Request có thể không được xử lý ngay lập tức, đặc biệt khi queue dài.
- **Tăng độ phức tạp hạ tầng**: Cần triển khai thêm các thành phần như message broker (RabbitMQ, Kafka, SQS…).
- **Khó debug hơn**: Kiến trúc bất đồng bộ khiến việc theo dõi luồng request phức tạp hơn.
- **Chi phí vận hành**: Queue system cần giám sát, scale, backup và cấu hình thêm QoS.