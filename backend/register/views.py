from django.shortcuts import render, redirect
from django.views import generic
from django.contrib.auth.models import User
from django.contrib.auth import login

# Create your views here.

from .forms import RegistrationForm

def register(request):
	if request.method == "POST":
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect('register:user')
	else:
		form = RegistrationForm()
		
	return render(request, 'register/register.html', {"form":form})

class UsersView(generic.ListView):
	template_name = "register/user.html"
	context_object_name = "user_list"

	def get_queryset(self):
		return User.objects.all()