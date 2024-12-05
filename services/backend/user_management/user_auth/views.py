
from django.http import JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

from .forms import RegistrationForm

import logging
logging.basicConfig(level=logging.DEBUG)

def registerView(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request, user)
			return JsonResponse({'message': 'Registration Successful'}, status=200)
		return JsonResponse({'error': form.errors}, status=409)
	elif request.method == 'GET':
		return JsonResponse({'test':"GET"}, status=200);
	return JsonResponse({'error': 'error'}, status=400)

@csrf_exempt
def loginView(request):
	if request.method == 'POST':
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			user = form.get_user()
			login(request, user)
			return JsonResponse({'message': 'Login Successful', 'username': user.username}, status=200)
		return JsonResponse({'error': form.errors}, status=400)
	return JsonResponse({'error': 'error'}, status=400)

def logoutView(request):
	logout(request)
	return JsonResponse({'status': 'success'}, status=200)