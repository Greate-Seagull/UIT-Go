from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from .views import (Me, 
                    BlackListTokenRefreshView,
                    UserRegistrationView,
                    ActivateAccountView,
                    UserRegisterDriverView)



urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', Me.as_view(), name='me'),
    path('users/logout/', BlackListTokenRefreshView.as_view(), name="logout"),
    path('users/register/', UserRegistrationView.as_view(), name='user_registration'),
    path('users/register/driver/', UserRegisterDriverView.as_view(), name='user_register_driver'),
    path('users/activate/<str:uidb64>/<str:token>/', ActivateAccountView.as_view(), name='activate'),
]

