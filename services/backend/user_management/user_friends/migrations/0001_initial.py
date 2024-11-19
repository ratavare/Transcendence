# Generated by Django 5.1.1 on 2024-11-19 16:55

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Friendships',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('requested', 'Requested'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='requested')),
                ('created', models.DateTimeField(default=django.utils.timezone.now)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend_resquest_sent', to=settings.AUTH_USER_MODEL)),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend_request_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Friendship',
                'verbose_name_plural': 'Friendships',
                'unique_together': {('from_user', 'to_user')},
            },
        ),
    ]
