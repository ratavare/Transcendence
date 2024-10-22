from django import forms
from django.contrib.auth.models import User
from .models import Profile

class ProfileForm(forms.ModelForm):
	class Meta:
		model = Profile
		fields =['bio', 'birth_date', 'email', 'username']

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['bio'].required = False
		self.fields['birth_date'].required = False
		self.fields['email'].required = False
		self.fields['username'].required = False