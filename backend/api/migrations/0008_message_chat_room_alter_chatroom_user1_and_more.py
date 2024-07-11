# Generated by Django 4.2.13 on 2024-05-11 07:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_chatroom'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='chat_room',
            field=models.ForeignKey(default=111, on_delete=django.db.models.deletion.CASCADE, related_name='message_chat_room', to='api.chatroom'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='chatroom',
            name='user1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_room_user1', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='chatroom',
            name='user2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_room_user2', to=settings.AUTH_USER_MODEL),
        ),
    ]