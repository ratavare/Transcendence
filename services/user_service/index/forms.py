from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegistrationForm(UserCreationForm):
	username = forms.CharField(required=True, label="Username")
	password1 = forms.CharField(required=True, label="Password", widget=forms.PasswordInput)
	password2 = forms.CharField(required=True, label="Password Confirmation", widget=forms.PasswordInput)

	class Meta:
		model = User
		fields = ['username', 'password1', 'password2']