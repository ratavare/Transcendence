import requests, os
from django.http import JsonResponse

from django.shortcuts import render

from django.contrib.auth.models import User
from django.contrib.auth import login

from .forms import RegistrationForm
from django.contrib.auth.forms import AuthenticationForm

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

# from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
# BASE_DIR = Path(__file__).resolve().parent.parent
# load_dotenv(os.path.join(BASE_DIR, '../.env'))

import logging
logging.basicConfig(level=logging.DEBUG)

def indexView(request):
	# auth_code = request.GET.get('code')

	# if not auth_code:
		return render(request, 'index.html', {
			'registerForm': RegistrationForm,
			'loginForm': AuthenticationForm,
		})

	# return auth(request, auth_code)

# @permission_classes([AllowAny])
# def auth(request, auth_code):
# 	token_url = "https://api.intra.42.fr/oauth/token"
# 	payload = {
# 		'grant_type': 'authorization_code',
# 		'client_id': os.getenv('CLIENT_ID'),
# 		'client_secret': os.getenv('CLIENT_SECRET'),
# 		'redirect_uri': "https://localhost:8443",
# 		'code': auth_code,
# 	}

# 	response = requests.post(token_url, data=payload)

# 	if response.status_code == 200:
# 		token_data = response.json()
# 		access_token = token_data.get('access_token')

# 		user_info_url = "https://api.intra.42.fr/v2/me"
# 		headers = {
# 			'Authorization': f'Bearer {access_token}'
# 		}
# 		user_info_response = requests.get(user_info_url, headers=headers)

# 		if user_info_response.status_code == 200:
# 			user_info = user_info_response.json()

# 			username = user_info.get('login')
# 			email = user_info.get('email')

# 			user, created = User.objects.get_or_create(username=username, email=email)
			
# 			if created:
# 				user.set_unusable_password()
# 				user.save()

# 			login(request, user)
# 			refresh = RefreshToken.for_user(user)

# 			logging.debug(f"User: {user}, Created: {created}, Refresh: {refresh}")
# 			return render(request, 'home.html')

# 			# return JsonResponse({
# 			# 	'status': 'success',
# 			# 	'username': user.username,
# 			# 	'access': str(refresh.access_token),
# 			# 	'refresh': str(refresh),
# 			# }, status=200)
# 		else:
# 			return JsonResponse({'error': 'Failed to fetch user info'}, status=400)
# 	else:
# 		return JsonResponse({'error': 'Failed to obtain access token'}, status=400)
