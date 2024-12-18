
from django.http import JsonResponse
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import status
from user_profile.models import Profile

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

# 2FA
import pyotp
import qrcode
from io import BytesIO
import base64

from .forms import RegistrationForm

import logging
logger = logging.getLogger(__name__)
# logging.basicConfig(level=logging.DEBUG)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
	user = request.user

	# Ensure the user has a profile (if it's not auto-created)
	profile, created = Profile.objects.get_or_create(user=user)

	# Generate a new secret
	otp_secret = pyotp.random_base32()

	# Generate a TOTP provisioning URI
	totp = pyotp.TOTP(otp_secret)
	uri = totp.provisioning_uri(user.username, issuer_name="Transcendence")

	# Generate a QR code for the URI
	qr = qrcode.make(uri)
	buffer = BytesIO()
	qr.save(buffer, format="PNG")
	buffer.seek(0)
	qr_base64 = base64.b64encode(buffer.read()).decode('utf-8')

	# Return the QR code and the OTP secret (temporarily)
	return JsonResponse({'qr_code': qr_base64, 'otp_secret': otp_secret}, status=200)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request):
	user = request.user
	otp = request.data.get('otp')
	otp_secret = request.data.get('otp_secret')
	profile = getattr(user, 'profile', None)
	if profile and otp_secret:
		totp = pyotp.TOTP(otp_secret)
		if totp.verify(otp):
			profile.otp_secret = otp_secret
			profile.save()
			return JsonResponse({'status': 'success'}, status=200)
	return JsonResponse({'status': 'error', 'error': 'Invalid OTP'}, status=400)

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

@api_view(['POST'])
@permission_classes([AllowAny])
def loginView(request):
	step = request.POST.get('step', '1')  # Default to step 1

	# Step 1: Verify credentials and check for 2FA
	if step == '1':
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			user = form.get_user()

			# Check if 2FA is enabled
			profile = getattr(user, 'profile', None)
			is_2fa_enabled = bool(profile and profile.otp_secret)

			if is_2fa_enabled:
				# Return a flag to prompt for 2FA in frontend
				return JsonResponse({'status': '2fa_required'}, status=200)

			# Log in user if no 2FA
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

	# Step 2: Validate OTP
	elif step == '2':
		username = request.POST.get('username')
		otp = request.POST.get('otp')

		user = User.objects.filter(username=username).first()
		if not user:
			return JsonResponse({'error': 'Invalid username'}, status=400)

		profile = getattr(user, 'profile', None)
		totp = pyotp.TOTP(profile.otp_secret) if profile else None

		if totp and totp.verify(otp):
			# Log in user
			login(request, user)
			refresh = RefreshToken.for_user(user)
			return JsonResponse({
				'status': 'success',
				'username': user.username,
				'access': str(refresh.access_token),
				'refresh': str(refresh),
			}, status=200)
		return JsonResponse({'error': 'Invalid OTP'}, status=400)
	else:
		return JsonResponse({'error': 'Invalid step'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
	logout(request)
	return JsonResponse({'status': 'success'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def userSearchView(request):
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changePasswordView(request):
	user = request.user
	current_password = request.POST.get('current_password')
	new_password = request.POST.get('new_password')
	confirm_new_password = request.POST.get('confirm_new_password')

	if not user.check_password(current_password):
		logger.debug("mano do ceu")
		return JsonResponse({'error': 'Current password is incorrect'}, status=400)

	if new_password != confirm_new_password:
		return JsonResponse({'error': 'New passwords do not match'}, status=400)

	if new_password == current_password:
		return JsonResponse({'error': "New password can't be the same as old one"}, status=400)

	try:
		user.set_password(new_password)
		user.save()
		update_session_auth_hash(request, user)
		return JsonResponse({'status': 'success', 'message': 'Password changed successfully'}, status=200)
	except ValidationError as e:
		return JsonResponse({'error': str(e)}, status=400)
	except Exception as e:
		return JsonResponse({'error': 'An error occurred while changing the password'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteAccountView(request):
	user = request.user
	try:
		user.delete()
		logout(request)
		return JsonResponse({'status': 'success', 'message': 'Account deleted successfully'}, status=200)
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': 'An error occurred while deleting the account'}, status=500)