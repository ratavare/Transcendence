from django.contrib.auth import update_session_auth_hash, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from .forms import ChangeUsernameForm

def profileView(request):
	return render(request, 'profile/profile.html')

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