# Generated by Django 5.1.1 on 2025-03-06 13:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender', models.CharField(blank=True, max_length=100)),
                ('content', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.IntegerField(default=0)),
                ('z', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Lobby',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lobby_id', models.CharField(max_length=25, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('gameState', models.CharField(choices=[('running', 'Running'), ('closed', 'Closed'), ('paused', 'Paused')], default='closed')),
                ('player1Score', models.PositiveIntegerField(default=0)),
                ('player2Score', models.PositiveIntegerField(default=0)),
                ('player1Ready', models.BooleanField(default=False)),
                ('player2Ready', models.BooleanField(default=False)),
                ('users', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='GameWinner', to=settings.AUTH_USER_MODEL)),
                ('chat', models.ManyToManyField(to='lobby.message')),
                ('ballPosition', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='BallPosition', to='lobby.position')),
                ('paddle1Position', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='Paddle1Position', to='lobby.position')),
                ('paddle2Position', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='Paddle2Position', to='lobby.position')),
            ],
        ),
    ]
