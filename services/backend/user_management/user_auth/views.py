
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.forms import AuthenticationForm
from .forms import RegistrationForm

import logging
logging.basicConfig(level=logging.DEBUG)

@api_view(['POST'])
@permission_classes([AllowAny])
def registerView(request):
    form = RegistrationForm(request.POST)
    if form.is_valid():
        user = form.save()
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'status': 'success',
            'username': user.username,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    return Response({'status': 'error', 'errors': form.errors}, status=status.HTTP_409_CONFLICT)

@api_view(['POST'])
@permission_classes([AllowAny])
def loginView(request):
    form = AuthenticationForm(request, data=request.POST)
    if form.is_valid():
        user = form.get_user()
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'status': 'success',
            'username': user.username,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    return Response({'status': 'error', 'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
    logout(request)
    return Response({'status': 'success'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def userSearchView(request):
    userSearched = request.data.get('username')
    if not userSearched:
        return Response({'error': 'No users found!'}, status=status.HTTP_404_NOT_FOUND)
    all_users = User.objects.filter(username__icontains=userSearched)
    users = [{'username': user.username} for user in all_users if user.username != 'root' and user != request.user]
    if not users:
        return Response({'error': 'No users found!'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'users': users}, status=status.HTTP_200_OK)