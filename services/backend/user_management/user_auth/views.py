
from django.http import JsonResponse, HttpResponseRedirect
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
import requests

from .forms import RegistrationForm

# ENV variables
from dotenv import load_dotenv
import os
load_dotenv()

import logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def has_usable_password(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        
        # Check if the user has a usable password
        has_password = user.has_usable_password()
        
        return JsonResponse({'has_password': has_password})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
	user = request.user
	otp_secret = pyotp.random_base32()

	totp = pyotp.TOTP(otp_secret)
	uri = totp.provisioning_uri(user.username, issuer_name="Transcendence")

	qr = qrcode.make(uri)
	buffer = BytesIO()
	qr.save(buffer, format="PNG")
	buffer.seek(0)
	qr_base64 = base64.b64encode(buffer.read()).decode('utf-8')

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
@permission_classes([AllowAny])
def verify_otp(request):
	if request.user.is_authenticated:
		user = request.user
	else:
		user = User.objects.filter(username=request.data.get('username')).first()
	otp = request.data.get('otp')
	profile = getattr(user, 'profile', None)
	otp_secret = request.data.get('otp_secret')
	logging.debug(f"Verifying OTP: {otp} for user: {user.username} with otp_secret: {otp_secret} and profile: {profile}")
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

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def loginView(request):
	logging.debug("Handling login")
	if request.method == 'GET':
		code = request.GET.get('code')
		if code:
			return handle_intra_oauth_login(request, code)
		return JsonResponse({'error': 'Missing authorization code'}, status=400)

	elif request.method == 'POST':
		step = request.POST.get('step', '1')
		
		if 'code' in request.POST:
			return handle_intra_oauth_login(request, request.POST['code'])
		
		if step == '1':
			logging.debug("Handling regular login")
			return handle_regular_login(request)
		elif step == '2':
			return handle_otp_verification(request)
		else:
			return JsonResponse({'error': 'Invalid step'}, status=400)

	return JsonResponse({'error': 'Method not allowed'}, status=405)
	
def handle_intra_oauth_login(request, code):
	"""
	Handle login via Intra OAuth.
	"""

	token_url = 'https://api.intra.42.fr/oauth/token'
	data = {
		'grant_type': 'authorization_code',
		'client_id': os.getenv('CLIENT_ID'),
		'client_secret': os.getenv('CLIENT_SECRET'),
		'redirect_uri': "https://localhost:8443/user_auth/login/",
		'code': code
	}
	
	response = requests.post(token_url, data=data)
	if response.status_code != 200:
		return JsonResponse({'error': 'Failed to get access token'}, status=400)
	
	tokens = response.json()
	access_token = tokens.get('access_token')
	
	if not access_token:
		return JsonResponse({'error': 'Tokens missing'}, status=400)
	
	user_info = get_user_info_from_intra(access_token)
	
	try:
		user = authenticate_or_create_user_from_intra(user_info)
	except ValueError as e:
		return HttpResponseRedirect(f'https://localhost:8443/#/login?error={e}')
	login(request, user)
	refresh = RefreshToken.for_user(user)

	profile = getattr(user, 'profile', None)
	is_2fa_enabled = bool(profile and profile.otp_secret)

	otp_secret = profile.otp_secret if profile else ''

	redirect_url = f'https://localhost:8443/#/login?code={code}&access_token={refresh.access_token}&refresh_token={refresh}&2fa={is_2fa_enabled}&otp_secret={otp_secret}&username={user.username}'
	return HttpResponseRedirect(redirect_url)

def handle_regular_login(request):
	"""
	Handle regular login with username/password.
	"""
	logging.debug("Handling regular login")
	form = AuthenticationForm(request, data=request.POST)
	if form.is_valid():
		user = form.get_user()

		profile = getattr(user, 'profile', None)
		is_2fa_enabled = bool(profile and profile.otp_secret)

		# if is_2fa_enabled:
		# 	return JsonResponse({'status': '2fa_required'}, status=200)

		login(request, user)
		refresh = RefreshToken.for_user(user)
		return JsonResponse({
			'status': 'success',
			'username': user.username,
			'access': str(refresh.access_token),
			'refresh': str(refresh),
			'otp_secret': profile.otp_secret if profile else '',
			'is_2fa_enabled': is_2fa_enabled,
		}, status=200)

	return JsonResponse({'error': form.errors}, status=400)

def get_user_info_from_intra(access_token):
	"""
	Fetch user information from Intra using the access token.
	This is an example, you would call Intra API to get user details.
	"""
	user_info_url = "https://api.intra.42.fr/v2/me"
	headers = {"Authorization": f"Bearer {access_token}"}
	response = requests.get(user_info_url, headers=headers)
	
	if response.status_code == 200:
		user_info = response.json()
		user_info['has_password'] = bool(user_info.get('password')) if 'password' in user_info else False
		return response.json()
	else:
		raise ValueError("Failed to fetch user info from Intra")

def authenticate_or_create_user_from_intra(user_info):
	username = user_info['login']
	user, created = User.objects.get_or_create(username=username)
    
	logger.debug(f"User: {user}, created: {created}")

	if not created and user.has_usable_password():
		raise ValueError("User already exists with a password")
	
	if created:
		user.set_unusable_password()
		user.save()
		Profile.objects.get_or_create(user=user)
		user.profile.intra_login = True
		user.profile.save()
    
	return user

def handle_otp_verification(request):
	"""
	Handle OTP verification when 2FA is enabled.
	"""
	username = request.POST.get('username')
	otp = request.POST.get('otp')
	
	if not username or not otp:
		return JsonResponse({'error': 'Username and OTP are required'}, status=400)
	
	user = User.objects.filter(username=username).first()
	if not user:
		return JsonResponse({'error': 'Invalid username'}, status=400)
	
	profile = getattr(user, 'profile', None)
	if not profile or not profile.otp_secret:
		return JsonResponse({'error': '2FA is not enabled for this user'}, status=400)
	
	totp = pyotp.TOTP(profile.otp_secret)
	
	if totp.verify(otp):
		login(request, user)
		refresh = RefreshToken.for_user(user)
		
		return JsonResponse({
			'status': 'success',
			'username': user.username,
			'access': str(refresh.access_token),
			'refresh': str(refresh),
		}, status=200)
	
	return JsonResponse({'error': 'Invalid OTP'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
	try:
		logout(request)
	except:
		return JsonResponse({'status': 'success'}, status=200)
	return JsonResponse({'error': 'Logout Unsuccessful'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def userSearchView(request):
	userSearched = request.POST.get('username')
	
	if not userSearched:
		return JsonResponse({'error': 'No users found!'}, status=404)
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

    if not new_password or not confirm_new_password:
        return JsonResponse({'error': 'New password and confirmation are required'}, status=400)

    if new_password != confirm_new_password:
        return JsonResponse({'error': 'New passwords do not match'}, status=400)

    # Only require current_password if the user has a usable password.
    if user.has_usable_password():
        if not current_password:
            return JsonResponse({'error': 'Current password is required'}, status=400)
        if not user.check_password(current_password):
            return JsonResponse({'error': 'Current password is incorrect'}, status=400)
        if new_password == current_password:
            return JsonResponse({'error': "New password can't be the same as the old one"}, status=400)

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