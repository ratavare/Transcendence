from django import forms
from django.contrib.auth.forms import SetPasswordForm

class CreatePasswordForm(SetPasswordForm):
    class Meta:
        model = User
        fields = ['new_password1', 'new_password2']