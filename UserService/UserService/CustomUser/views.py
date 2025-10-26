from django.shortcuts import render
from .models import CustomerUser
from .serializers import CustomerUserV1Serializers
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly, BasePermission
from utils.permissions import ReadOnlyOrIsAdmin


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user

class CustomerUserListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        users = CustomerUser.objects.all()
        serializer = CustomerUserV1Serializers(users, many=True)
        return Response({'message': 'Users list retrieved successfully', 'data': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        print(request.data)
        serializer = CustomerUserV1Serializers(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)  
        return Response({'message': 'User creation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    

class CustomerUserDetailView(APIView):
    permission_classes=[ReadOnlyOrIsAdmin]
    def get_user(self, pk):
        try:
            return CustomerUser.objects.filter(id=pk, is_active=True).first() 
        except:
            return None
        
    def get(self, request, pk):
        user = self.get_user(pk)
        if user:
            serializer = CustomerUserV1Serializers(user)
            return Response({
                'message': 'User retrieved successful',
                'data': serializer.data  
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'User retrieved failed',
                'error': 'User not found'
            }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        user = self.get_user(pk)
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
    
    def delete(self, request, pk):
        user = self.get_user(pk)
        if request.user.is_staff:
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
        

