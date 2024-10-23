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
			
	# user_form = UserForm(request.POST, instance=request.user)
	# bio_form = BioForm(request.POST, instance=request.user.profile)
	# birth_date_form = BirthDateForm(request.POST, instance=request.user.profile)
	# email_form = EmailForm(request.POST, instance=request.user)

	# Check if the user wants to change their username
	# return JsonResponse({'userform':user_form}, status=200)
	# if user_form.is_valid():
	# 	user_form.save()
	# if profile_form.is_valid():
	# 	profile_form.save()

	# 	return JsonResponse({'status': 'error'}, status=200)

	# # Check if the user wants to change their bio
	# if bio_form.is_valid() and bio_form.cleaned_data['bio']:
	# 	bio_form.save()
	
	# # Check if the user wants to change their birth date
	# if birth_date_form.is_valid() and birth_date_form.cleaned_data['birth_date']:
	# 	birth_date_form.save()
	
	# # Check if the user wants to change their email
	# if email_form.is_valid() and email_form.cleaned_data['email']:
	# 	request.user.email = email_form.cleaned_data['email']
	# 	request.user.save()

	# # Check if the user wants to change their password
	# password_form = PasswordChangeForm(request.user, request.POST)
	# if password_form.is_valid() and (password_form.cleaned_data['new_password1'] or password_form.cleaned_data['new_password2']):
	# 	user = password_form.save()
	# 	update_session_auth_hash(request, user)  # Important!
	
	# # Redirect or render the same page with success messages if needed
	

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