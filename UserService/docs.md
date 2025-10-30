
### 1. Danh sách và Tạo Người dùngEndpoint: /api/v1/users/ (Bao gồm từ CustomUser.urls)
View: CustomerUserListViewQuyền: AllowAny (Cho phép tất cả)
# GET http://127.0.0.1:8000/api/v1/users/
Lấy danh sách tất cả người dùng trong hệ thống.Phản hồi thành công (200 OK):
```sh
{
    "message": "Users list retrieved successfully",
    "data": [
        {
            "id": 1,
            "username": "user1",
            "email": "user1@example.com",
            "birth": "1990-01-01",
            "first_name": "User",
            "last_name": "One",
            "is_driver": false,
            "is_active": true,
            "phone": "0123456789"
        },
        // ... các người dùng khác
    ]
}
```


# POST http://127.0.0.1:8000/api/v1/users/
Tạo một người dùng mới.Nội dung yêu cầu (Request Body): (JSON)
```sh
{
    "email": "newuser@example.com",
    "password": "strongpassword123",
    "username": "newuser",
    "first_name": "New",
    "last_name": "User",
    "phone": "0987654321",
    "birth": "2000-12-31"
}
```
Lưu ý: Dựa trên hàm validate trong serializers.py, email và password là bắt buộc khi tạo mới.Phản hồi thành công (201 Created):

```sh
{
    "message": "User created successfully",
    "data": {
        "id": 3,
        "username": "newuser",
        "email": "newuser@example.com",
        "birth": "2000-12-31",
        "first_name": "New",
        "last_name": "User",
        "is_driver": false,
        "is_active": true,
        "phone": "0987654321"
    }
}
```
Phản hồi thất bại (400 Bad Request): (Ví dụ: thiếu trường bắt buộc)
```sh
{
    "message": "User creation failed",
    "errors": {
        "missing_fields": "Các trường bắt buộc khi tạo mới: email, password"
    }
}
```
## 2. Chi tiết, Cập nhật, và Xóa Người dùngEndpoint: /api/v1/users/<int:pk>/ (Bao gồm từ CustomUser.urls)
View: CustomerUserDetailViewQuyền: ReadOnlyOrIsAdmin (Ai cũng có thể xem, chỉ Admin mới có thể sửa/xóa)
# GET http://127.0.0.1:8000/api/v1/users/<int:pk>/
Lấy thông tin chi tiết của một người dùng cụ thể. Chỉ trả về người dùng nếu họ tồn tại và có is_active=True.Phản hồi thành công (200 OK):
```sh
JSON{
    "message": "User retrieved successful",
    "data": {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com",
        // ... các trường khác
    }
}
```
Phản hồi thất bại (400 Bad Request): (Ví dụ: không tìm thấy người dùng hoặc is_active=False)
```sh
JSON{
    "message": "User retrieved failed",
    "error": "User not found"
}
```

# PUT http://127.0.0.1:8000/api/v1/users/<int:pk>/
Cập nhật toàn bộ thông tin cho một người dùng. (Yêu cầu quyền Admin).
Nội dung yêu cầu (Request Body): (JSON)
Bạn có thể gửi bất kỳ trường nào từ Mô hình Đối tượng. Mật khẩu sẽ được băm (hash) lại nếu được cung cấp.
```sh
JSON{
    "first_name": "Updated Name",
    "phone": "111222333"
    // ... các trường khác
}
```
Phản hồi thành công (200 OK):

```sh
{
    "message": "User updated successfully",
    "data": {
        "id": 1,
        "username": "user1",
        "first_name": "Updated Name",
        "phone": "111222333",
        // ... các trường khác
    }
}
```
Phản hồi thất bại (400 Bad Request): (Ví dụ: không tìm thấy người dùng)
```sh
JSON{
    "message": "Not found user"
}
```


# DELETE http://127.0.0.1:8000/api/v1/users/<int:pk>/
- Xóa "mềm" (soft delete) một người dùng. (Yêu cầu quyền Admin).
- Thao tác này không xóa vĩnh viễn mà chỉ đặt is_active = False.
- Phản hồi thành công (204 No Content):
```sh
JSON{
    "message": "User deleted successfully"
}
```
- Phản hồi thất bại (400 Bad Request): (Ví dụ: không tìm thấy người dùng)
```sh
JSON{
    "message": "Not found user"
}
```


## 3. Đăng ký (Registration)
Đây là quy trình tạo tài khoản người dùng mới.

# Endpoint: POST http://127.0.0.1:8000/api/v1/users/register/

View: UserRegistrationView

Quyền: AllowAny (Bất kỳ ai cũng có thể truy cập)

* Mô tả:

- Tạo một người dùng mới dựa trên CustomerUserV1Serializers.

- Khi tạo, tài khoản sẽ được đặt is_active=False (chưa kích hoạt).

- Một email kích hoạt sẽ được gửi đến địa chỉ email đã đăng ký.

Toàn bộ quá trình (tạo user và gửi email) được bọc trong transaction.atomic() để đảm bảo tính toàn vẹn. Nếu gửi email thất bại, tài khoản sẽ không được tạo.

Nội dung yêu cầu (Request Body): (JSON) (Dựa trên CustomerUserV1Serializers từ tệp serializers.py)

```sh

{
    "email": "user@example.com",
    "password": "yourpassword",
    "username": "nickname",
    "first_name": "First",
    "last_name": "Last"
    // ... các trường khác
}
```
* Lưu ý: email và password là bắt buộc khi tạo mới.

Phản hồi thành công (201 Created):

```sh

{
    "message": "User created successfully",
    "data": { ... (dữ liệu người dùng vừa tạo) ... }
}
```
Phản hồi thất bại (400 Bad Request - Validation Error):

```sh
{
    "message": "User creation failed",
    "errors": { ... (chi tiết lỗi validation) ... }
}
```
Phản hồi thất bại (500 Internal Server Error - Email Error):

```sh
{
    "message": "Failed to send activation email. Please try again.",
    "errors": "..."
}
```
## 4. Kích hoạt Tài khoản (Account Activation)
# Endpoint: GET http://127.0.0.1:8000/api/v1/users/activate/<str:uidb64>/<str:token>/

View: ActivateAccountView

Quyền: AllowAny

* Mô tả:

- Đây là điểm cuối mà người dùng được chuyển hướng đến khi nhấp vào link trong email kích hoạt.

- Hệ thống giải mã uidb64 để tìm người dùng và xác thực token (sử dụng account_activation_token từ tệp token.py).

- Nếu hợp lệ, tài khoản người dùng sẽ được đặt is_active = True.

Phản hồi thành công (200 OK):

```sh

{
    "message": "Confirmed mail successfully"
}
```
Phản hồi thất bại (400 Bad Request - Invalid Link):

```sh
{
    "message": "Confirmed mail failed"
}
```
## 5. Đăng nhập (Login)
# Endpoint: POST http://127.0.0.1:8000/api/v1/login/

View: TokenObtainPairView (từ thư viện rest_framework_simplejwt)

Quyền: AllowAny

Mô tả: Xác thực thông tin (email và mật khẩu) của người dùng và trả về một cặp token (access và refresh). Lưu ý: Vì USERNAME_FIELD trong models.py là email, người dùng phải đăng nhập bằng email.

Nội dung yêu cầu (Request Body): (JSON)

```sh
{
    "email": "user@example.com",
    "password": "yourpassword"
}
```
Phản hồi thành công (200 OK):

```sh
{
    "access": "...",
    "refresh": "..."
}
```
## 6. Làm mới Token (Token Refresh)
# Endpoint: POST http://127.0.0.1:8000/api/v1/token/refresh/

View: TokenRefreshView (từ thư viện rest_framework_simplejwt)

Quyền: AllowAny

Mô tả: Nhận một refresh token còn hạn và trả về một access token mới.

Nội dung yêu cầu (Request Body): (JSON)

```sh

{
    "refresh": "..."
}
```
Phản hồi thành công (200 OK):

```sh
{
    "access": "..."
}
```
## 7. Đăng xuất (Logout)
# Endpoint: POST http://127.0.0.1:8000/api/v1/users/logout/

View: BlackListTokenRefreshView

Quyền: IsAuthenticated

* Mô tả: Đưa refresh token vào "danh sách đen" (blacklist), khiến nó không thể được sử dụng để lấy access token mới nữa.

Nội dung yêu cầu (Request Body): (JSON)

```sh
{
    "refresh": "..."
}
```
Phản hồi thành công (200 OK):

```sh
    'message': 'Logout success'
```


## 8. Quản lý Tài khoản "Me" (Thông tin cá nhân)
# Endpoint: http://127.0.0.1:8000/api/v1/users/me/
* Thêm header
```sh
    Authorization: bearer <access_token>
```

View: Me

Quyền: IsAuthenticated

# 8.1. Lấy thông tin (GET)
Mô tả: Lấy thông tin chi tiết của người dùng đang đăng nhập.

Phản hồi thành công (200 OK):
```sh
{
    "message": "Retrieve success",
    "data": { ... (dữ liệu người dùng) ... }
}
```

# 8.2. Cập nhật thông tin (PUT)
Mô tả: Cập nhật thông tin (như tên, mật khẩu, v.v.) cho người dùng đang đăng nhập.

Nội dung yêu cầu (Request Body): (JSON - các trường từ CustomerUserV1Serializers)

Phản hồi thành công (200 OK):

```sh
{
    "message": "User updated successfully",
    "data": { ... (dữ liệu người dùng đã cập nhật) ... }
}
```

# 8.3. Xóa tài khoản (DELETE)
Mô tả: Xóa "mềm" (soft delete) tài khoản của người dùng đang đăng nhập. Thao tác này chỉ đặt is_active = False chứ không xóa khỏi cơ sở dữ liệu.

Phản hồi thành công (204 No Content):

```sh
{
    "message": "User deleted successfully"
}
```

## 9. Đăng ký làm Tài xế (Register as Driver)
# Endpoint: POST http://127.0.0.1:8000/api/v1/users/register/driver/

View: UserRegisterDriverView

* Quyền: IsAuthenticated

Mô tả:

Cho phép người dùng đang đăng nhập và đã kích hoạt (is_active=True) nâng cấp tài khoản của họ thành tài xế.

Thao tác này đặt trường is_driver = True.

Nội dung yêu cầu (Request Body): (Không cần)

Phản hồi thành công (200 OK):

```sh
{
    "message": "You were a driver",
    "data": { ... (dữ liệu người dùng đã cập nhật) ... }
}
```
Phản hồi thất bại (400 Bad Request - Tài khoản chưa kích hoạt):

```sh
{
    "message": "You are not eligible to become a driver",
    "error": "Account does not active"
}
```