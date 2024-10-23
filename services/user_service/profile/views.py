import logging
from django.http import JsonResponse
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash, logout
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .forms import UpdateProfileForm
from .models import Profile

logging.basicConfig(level=logging.DEBUG)

# @POST
@login_required
def profileView(request):
	profile = get_object_or_404(Profile, user=request.user)
	if request.method == 'POST':
		userForm = UpdateProfileForm(request.POST, instance=profile)
		try:
			request.user.username = request.POST.get('username')
			request.user.email = request.POST.get('email')
			request.user.save()
			userForm.full_clean()
			userForm.save()
		except ValidationError as e:
			logging.error('Errors: ***** %s *****', e)
			return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
		return JsonResponse({'status': 'success'}, status=200)

def account_delete(request):
	if request.method == 'POST':
		user = request.user
		logout(request)
		user.delete()
		return JsonResponse({'status': 'success'}, status=200)

@login_required
def change_password(request):
	if request.method == 'POST':
		form = PasswordChangeForm(request.user, request.POST)
		if form.is_valid():
			user = form.save()
			update_session_auth_hash(request, user)
			return JsonResponse({'status': 'success'}, status=200)
	else:
		form = PasswordChangeForm(request.user)

@login_required
def change_username(request):
	if request.method == 'POST':
		form = ChangeUsernameForm(request.POST, instance=request.user)
		if form.is_valid():
			form.save()
			return JsonResponse({'status': 'success'}, status=200)
	else:
		form = ChangeUsernameForm(instance=request.user)

@login_required
def friends(request):
	return JsonResponse({'status': 'success'}, status=200)

@login_required
def searchfriends(request):
	return JsonResponse({'status': 'success'}, status=200)