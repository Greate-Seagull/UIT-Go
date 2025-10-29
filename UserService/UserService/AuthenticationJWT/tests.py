# CustomUser/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from CustomUser.models import CustomerUser # Model bạn đã tạo
from .token import account_activation_token # Token generator của bạn
from CustomUser.serializers import CustomerUserV1Serializers
# Các thư viện cần thiết cho test
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from unittest.mock import patch, MagicMock
import smtplib # Để giả lập lỗi gửi mail

# Lưu ý: Các file tests.py từ các câu hỏi trước
# nên được gộp chung vào file này hoặc xóa đi để tránh xung đột tên.

class UserFlowsAPITests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        """
        Chạy một lần duy nhất, tạo các user dùng chung.
        """
        # User thường, đã active (dùng cho Me, Register Driver)
        cls.regular_user = CustomerUser.objects.create_user(
            email='user@example.com', 
            username='user', 
            password='user123',
            first_name='Regular',
            is_active=True # Đã active
        )
        
        # User chưa active (dùng cho flow Kích hoạt tài khoản)
        cls.inactive_user = CustomerUser.objects.create_user(
            email='inactive@example.com', 
            username='inactive', 
            password='user123',
            is_active=False # CHƯA active
        )
        
        # Định nghĩa các URL
        cls.me_url = reverse('me')
        cls.register_url = reverse('user_registration')
        cls.register_driver_url = reverse('user_register_driver')
        
    
    # --- 1. Test View "Me" (/users/me/) ---
    
    def test_me_get_anonymous_fail(self):
        """
        Lý do: Đảm bảo permission [IsAuthenticated] hoạt động.
        Test: GET /users/me/ khi chưa đăng nhập.
        Mong đợi: 401 UNAUTHORIZED.
        """
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_get_authenticated_success(self):
        """
        Lý do: Đảm bảo user đã đăng nhập lấy được đúng thông tin CỦA MÌNH.
        Test: GET /users/me/ khi đã đăng nhập.
        Mong đợi: 200 OK và data trả về là của user đó.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.me_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], self.regular_user.email)

    def test_me_put_authenticated_success(self):
        """
        Lý do: Đảm bảo user có thể tự cập nhật thông tin.
        Test: PUT /users/me/ với data mới (vd: first_name).
        Mong đợi: 200 OK và database được cập nhật.
        """
        self.client.force_authenticate(user=self.regular_user)
        data = {'first_name': 'UpdatedFirstName'}
        response = self.client.put(self.me_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Kiểm tra database
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.first_name, 'UpdatedFirstName')

    def test_me_delete_authenticated_success_soft_delete(self):
        """
        Lý do: Kiểm tra logic "soft delete" (is_active=False).
        Test: DELETE /users/me/.
        Mong đợi: 204 NO CONTENT và user trong DB có is_active=False.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(self.me_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Kiểm tra database
        self.regular_user.refresh_from_db()
        self.assertFalse(self.regular_user.is_active)

    # --- 2. Test View "UserRegistrationView" (/users/register/) ---
    
    # @patch dùng để "mock" (giả lập) hàm activateEmail, 
    # tránh việc test case gửi email thật.
    @patch('AuthenticationJWT.views.activateEmail') 
    def test_register_post_success(self, mock_activate_email: MagicMock):
        """
        Lý do: Kiểm tra Happy Path của flow đăng ký.
        Test: POST /users/register/ với data hợp lệ.
        Mong đợi: 201 CREATED, user được tạo với is_active=False,
                 và hàm activateEmail ĐƯỢC GỌI 1 lần.
        """
        data = {
            'email': 'new_register@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Kiểm tra user được tạo đúng cách trong DB
        self.assertTrue(CustomerUser.objects.filter(email='new_register@example.com').exists())
        new_user = CustomerUser.objects.get(email='new_register@example.com')
        self.assertFalse(new_user.is_active) # Quan trọng
        
        # Kiểm tra hàm mock đã được gọi
        mock_activate_email.assert_called_once()

    def test_register_post_fail_email_exists(self):
        """
        Lý do: Kiểm tra validation của serializer (email unique).
        Test: POST /users/register/ với email đã tồn tại.
        Mong đợi: 400 BAD REQUEST.
        """
        data = {
            'email': self.regular_user.email, # Email đã tồn tại
            'password': 'password123',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    # Giả lập hàm activateEmail ném ra lỗi SMTPException
    @patch('AuthenticationJWT.views.activateEmail', side_effect=smtplib.SMTPException("Mocked SMTP Error"))
    def test_register_post_fail_smtp_error_transaction_rollback(self, mock_activate_email: MagicMock):
        """
        Lý do: Test quan trọng nhất! Đảm bảo [transaction.atomic] hoạt động.
               Nếu gửi mail lỗi, user không được phép tạo (phải rollback).
        Test: POST data hợp lệ, nhưng mock hàm gửi mail để nó ném ra lỗi.
        Mong đợi: 500 INTERNAL SERVER ERROR (như code view của bạn)
                 và user KHÔNG tồn tại trong DB.
        """
        data = {
            'email': 'rollback@example.com',
            'password': 'newpassword123',
        }
        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Kiểm tra quan trọng: User không được tạo
        self.assertFalse(CustomerUser.objects.filter(email='rollback@example.com').exists())
        
        # Hàm mock cũng đã được gọi (và đã ném ra lỗi)
        mock_activate_email.assert_called_once()

    # --- 3. Test View "ActivateAccountView" (/users/activate/) ---

    def test_activate_get_success(self):
        """
        Lý do: Kiểm tra Happy Path của flow kích hoạt tài khoản.
        Test: GET link kích hoạt với UID và Token HỢP LỆ.
        Mong đợi: 200 OK và user được set is_active=True.
        """
        # Tạo URL kích hoạt
        user = self.inactive_user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activate_url = reverse('activate', kwargs={'uidb64': uid, 'token': token})
        
        response = self.client.get(activate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        
        # Kiểm tra database
        user.refresh_from_db()
        self.assertTrue(user.is_active)

    def test_activate_get_fail_bad_token(self):
        """
        Lý do: Đảm bảo token generator hoạt động, token sai phải bị từ chối.
        Test: GET link kích hoạt với UID đúng nhưng Token SAI.
        Mong đợi: 400 BAD REQUEST.
        """
        user = self.inactive_user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = "day-la-token-sai-123" # Token sai
        activate_url = reverse('activate', kwargs={'uidb64': uid, 'token': token})
        
        response = self.client.get(activate_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertFalse(user.is_active) # User vẫn inactive

    def test_activate_get_fail_token_reused(self):
        """
        Lý do: Kiểm tra logic của file [token.py]. Token được tạo dựa trên
               [user.is_active]. Khi user đã active, token cũ phải vô dụng.
        Test: GET link kích hoạt 2 LẦN. Lần 1 thành công, lần 2 thất bại.
        Mong đợi: Lần 1 (200 OK), Lần 2 (400 BAD REQUEST).
        """
        user = self.inactive_user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activate_url = reverse('activate', kwargs={'uidb64': uid, 'token': token})
        
        # Lần 1: Thành công
        response1 = self.client.get(activate_url)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        
        # Lần 2: Thất bại (vì user.is_active đã thay đổi, token cũ sai)
        response2 = self.client.get(activate_url)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

    # --- 4. Test View "UserRegisterDriverView" (/users/register/driver/) ---

    def test_register_driver_post_anonymous_fail(self):
        """
        Lý do: Đảm bảo permission [IsAuthenticated] hoạt động.
        Test: POST /users/register/driver/ khi chưa đăng nhập.
        Mong đợi: 401 UNAUTHORIZED.
        """
        response = self.client.post(self.register_driver_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_register_driver_post_authenticated_success(self):
        """
        Lý do: Kiểm tra Happy Path của đăng ký tài xế.
        Test: POST khi đã đăng nhập bằng user ĐÃ ACTIVE.
        Mong đợi: 200 OK và user được set is_driver=True.
        """
        self.client.force_authenticate(user=self.regular_user) # User này is_active=True
        response = self.client.post(self.register_driver_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Kiểm tra database
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.is_driver)
        
    def test_register_driver_post_authenticated_fail_inactive_user(self):
        """
        Lý do: Kiểm tra logic nghiệp vụ [if user.is_active:].
        Test: POST khi đã đăng nhập bằng user CHƯA ACTIVE.
        Mong đợi: 400 BAD REQUEST (lỗi 'Account does not active').
        """
        self.client.force_authenticate(user=self.inactive_user) # User này is_active=False
        response = self.client.post(self.register_driver_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Account does not active')
        
        # Kiểm tra database
        self.inactive_user.refresh_from_db()
        self.assertFalse(self.inactive_user.is_driver) # Vẫn là False