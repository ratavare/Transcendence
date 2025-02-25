# Generated by Django 5.1.1 on 2024-12-20 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lobby', '0002_position_lobby_gamestate_lobby_player1ready_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender', models.CharField(blank=True, max_length=150)),
                ('content', models.TextField(blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='lobby',
            name='chat',
            field=models.ManyToManyField(to='lobby.message'),
        ),
    ]
