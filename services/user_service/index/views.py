import os
from django.shortcuts import render

from register.forms import RegistrationForm
from register.views import auth
from django.contrib.auth.forms import AuthenticationForm

# Create your views here.

def indexView(request):

	auth_code = request.GET.get('code')

	if not auth_code:
		return render(request, 'index/index.html', {
			'url': os.getenv('URL'),
			'registerForm': RegistrationForm(),
			'authenticForm': AuthenticationForm(),
		})

	return auth(request, auth_code)