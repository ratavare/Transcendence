import os

from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm

def loginSuccessView(request):
	return render(request, 'login/loginSuccess.html')

def loginView(request):
	if request.method == 'POST':
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			user = form.get_user()
			login(request, user)
			return redirect('/')
	else:
		form = AuthenticationForm()

	context = {
		"authenticForm": form,
		"url": os.getenv('URL'),
	}

	return render(request, "login/login.html", context)