from django.contrib.auth import update_session_auth_hash, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from .forms import BioForm, BirthDateForm, EmailForm, UserForm
from register.models import Profile

def profileView(request):
    if request.method == "POST":
        user_form = UserForm(request.POST, instance=request.user)
        bio_form = BioForm(request.POST, instance=request.user.profile)
        birth_date_form = BirthDateForm(request.POST, instance=request.user.profile)
        email_form = EmailForm(request.POST, instance=request.user)

        # Check if the user wants to change their username
        if user_form.is_valid() and user_form.cleaned_data['username']:
            request.user.username = user_form.cleaned_data['username']
        
        # Check if the user wants to change their bio
        if bio_form.is_valid() and bio_form.cleaned_data['bio']:
            bio_form.save()
        
        # Check if the user wants to change their birth date
        if birth_date_form.is_valid() and birth_date_form.cleaned_data['birth_date']:
            birth_date_form.save()
        
        # Check if the user wants to change their email
        if email_form.is_valid() and email_form.cleaned_data['email']:
            request.user.email = email_form.cleaned_data['email']
            request.user.save()

        # Check if the user wants to change their password
        password_form = PasswordChangeForm(request.user, request.POST)
        if password_form.is_valid() and (password_form.cleaned_data['new_password1'] or password_form.cleaned_data['new_password2']):
            user = password_form.save()
            update_session_auth_hash(request, user)  # Important!
        
        # Redirect or render the same page with success messages if needed

    else:
        user_form = UserForm(instance=request.user)
        bio_form = BioForm(instance=request.user.profile)
        birth_date_form = BirthDateForm(instance=request.user.profile)
        email_form = EmailForm(instance=request.user)

    context = {
        'user_form': user_form,
        'bio_form': bio_form,
        'birth_date_form': birth_date_form,
        'email_form': email_form,
        'password_form': PasswordChangeForm(user=request.user),
        'user': request.user,
    }
    
    return render(request, 'profile/profile.html', context)

def account_delete(request):
	if request.method == 'POST':
		user = request.user
		logout(request)
		user.delete()
		return redirect('/')

@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            return redirect('profile:profile')
    else:
        form = PasswordChangeForm(request.user)

    return render(request, 'profile/change_password.html', {'form': form})

@login_required
def change_username(request):
    if request.method == 'POST':
        form = ChangeUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('profile:profile')
    else:
        form = ChangeUsernameForm(instance=request.user)

    return render(request, 'profile/change_username.html', {'form': form})

@login_required
def friends(request):
	return render(request, 'profile/friends.html')

@login_required
def searchfriends(request):
	return render(request, 'profile/searchfriends.html')