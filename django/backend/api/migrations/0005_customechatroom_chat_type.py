# Generated by Django 5.1.3 on 2024-11-09 10:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_chatroom_chat_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='customechatroom',
            name='chat_type',
            field=models.IntegerField(default=0),
        ),
    ]
