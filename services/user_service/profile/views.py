from django.contrib.auth import update_session_auth_hash, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import render, redirect
from .forms import ProfileForm
from .models import Profile
from django.http import JsonResponse

# @POST
@login_required
def profileView(request):
	profile = ProfileForm(request.POST, instance=request.user.profile)
	# user_form = UserForm(request.POST, instance=request.user)
	# bio_form = BioForm(request.POST, instance=request.user.profile)
	# birth_date_form = BirthDateForm(request.POST, instance=request.user.profile)
	# email_form = EmailForm(request.POST, instance=request.user)

	# Check if the user wants to change their username
	# return JsonResponse({'userform':user_form}, status=200)
	# if user_form.is_valid():
	# 	user_form.save()
	
	if profile.is_valid():
		if profile.cleaned_data['username']:
			request.user = profile.cleaned_data['username']
			request.user.save()
			profile.save()

	# if profile_form.is_valid():
	# 	profile_form.save()

	# 	return JsonResponse({'status': 'puta'}, status=200)

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