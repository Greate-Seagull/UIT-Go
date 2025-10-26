from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from .views import (Me, 
                    BlackListTokenRefreshView,
                    UserRegistration,
                    ActivateAccount)



urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', Me.as_view(), name='me'),
    path('users/logout/', BlackListTokenRefreshView.as_view(), name="logout"),
    path('users/register/', UserRegistration.as_view(), name='user_registration'),
    path('users/activate/<str:uidb64>/<str:token>/', ActivateAccount.as_view(), name='activate'),
]

