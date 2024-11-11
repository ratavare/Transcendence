import requests, os, logging

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm

from .forms import RegistrationForm
from user_profile.forms import UpdateProfileForm
from user_profile.models import Profile

from django.views.decorators.csrf import csrf_exempt

logging.basicConfig(level=logging.DEBUG)

@csrf_exempt
def registerView(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request, user)
			return JsonResponse({'status': 'success'}, status=200)
		return JsonResponse({'status': 'error', 'errors': form.errors}, status=409)
	return JsonResponse({'status': 'error'}, status=400)

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
