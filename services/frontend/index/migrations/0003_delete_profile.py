# Generated by Django 5.1.1 on 2025-01-08 17:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0002_profile_city_profile_full_name_profile_otp_secret_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Profile',
        ),
    ]
