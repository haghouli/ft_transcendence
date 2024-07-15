import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from . import models
from django.utils import timezone
from .models import Message, chatRoom
from .serializers import MessageSerializer
import sys
import uuid

online_users = {}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):


        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_room_{self.room_name}"

        if self.scope['user']:
            user_id = self.scope['user'].id

            # check is user allowed to join the chat room
            isAllowd = await self.check_user_permition(self.room_name, user_id)
        
            if isAllowd:
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender_id = text_data_json["sender_id"]
        receiver_id = text_data_json["receiver_id"]

        await self.create_message(sender_id, receiver_id, message)
    
        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "chat.message",
                "message": message,
                "sender_id": sender_id,
                "receiver_id" : receiver_id,
            }
        )

    async def chat_message(self, event):
        message = event["message"]
        sender_id = event["sender_id"]
        messages =  await self.get_last_20_messages()
        await self.send(text_data=json.dumps( { "sender_id": sender_id, "messages": messages } ))

    
    @database_sync_to_async
    def get_last_20_messages(self):
        try:
            chat_room_id = self.scope["url_route"]["kwargs"]["room_name"]
            messages = Message.objects.filter(chat_room__id=int(chat_room_id)).order_by('send_date')[:20]
            serializer = MessageSerializer(messages, many=True)
            return serializer.data
        
        except Exception as e:
            print(e);


    @database_sync_to_async
    def create_message(self, sender_id, receiver_id, message):

        try:
            chat_room_id = self.scope["url_route"]["kwargs"]["room_name"]

            sender = models.User.objects.get(pk=int(sender_id))
            receiver = models.User.objects.get(pk=int(receiver_id))
            chat_room =models.chatRoom.objects.get(pk=int(chat_room_id))
            read_date = timezone.now()

            return Message.objects.create(
                message_sender=sender,
                message_reciever=receiver,
                message_content=message,
                read_date=read_date,
                chat_room=chat_room,
            )
        except Exception as e:
            print(e)
    
    @database_sync_to_async
    def check_user_permition(self, room_id, user_id):
        try:
            chat_room = chatRoom.objects.get(pk=int(room_id))
            if chat_room.user1.id != int(user_id) and chat_room.user2.id != int(user_id):
                return False
            return True
        except Exception as e:
            print(e)
            return False


#**************************************************************************************************************

class OnlineConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        print(f"the user is : {self.scope['user'].id}" , file=sys.stderr)

        if self.scope['user']:
            if self.scope['user'].id not in online_users:
                self.group_name = f'group_name_{self.scope['user'].id}'
                print(self.group_name, file=sys.stderr)
                online_users[self.scope['user'].id] = {'counter': 1, 'channel_name': self.channel_name, 'group_name': self.group_name}
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.updata_user_status(True)
                print(f'connect first time {online_users[self.scope['user'].id]['counter']}', file=sys.stderr)
            else:
                online_users[self.scope['user'].id]['counter'] += 1
                self.group_name = online_users[self.scope['user'].id]['group_name']
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                print(f'connect another time {online_users[self.scope['user'].id]['counter']}', file=sys.stderr)

            await self.accept()


    async def receive(self, text_data):
        pass

    async def disconnect(self, close_code):
        online_users[self.scope['user'].id]['counter'] -= 1
        if online_users[self.scope['user'].id]['counter'] == 0:
            print(f'disconnect {online_users[self.scope['user'].id]['counter']}', file=sys.stderr)
            await self.updata_user_status(False)
            del online_users[self.scope['user'].id]
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        else:
            print(f'disconnect {online_users[self.scope['user'].id]['counter']}', file=sys.stderr)
    
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({ 'message': event['message'] }))

    @database_sync_to_async
    def updata_user_status(self, is_online):
        try:
            user = models.User.objects.get(pk=self.scope['user'].id)
            user.is_online = is_online
            user.save()
        
        except Exception as e:
            print(e, file=sys.stderr)


