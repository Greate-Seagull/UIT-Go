# ADR: Sử dụng cache cho các server

## Quyết định
Sử dụng **cache** để lưu trữ dữ liệu tạm thời và truy cập thông tin nhanh hơn, giảm tải cho các database chính.

## Lý do
1. **Tăng hiệu năng**: cache giúp truy xuất dữ liệu thường xuyên sử dụng mà không cần query database, giảm độ trễ.
2. **Giảm tải database**: giảm số lượng truy vấn trực tiếp, tránh bottleneck khi lượng request lớn.

## Trade-off
- **Thời gian xử lý có thể tăng**: Nếu tỷ lệ cache miss cao, server phải truy vấn trực tiếp vào cơ sở dữ liệu hoặc thực hiện logic xử lý phức tạp, dẫn đến thời gian phản hồi chậm hơn và tăng tải hệ thống.
- **Dữ liệu có thể không đồng bộ**: cache chỉ là bản copy tạm thời, nếu DB thay đổi mà cache chưa cập nhật, có thể đọc dữ liệu cũ.
- **Chọn cơ chế làm mới phù hợp**: cần cơ chế **invalidate / TTL / cập nhật đồng bộ** và chọn giá trị phù hợp để đảm bảo dữ liệu không lỗi thời.
- **Chi phí và quản lý**: cần triển khai, monitor và backup hệ thống cache.