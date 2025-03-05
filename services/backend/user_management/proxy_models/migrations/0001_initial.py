# Generated by Django 5.1.1 on 2025-03-05 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ProxyLobby',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lobby_id', models.CharField(max_length=25, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('gameState', models.CharField(max_length=25)),
                ('player1Score', models.PositiveIntegerField(default=0)),
                ('player2Score', models.PositiveIntegerField(default=0)),
                ('player1Ready', models.BooleanField(default=False)),
                ('player2Ready', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Lobby',
                'verbose_name_plural': 'Lobbies',
                'db_table': 'lobby_lobby',
                'managed': False,
            },
        ),
    ]
