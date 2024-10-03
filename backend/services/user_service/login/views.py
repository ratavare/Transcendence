from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm

# Create your views here.
def successView(request):
	return render(request, 'login/success.html')

def loginView(request):
	if request.method == 'POST':
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			user = form.get_user()
			login(request, user)
			return redirect('login:success')
	else:
		form = AuthenticationForm()

	return render(request, "login/login.html", {"form":form})