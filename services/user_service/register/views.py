import os, requests

from django.shortcuts import render, redirect
from django.views import generic
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm

from django.http import JsonResponse
import json

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.views import APIView

from .forms import RegistrationForm
from .serializers import UserRegisterSerializer
from .models import Profile

class color:
	RED = '\033[91m'
	YELLOW = '\033[93m'
	GREEN = '\033[92m'
	NC = '\033[0m'

@api_view(['POST', 'GET'])
@permission_classes((permissions.AllowAny,))
def apiRegisterView(request):
	if request.method == "POST":
		form = RegistrationForm(request.POST)
		if form.is_valid():
			serializer = UserRegisterSerializer(data={
				'username': form.cleaned_data['username'],
				'email': form.cleaned_data['email'],
				'password': form.cleaned_data['password1']})
			if serializer.is_valid():
				serializer.save()
				return Response(serializer.data, status=201)
			return Response(serializer.errors, status=400)
	elif request.method == "GET":
		users = User.objects.all()
		serializer = UserRegisterSerializer(users, many=True)
		return Response(serializer.data)

def registerView(request):
	print(color.YELLOW + 'TESTESTESTESTESTEST' + color.NC)
	if request.method == 'POST':
		print(color.GREEN + 'TESTESTESTESTESTEST' + color.NC)
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			Profile.objects.create(user=user, profile_picture="/user/media/profile-pp.jpg")
			user.save()
			login(request, user)
			return JsonResponse({'status': 'success', 'username': user.username})
		return JsonResponse({'status': 'error', 'errors': form.errors})

	form = RegistrationForm()
	context = {
		"registerForm": form,
		"url": 'localhost:8004/',
	}

	return render(request, 'register/register.html', context)

# def registerView(request):
# 	print(color.YELLOW + 'TESTESTESTESTESTEST' + color.NC)
# 	if request.method == "POST":
# 		print(color.GREEN + 'TESTESTESTESTESTEST' + color.NC)
		
# 		if form.is_valid():
# 			user = form.save()
# 			Profile.objects.create(user=user, profile_picture="/user/media/profile-pp.jpg")
# 			user.save()
# 			login(request, user)
# 			return redirect('register/user.html')
# 	else:
# 		form = RegistrationForm()

# 	context = {
# 		"registerForm": form,
# 		"url": 'localhost:8004/',
# 	}
# 	return render(request, 'register/register.html', context)

class UsersView(generic.ListView):
	template_name = "register/user.html"
	context_object_name = "user_list"

	def get_queryset(self):
		return User.objects.all()	

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

			Profile.objects.create(user=user, profile_picture="/user/media/profile-PP.jpg")
			
			if created:
				user.set_unusable_password()
				user.save()

			login(request, user)

			return render(request, 'register/index.html', {
				'url': os.getenv('URL'),
				'registerForm': RegistrationForm(),
				'authenticForm': AuthenticationForm(),
			})
		else:
			return render(request, 'error.html', {'error': 'Failed to fetch user info'})
	else:
		return render(request, 'error.html', {'error': 'Failed to obtain access token'})

def indexView(request):

	auth_code = request.GET.get('code')

	if not auth_code:
		return render(request, 'register/index.html', {
			'url': os.getenv('URL'),
			'registerForm': RegistrationForm(),
			'authenticForm': AuthenticationForm(),
		})

	return auth(request, auth_code)