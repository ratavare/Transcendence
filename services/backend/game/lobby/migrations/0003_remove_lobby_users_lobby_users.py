# Generated by Django 5.1.1 on 2024-11-26 15:28

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lobby', '0002_alter_lobby_users'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lobby',
            name='users',
        ),
        migrations.AddField(
            model_name='lobby',
            name='users',
            field=models.ManyToManyField(null=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
