from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'birth_date', 'profile_picture')  # Add 'profile_picture' here
    list_filter = ('user',)
    search_fields = ('user__username',)