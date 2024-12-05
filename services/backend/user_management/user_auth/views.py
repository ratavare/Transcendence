
from django.http import JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from user_profile.models import Profile

# JWT
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

# 2FA
import pyotp
import qrcode
from io import BytesIO
import base64

from .forms import RegistrationForm

import logging
logging.basicConfig(level=logging.DEBUG)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    user = request.user

    # Ensure the user has a profile (if it's not auto-created)
    profile, created = Profile.objects.get_or_create(user=user)

    # Generate a new secret if one doesn't already exist
    if not profile.otp_secret:
        profile.otp_secret = pyotp.random_base32()
        profile.save()

    # Generate a TOTP provisioning URI
    totp = pyotp.TOTP(profile.otp_secret)
    uri = totp.provisioning_uri(user.username, issuer_name="Transcendence")

    # Generate a QR code for the URI
    qr = qrcode.make(uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.read()).decode('utf-8')

    return JsonResponse({'qr_code': qr_base64}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    user = request.user
    profile = getattr(user, 'profile', None)
    if profile:
        profile.otp_secret = ''
        profile.save()
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error', 'error': 'Profile not found'}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request):
    user = request.user
    otp = request.data.get('otp')
    profile = getattr(user, 'profile', None)
    if profile and profile.otp_secret:
        totp = pyotp.TOTP(profile.otp_secret)
        if totp.verify(otp):
            return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'status': 'error', 'error': 'Invalid OTP'}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def registerView(request):
	form = RegistrationForm(request.POST)
	if form.is_valid():
		user = form.save()
		login(request, user)
		refresh = RefreshToken.for_user(user)

		return JsonResponse({
			'status': 'success',
			'username': user.username,
			'access': str(refresh.access_token),
			'refresh': str(refresh),
		}, status=200)
	return JsonResponse({'error': form.errors}, status=409)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def loginView(request):
    form = AuthenticationForm(request, data=request.POST)
    if form.is_valid():
        user = form.get_user()

        # Check if 2FA is enabled for the user
        profile = getattr(user, 'profile', None)
        is_2fa_enabled = bool(profile and profile.otp_secret)

        if is_2fa_enabled:
            otp = request.POST.get('otp')
            totp = pyotp.TOTP(profile.otp_secret)

            if not otp or not totp.verify(otp):
                return JsonResponse({'error': 'Invalid OTP'}, status=400)

        # Perform login if OTP validation passes (or 2FA is not enabled)
        login(request, user)
        refresh = RefreshToken.for_user(user)

        return JsonResponse({
            'status': 'success',
            'username': user.username,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'is_2fa_enabled': is_2fa_enabled,
        }, status=200)

    return JsonResponse({'error': form.errors}, status=400)

@permission_classes([IsAuthenticated])
def logoutView(request):
	logout(request)
	return JsonResponse({'status': 'success'}, status=200)

@permission_classes([IsAuthenticated])
def userSearchView(request):
	if request.method == 'POST':
		userSearched = request.POST.get('username')
		
		if not userSearched:
			return JsonResponse({'error': 'No users found!'}, status=404)
		# gets all users that contain 'userSearched'; Not sensitive to case
		all_users = User.objects.filter(username__icontains=userSearched)
		
		users = []
		for user in all_users:
			if user.username == 'root' or user == request.user:
				continue
			users.append({'username': user.username})
		if not users:
			return JsonResponse({'error': 'No users found!'}, status=404)
		return JsonResponse({'users': users}, status=200)
	return JsonResponse({"error": "Wrong Method"}, status=400)