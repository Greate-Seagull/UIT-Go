from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import response
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests

URL_TRIPSERVICE = 'http://localhost:8082/'

class TripServiceViews(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data 
        try:
            res = requests.post(f'{URL_TRIPSERVICE}trips/', data=data)
            if res.status_code == 200:
                return response({
                    'message': 'Create trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return response({
                'message': 'Create trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TripServiceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, trip_id):
        try:
            res = requests.get(f'{URL_TRIPSERVICE}trips/{trip_id}')
            if res.status_code == 200:
                return response({
                    'message': 'Retrieve trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return response({
                'message': 'Retrieve trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TripCancelView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, trip_id):
        try:
            res = requests.get(f'{URL_TRIPSERVICE}trips/{trip_id}/cancel')
            if res.status_code == 200:
                return response({
                    'message': 'Cancel trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return response({
                'message': 'Cancel trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        