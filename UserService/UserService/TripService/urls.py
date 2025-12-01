from django.urls import path
from . import views

urlpatterns = [
    path('trips/', views.TripServiceViews.as_view(), name='trips'),
    path('trips/<int:trip_id>/', views.TripServiceDetailView.as_view(), name='trip_detail'),
    path('trips/<int:trip_id>/cancel', views.TripCancelView.as_view(), name='trip_cancel'),
    path('trips/<int:trip_id>/rating', views.TripRatingView.as_view(), name='trip_rating'),
]