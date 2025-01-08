from django import forms
from django.contrib import admin
from .models import Profile

class ProfileAdminForm(forms.ModelForm):
	delete_profile_picture = forms.BooleanField(
		required=False, label='Delete profile picture'
	)

	class Meta:
		model = Profile
		fields = '__all__'

	def save(self, commit=True):
		if self.cleaned_data.get('delete_profile_picture'):
			self.instance.profile_picture = None
		return super().save(commit)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    form = ProfileAdminForm
    list_display = ('user', 'full_name', 'city', 'bio', 'birth_date')
    list_filter = ('user',)
    search_fields = ('user__username',)