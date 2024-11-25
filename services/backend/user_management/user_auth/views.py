
from django.http import JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User

from .forms import RegistrationForm

import logging
logging.basicConfig(level=logging.DEBUG)

def registerView(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request, user)
			return JsonResponse({'status': 'success'}, status=200)
		return JsonResponse({'status': 'error', 'errors': form.errors}, status=409)
	elif request.method == 'GET':
		return JsonResponse({'test':"GET"}, status=200);
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