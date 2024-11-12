from django import forms
from datetime import datetime
from django.conf import settings
from profile.models import Profile
from django.forms.widgets import DateInput
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

CURRENT_YEAR=datetime.now().year
BIRTH_YEARS=range(CURRENT_YEAR - 100, CURRENT_YEAR)

class RegistrationForm(UserCreationForm):
	username = forms.CharField(required=True, label="Username")
	password1 = forms.CharField(
		widget=forms.PasswordInput, required=True, label="Password"
	)
	password2 = forms.CharField(
		widget=forms.PasswordInput, required=True, label="Password Confirmation"
	)

	class Meta:
		model = User
		fields = ['username', 'password1', 'password2']

class UpdateProfileForm(forms.ModelForm):
	username = forms.CharField(required=False)
	email = forms.EmailField(required=False)
	birth_date = forms.DateField(
		required=False,
		label= "Date of Birth",
		input_formats=settings.DATE_INPUT_FORMAT,
		# widget = forms.SelectDateWidget(years=BIRTH_YEARS),
	)
	bio = forms.CharField(required=False)

	class Meta:
		model = Profile
		fields =['username', 'email', 'bio', 'birth_date']