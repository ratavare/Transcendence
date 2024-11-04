from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegistrationForm(UserCreationForm):
	username = forms.CharField(required=True, label="Username")
	password1 = forms.CharField(required=True, label="Password")
	password2 = forms.CharField(required=True, label="Password Confirmation")

	class Meta:
		model = User
		fields = ['username', 'password1', 'password2']