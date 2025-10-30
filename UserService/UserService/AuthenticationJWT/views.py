from django.shortcuts import render
from CustomUser.models import CustomerUser
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from CustomUser.serializers import CustomerUserV1Serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from .token import account_activation_token
from django.contrib import messages
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
from django.db import transaction
import smtplib

class Me(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        user = request.user
        self.check_object_permissions(request, user)
        serializer = CustomerUserV1Serializers(user)
        return Response({
            'message': 'Retrieve success',
            'data': serializer.data
        })
    

    def put(self, request):
        user = self.request.user
        # self.check_object_permissions(request, user)
        if user:
            serializer = CustomerUserV1Serializers(user, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'User updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
            return Response({'message': 'User update failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'message': 'Not found user'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        user = self.request.user

        if user:
            user.is_active = False
            try:
                user.save()
                return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            except:
                return Response({'message': 'Delete user fail'})
        return Response({
            'message': 'Not found user'
        }, status=status.HTTP_400_BAD_REQUEST)
    
class BlackListTokenRefreshView(APIView):
    permission_classes= [IsAuthenticated]
    def post(self, request):
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
        return Response({'message': 'Logout success'}, status=status.HTTP_200_OK)
    


class UserRegistrationView(APIView):
    permission_classes=[AllowAny]
    def post(self, request):
        serializer = CustomerUserV1Serializers(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save(is_active=False) 
                    email = serializer.validated_data['email']
                    activateEmail(request, user, email)
                return Response({'message': 'User created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)  
            except smtplib.SMTPException as e: # Bắt lỗi SMTP cụ thể
                # Nếu gửi mail lỗi, transaction sẽ tự động rollback
                # (người dùng sẽ không được tạo)
                return Response({
                    'message': 'Failed to send activation email. Please try again.',
                    'errors': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                # Bắt các lỗi chung khác
                return Response({
                    'message': 'An unexpected error occurred.',
                    'errors': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'User creation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    

def activateEmail(request, user, to_email):
    mail_subject = "Activate your   user account."
    message = render_to_string("template_activate_account.html", {
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    email.send()



class ActivateAccountView(APIView):
    permission_classes=[AllowAny]
    def get(self, request, uidb64, token):
        User = get_user_model()
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except:
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()

            return Response({'message': 'Confirmed mail successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Confirmed mail failed'}, status=status.HTTP_400_BAD_REQUEST)
        


class UserRegisterDriverView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request):
        user = request.user
        if user.is_active:
            try:
                with transaction.atomic():
                    user.is_driver = True
                    user.save()
                    serializer = CustomerUserV1Serializers(user)
                    return Response({
                        'message': 'You were a driver',
                        'data': serializer.data
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'message': 'You are not eligible to become a driver',
                    'error' : f'{e}'
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
                'message': 'You are not eligible to become a driver',
                'error' : 'Account does not active'
            }, status=status.HTTP_400_BAD_REQUEST)