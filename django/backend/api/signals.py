from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import FriendShip, User, Score, Code, singleMatch, Message, chatRoom, ticTacToeScore, ticTacToeMatch, chatRoom
from .customObjects import CustomeFriendShip
from .serializers import CustomeFriendShipSerializer
import sys
from .consumers import online_users
import asyncio

@receiver(post_save, sender=User)
def create_score_for_new_user(sender, instance, created, **kwargs):
    if created:
        try:
            Score.objects.create(user=instance)
            ticTacToeScore.objects.create(user=instance)
            Code.objects.create(user=instance)
    
            chatRoom.objects.create(
                user1=instance,
                user2=instance,
                chat_status=True,
                banner_id=-1,
                chat_type=1,
            )


        except Exception as e:
            pass




@receiver(post_save, sender=ticTacToeMatch)
def update_tictactoe_user_score(sender, instance, created, **kwargs):
    if created:
        try:
            if instance.player1_score == instance.player2_score:
                winner_score = ticTacToeScore.objects.get(user=instance.player1)
                loser_score = ticTacToeScore.objects.get(user=instance.player2)

                winner_score.number_matches += 1
                loser_score.number_matches += 1

                winner_score.save()
                loser_score.save()

            else:
                winner_user = instance.player1 if instance.player1_score > instance.player2_score else instance.player2
                loser_user = instance.player2 if instance.player1_score > instance.player2_score else instance.player1

                winner_score = ticTacToeScore.objects.get(user=winner_user)
                loser_score = ticTacToeScore.objects.get(user=loser_user)

                winner_score.number_matches += 1
                winner_score.number_wins += 1
                winner_score.points_number += 2
                winner_score.save()

                loser_score.number_matches += 1
                loser_score.numbers_losers += 1
                loser_score.save()

        except Exception as e:
            pass

# @receiver(post_save, sender=singleMatch)
# def update_user_score(sender, instance, created, **kwargs):
#     if created:
#         try:

#             winner_user = instance.player1 if instance.player1_score > instance.player2_score else instance.player2
#             loser_user = instance.player2 if instance.player1_score > instance.player2_score else instance.player1

#             print(f"winner is {winner_user}", file=sys.stderr)
#             print(f"loser is {loser_user}", file=sys.stderr)

#             winner_score = Score.objects.get(user=winner_user)
#             loser_score = Score.objects.get(user=loser_user)

#             winner_score.number_matches += 1
#             winner_score.number_wins += 1
#             winner_score.points_number += 2
#             winner_score.save()

#             loser_score.number_matches += 1
#             loser_score.numbers_losers += 1
#             loser_score.save()

#         except Exception as e:
#             pass

@receiver(post_delete, sender=FriendShip)
def notification_created(sender, instance, **kwargs):

    reciever_id = instance.friend_ship_reciever.id

    if reciever_id in online_users:

        try:
            user_objects = online_users[reciever_id]

            for item in user_objects:
                asyncio.run(item.customeSend({
                    "message": "friendship deleted",
                    "action": 'delete_friendship',
                }))
        except Exception as e:
           pass



@receiver(post_save, sender=FriendShip)
def notification_created(sender, instance, created, **kwargs):
    if created:
        
        if(instance.status == 0):
            try:
                reciever_id = instance.friend_ship_reciever.id
                
                if reciever_id in online_users:
                    user_objects = online_users[reciever_id]

                    for item in user_objects:
                        asyncio.run(item.customeSend({
                            "message": "new friendship",
                            "action": 'new_friendship',
                        }))
            except Exception as e:
                pass

    elif(instance.status == -1 or instance.status == 1):

        try:
            user_id = instance.friend_ship_reciever.id if  instance.friend_ship_reciever.id != instance.banner_id else instance.friend_ship_sender.id
            if user_id in online_users:

                user_objects = online_users[user_id]

                for item in user_objects:

                    asyncio.run(item.customeSend({
                        "message": instance.id,
                        "action": 'chat_ban',
                    }))
        except Exception as e:
            pass


@receiver(post_save, sender=Message)
def new_message_notification(sender, instance, created, **kwargs):

    if created:
        chat_room = instance.chat_room
        user_id = chat_room.user1.id if chat_room.user1.id != instance.message_user.id else chat_room.user2.id

        if user_id in online_users:

            user_objects = online_users[user_id]

            for item in user_objects:
            
                asyncio.run(item.customeSend({
                    "message": 'new message',
                    "action": 'new_message_notify',
                }))

            # group_name = online_users[user_id]['group_name']

            # channel_layer = get_channel_layer()
            # async_to_sync(channel_layer.group_send)(
            #     group_name,
            #     {
            #         "type": "notify",
            #         "message": 'new message',
            #         "action": 'new_message',
            #     }
            # )


@receiver(post_save, sender=chatRoom)
def new_chatroom_notification(sender, instance, created, **kwargs):

    if created and instance.chat_type != 1:
        user_id = instance.user2.id

        if user_id in online_users:
            user_objects = online_users[user_id]

            for item in user_objects:
                asyncio.run(item.customeSend({
                    "message": 'new chatroom created',
                    "action": 'new_chatroom',
                }))

