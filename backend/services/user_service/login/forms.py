from typing import Any
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm

class LoginForm(AuthenticationForm):
	
	error_messages=()
 
	def clean(self):
		return super().clean()