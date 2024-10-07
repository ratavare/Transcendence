from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import logout

def logoutSuccessView(request):
	return render(request, 'logout/logoutSuccess.html')

def logoutView(request):
	logout(request)
	return redirect('/')