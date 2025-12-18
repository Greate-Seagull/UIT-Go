from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests

URL_TRIPSERVICE = 'https://uitgo-trip-service.azurewebsites.net/'

class TripServiceViews(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        headers = {
            'X-User-Id': str(request.user.id),
            'Content-Type': 'application/json'
        }
        try:
            res = requests.post(f'{URL_TRIPSERVICE}trips', json=request.data, headers=headers, timeout=15)
            data = res.json() if res.content else {}

            if res.ok:
                return Response(
                    {'message': 'Create trip success', 'data': data},
                    status=res.status_code
                )

            return Response(
                {'message': 'Create trip failed', 'error': data},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TripServiceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, trip_id):
        try:
            res = requests.get(f'{URL_TRIPSERVICE}trips/{trip_id}')
            if res.status_code == 200:
                return Response({
                    'message': 'Retrieve trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Retrieve trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TripCancelView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, trip_id):
        try:
            user_id = request.user.id
            headers = {'X-User-Id': str(user_id)}
            res = requests.post(f'{URL_TRIPSERVICE}trips/{trip_id}/cancel', headers=headers)
            if res.status_code == 200:
                return Response({
                    'message': 'Cancel trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Cancel trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class TripRatingView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, trip_id):
        try:
            user_id = request.user.id
            headers = {'X-User-Id': user_id}
            res = requests.post(f'{URL_TRIPSERVICE}trips/{trip_id}/rating', headers=headers)
            if res.status_code == 200:
                return Response({
                    'message': 'Cancel trip success',
                    'data': res.json()
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Cancel trip fail',
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': "Has error",
                'error': f'Error: {e}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


        