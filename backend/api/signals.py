from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import FriendShip, User, Score, Code, singleMatch
import sys
from .consumers import online_users

@receiver(post_save, sender=User)
def create_score_for_new_user(sender, instance, created, **kwargs):
    if created:
        Score.objects.create(user=instance)
        Code.objects.create(User=instance)


@receiver(post_save, sender=FriendShip)
def notification_created(sender, instance, created, **kwargs):
    if created:
        reciever_id = instance.friend_ship_reciever.id
        if reciever_id in online_users:

            group_name = online_users[reciever_id]['group_name']

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "send_notification",
                    "message": 'friendship_added'
                }
            )