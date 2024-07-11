# Generated by Django 5.0.4 on 2024-05-09 08:24

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_usermatch_match'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('startDate', models.DateTimeField(auto_now=True)),
                ('endDate', models.DateTimeField()),
                ('status', models.IntegerField()),
                ('maxPlayers', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='userTournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('maatch', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.match')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.tournament')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tourWinner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
