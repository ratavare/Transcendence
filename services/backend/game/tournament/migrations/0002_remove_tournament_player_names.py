# Generated by Django 5.1.1 on 2025-03-07 14:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='player_names',
        ),
    ]
