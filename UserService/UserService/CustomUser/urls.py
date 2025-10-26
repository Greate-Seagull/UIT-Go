from django.urls import path
from .views import CustomerUserListView, CustomerUserDetailView


urlpatterns = [
    path('users/', CustomerUserListView.as_view(), name='users'),
    path('users/<int:pk>/', CustomerUserDetailView.as_view(), name='user_detail'),
]