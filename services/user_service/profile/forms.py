from django import forms
from django.contrib.auth.models import User
from register.models import Profile

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']
        
    username = forms.CharField(required=False)

class BioForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio']

class BirthDateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['birth_date']

class EmailForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email']
