from django import forms
from datetime import datetime
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

CURRENT_YEAR=datetime.now().year
BIRTH_YEARS=range(CURRENT_YEAR - 100, CURRENT_YEAR)

class RegistrationForm(UserCreationForm):
	username = forms.CharField(required=True, label="Username")
	email = forms.EmailField(required=True, label='Email')
	password1 = forms.CharField(
		widget=forms.PasswordInput, required=True, label="Password"
	)
	password2 = forms.CharField(
		widget=forms.PasswordInput, required=True, label="Password Confirmation"
	)

	class Meta:
		model = User
		fields = ['username', 'email', 'password1', 'password2']
