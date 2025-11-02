from django.urls import path
from . import views

urlpatterns = [
    path('trips/', views.TripServiceViews.as_view(), name='trips'),
    path('trips/<int:trip_id>/', views.TripServiceDetailView.as_view(), name='trip_detail'),
]