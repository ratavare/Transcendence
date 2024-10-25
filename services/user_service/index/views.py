import requests, os, logging

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm

from .forms import RegistrationForm
from profile.models import Profile

logging.basicConfig(level=logging.DEBUG)

def indexView(request):

	auth_code = request.GET.get('code')

	if not auth_code:
		return render(request, 'index/index.html', {
			'url': os.getenv('URL'),
			'registerForm': RegistrationForm,
			'loginForm': AuthenticationForm,
		})

	return auth(request, auth_code)

def registerView(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			user.save()
			login(request, user)
			return JsonResponse({'status': 'success', 'username': user.username}, status=200)
		return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
	return JsonResponse({'status': 'error1'}, status=400)

def loginView(request):
	if request.method == 'POST':
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			user = form.get_user()
			login(request, user)
			return JsonResponse({'status': 'success', 'username': user.username}, status=200)
		return JsonResponse({'status': 'error1', 'errors': form.errors}, status=400)
	return JsonResponse({'status': 'error2'}, status=400)

def logoutView(request):
	logout(request)
	return JsonResponse({'status': 'success'}, status=200)

class color:
	RED = '\033[91m'
	YELLOW = '\033[93m'
	GREEN = '\033[92m'
	NC = '\033[0m'

def auth(request, auth_code):
	token_url = "https://api.intra.42.fr/oauth/token"
	payload = {
		'grant_type': 'authorization_code',
		'client_id': os.getenv('CLIENT_ID'),
		'client_secret': os.getenv('CLIENT_SECRET'),
		'redirect_uri': os.getenv('URL'),
		'code': auth_code,
	}

	response = requests.post(token_url, data=payload)

	if response.status_code == 200:
		token_data = response.json()
		access_token = token_data.get('access_token')

		user_info_url = "https://api.intra.42.fr/v2/me"
		headers = {
			'Authorization': f'Bearer {access_token}'
		}
		user_info_response = requests.get(user_info_url, headers=headers)

		if user_info_response.status_code == 200:
			user_info = user_info_response.json()

			username = user_info.get('login')
			email = user_info.get('email')

			user, created = User.objects.get_or_create(username=username, email=email)
			
			if created:
				user.set_unusable_password()
				user.save()

			login(request, user)

			return render(request, 'index/index.html', {
				'url': os.getenv('URL'),
			})
		else:
			return render(request, 'error.html', {'error': 'Failed to fetch user info'})
	else:
		return render(request, 'error.html', {'error': 'Failed to obtain access token'})
