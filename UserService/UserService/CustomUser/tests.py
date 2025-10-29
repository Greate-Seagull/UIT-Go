# ten_app_cua_ban/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import CustomerUser # Đảm bảo import đúng model

class CustomerUserAPITests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        """
        Chạy một lần duy nhất khi bắt đầu class test.
        Tạo các dữ liệu cố định để dùng chung cho tất cả các test.
        """
        # 1. Tạo 3 loại user: admin (staff), user thường, và user không active
        cls.admin_user = CustomerUser.objects.create_superuser(
            email='admin@example.com', 
            username='admin', 
            password='admin123'
        )
        
        cls.regular_user = CustomerUser.objects.create_user(
            email='user@example.com', 
            username='user', 
            password='user123',
            first_name='Regular'
        )
        
        cls.inactive_user = CustomerUser.objects.create_user(
            email='inactive@example.com', 
            username='inactive', 
            password='user123',
            is_active=False
        )
        
        # 2. Định nghĩa các URL
        # Giả sử bạn đã đặt tên 'user-list' và 'user_detail' trong urls.py
        # ví dụ: path('users/', CustomerUserListView.as_view(), name='user-list')
        # ví dụ: path('users/<int:pk>/', CustomerUserDetailView.as_view(), name='user_detail')
        cls.list_url = reverse('users') # Cần đặt name='user-list' trong urls.py
        cls.detail_url = reverse('user_detail', kwargs={'pk': cls.regular_user.pk}) # Cần đặt name='user_detail'
        cls.inactive_detail_url = reverse('user_detail', kwargs={'pk': cls.inactive_user.pk})

    def test_list_users_get(self):
        """
        Test GET /users/ (ListView).
        Ai cũng có thể xem (AllowAny).
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Kiểm tra xem có bao nhiêu user được trả về (cả 3 user)
        self.assertEqual(len(response.data['data']), 3) 

    def test_create_user_post_success(self):
        """
        Test POST /users/ (ListView) - Tạo user mới thành công.
        Ai cũng có thể tạo (AllowAny).
        """
        data = {
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'User created successfully')
        
        # Kiểm tra user đã tồn tại trong DB chưa
        self.assertTrue(CustomerUser.objects.filter(email='newuser@example.com').exists())
        
        # Kiểm tra password đã được hash (không lưu text thô)
        new_user = CustomerUser.objects.get(email='newuser@example.com')
        self.assertNotEqual(new_user.password, 'newpassword123')
        self.assertTrue(new_user.check_password('newpassword123'))

    def test_create_user_post_fail_missing_fields(self):
        """
        Test POST /users/ - Thất bại do thiếu email (dựa trên logic validate của bạn).
        """
        data = {
            'password': 'newpassword123', # Cố tình thiếu email
        }
        response = self.client.post(self.list_url, data, format='json')
        
        # Serializer của bạn sẽ raise ValidationError
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('missing_fields', response.data['errors'])

    # --- Test DetailView - GET (ReadOnly) ---
    
    def test_get_user_detail_anonymous(self):
        """
        Test GET /users/<pk>/ (DetailView) - User chưa đăng nhập (Anonymous).
        (ReadOnlyOrIsAdmin -> nên được phép xem)
        """
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], self.regular_user.email)

    def test_get_user_detail_regular_user(self):
        """
        Test GET /users/<pk>/ (DetailView) - User thường đã đăng nhập.
        (ReadOnlyOrIsAdmin -> nên được phép xem)
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_inactive_user_detail(self):
        """
        Test GET /users/<pk>/ (DetailView) - Thử lấy user đã is_active=False.
        View của bạn có hàm get_user() chỉ filter(is_active=True), nên phải thất bại.
        """
        response = self.client.get(self.inactive_detail_url)
        # View của bạn trả về 400 khi 'User not found'
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User not found')

    # --- Test DetailView - PUT (Admin Only) ---
    
    def test_update_user_put_by_admin_success(self):
        """
        Test PUT /users/<pk>/ (DetailView) - Admin cập nhật thành công.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'first_name': 'Updated Name'
        }
        response = self.client.put(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['first_name'], 'Updated Name')
        
        # Kiểm tra database
        self.regular_user.refresh_from_db() # Lấy dữ liệu mới nhất từ DB
        self.assertEqual(self.regular_user.first_name, 'Updated Name')

    def test_update_user_put_by_regular_user_fail(self):
        """
        Test PUT /users/<pk>/ (DetailView) - User thường không được phép.
        (ReadOnlyOrIsAdmin -> user thường sẽ bị 403 Forbidden)
        """
        self.client.force_authenticate(user=self.regular_user)
        data = {'first_name': 'Hacker'}
        response = self.client.put(self.detail_url, data, format='json')
        
        # Lỗi 403 Forbidden (Bị cấm)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_user_put_by_anonymous_fail(self):
        """
        Test PUT /users/<pk>/ (DetailView) - User chưa đăng nhập không được phép.
        """
        data = {'first_name': 'Hacker'}
        response = self.client.put(self.detail_url, data, format='json')
        
        # Lỗi 401 Unauthorized (Chưa xác thực)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    # --- Test DetailView - DELETE (Admin/Staff Only) ---

    def test_delete_user_by_admin_success(self):
        """
        Test DELETE /users/<pk>/ (DetailView) - Admin (is_staff=True) xóa (soft delete).
        """
        self.client.force_authenticate(user=self.admin_user)
        
        # Tạo user mới để test xóa (tránh ảnh hưởng user khác)
        user_to_delete = CustomerUser.objects.create_user(email='to.delete@example.com', password='123')
        delete_url = reverse('user_detail', kwargs={'pk': user_to_delete.pk})

        response = self.client.delete(delete_url)
        
        # 204 No Content là status code chuẩn cho DELETE thành công
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Kiểm tra logic "soft delete"
        user_to_delete.refresh_from_db()
        self.assertFalse(user_to_delete.is_active) # Phải là False
        self.assertTrue(CustomerUser.objects.filter(email='to.delete@example.com').exists()) # Vẫn tồn tại

    def test_delete_user_by_regular_user_fail(self):
        """
        Test DELETE /users/<pk>/ (DetailView) - User thường (is_staff=False) thất bại.
        View của bạn kiểm tra `if request.user.is_staff:`.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(self.detail_url)
        
        # Nếu không phải admin, view của bạn không trả về gì (nên sửa)
        # Tuy nhiên, permission [ReadOnlyOrIsAdmin] sẽ chặn trước và trả về 403
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)