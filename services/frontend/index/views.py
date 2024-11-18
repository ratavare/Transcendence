import requests, os

from django.shortcuts import render

from django.contrib.auth.models import User
from django.contrib.auth import login

from .forms import RegistrationForm, UpdateProfileForm
from django.contrib.auth.forms import AuthenticationForm

# from django.contrib.auth.forms import AuthenticationForm
# from .forms import RegistrationForm
# from user_profile.forms import UpdateProfileForm
# from user_profile.models import Profile

def indexView(request):

	auth_code = request.GET.get('code')

	if not auth_code:
		return render(request, 'index.html', {
			'registerForm': RegistrationForm,
			'loginForm': AuthenticationForm,
			'updateProfileForm': UpdateProfileForm,
		})

	return auth(request, auth_code)

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
