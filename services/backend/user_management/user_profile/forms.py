from django import forms
from django.conf import settings
from datetime import datetime
from django.forms.widgets import DateInput

from .models import Profile

CURRENT_YEAR=datetime.now().year
BIRTH_YEARS=range(CURRENT_YEAR - 100, CURRENT_YEAR)

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