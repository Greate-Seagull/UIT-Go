# ADR: Sử dụng tRPC để truy cập vị trí tài xế

## Quyết định
Sử dụng **tRPC** để truy cập và cập nhật vị trí hiện tại của tài xế thay vì dùng **REST API**.

## Lý do
1. **Type-safe và end-to-end**: tRPC cho phép client và server chia sẻ **type** trực tiếp, tránh lỗi kiểu dữ liệu và giảm thời gian viết validation.
3. **Realtime-friendly**: tRPC kết hợp tốt với WebSocket hoặc subscription, phù hợp cho việc cập nhật vị trí tài xế **theo thời gian thực**.

## Trade-off
- **Tích hợp client-server chặt chẽ**: client phụ thuộc trực tiếp vào server types, nên thay đổi server có thể yêu cầu cập nhật client.
- **Không phải tất cả tool hỗ trợ**: một số tool, middleware hoặc API gateway thiết kế cho REST/GraphQL sẽ cần tùy chỉnh để tích hợp tRPC.