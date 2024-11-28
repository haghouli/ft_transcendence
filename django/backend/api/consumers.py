import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from . import models
from django.utils import timezone
from .models import Message, chatRoom
from .serializers import MessageSerializer
import sys
import uuid
from datetime import datetime

import uuid

import asyncio

from django.db.models import Q
import string, random

online_users = {}
ticTacTocGameQueue = {}
boards = {}
game_queue_lock = asyncio.Lock()

class ticTacToe:

    def __init__(self):

        self.winnerState = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],

            [0, 4, 8],
            [2, 4, 6],
        ]
        
        self.grid = [
            '.', '.', '.',
            '.', '.', '.',
            '.', '.', '.',
        ]
    
    def hasWinner(self):
        for e in self.winnerState:
            [a, b, c] = e
            if self.grid[a] == self.grid[b] == self.grid[c] == 'X':
                return 'X'
            elif self.grid[a] == self.grid[b] == self.grid[c] == 'O':
                return 'O'
        return False

    def hasMovesLeft(self):
        for e in self.grid:
            if e == '.':
                return True
        return False

    def makeMove(self, idx, c):
        if self.grid[idx] != '.' :
            return 'I'
        self.grid[idx] = c
        res = self.hasWinner()
        if res != False:
            return res
        if not self.hasMovesLeft():
            return 'D'
        return True



#**************************************************************************************************************

class OnlineConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        try:
            if self.scope['user']:
                if self.scope['user'].id not in online_users:
                    online_users[self.scope['user'].id] = []
                online_users[self.scope['user'].id].append(self)
                await self.updata_user_status(True)

                await self.accept()
        except Exception as e:
            pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        action = text_data_json["action"]
        reciever_id = text_data_json["reciever_id"]
        sender_id = text_data_json["sender_id"]
        if action == 'chatting':
            await self.create_message(sender_id, reciever_id, message)
        
            if int(reciever_id) in online_users:
                recievers = online_users[int(reciever_id)]
                for e in recievers :
                    await e.customeSend({
                        'message': message,
                        'action': 'new_message',
                    })
        if action == 'play_request':
            if int(reciever_id) in online_users:
                recievers = online_users[int(reciever_id)]
                for e in recievers :
                    await e.customeSend({
                        'message': message,
                        'action': action,
                    })
        if action == 'play_request_accepted':
            if int(reciever_id) in online_users:
                recievers = online_users[int(reciever_id)]
                for e in recievers :
                    await e.customeSend({
                        'message': message,
                        'action': action,
                    })
        if action == 'bot_message':
            await self.create_message(sender_id, reciever_id, message)
            if int(reciever_id) in online_users:
                recievers = online_users[int(reciever_id)]
                for e in recievers :
                    await e.customeSend({
                        'message': message,
                        'action': action,
                    })

    async def disconnect(self, close_code):
        online_users[self.scope['user'].id].remove(self)
        if len(online_users[self.scope['user'].id]) == 0:
            await self.updata_user_status(False)
            del online_users[self.scope['user'].id]
    

    async def customeSend(self, data):
        await self.send(text_data=json.dumps({
            'message': data['message'],
            'action': data['action'],
        }))
    
    async def notify(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'action': event['action'],
        }))

    async def new_friendship(self, event):
        await self.send(text_data=json.dumps({ 'message': event['message'] }))


    @database_sync_to_async
    def updata_user_status(self, is_online):
        try:
            user = models.User.objects.get(pk=self.scope['user'].id)
            user.is_online = is_online
            user.save()
        
        except Exception as e:
            return None


    @database_sync_to_async
    def create_message(self, sender_id, reciever_id, message):

        try:
            sender = models.User.objects.get(pk=int(sender_id))
            reciever = models.User.objects.get(pk=int(reciever_id))

            chat_room = models.chatRoom.objects.get(
                (Q(user1__id=sender.id) & Q(user2__id=reciever.id))
                | (Q(user2__id=sender.id) & Q(user1__id=reciever.id))
            )

            read_date = timezone.now()

            return Message.objects.create(
                message_user=sender,
                message_content=message,
                read_date=read_date,
                chat_room=chat_room,
            )
        except Exception as e:
            return None


class ticTacToeConusmer(AsyncWebsocketConsumer):

    async def connect(self):
        async with game_queue_lock:
            self.group_name = ""
            self.player_id = None
            self.player_id = None
            try :
                current_user = self.scope['user']
                level = await self.get_level(current_user.id)

                if level not in ticTacTocGameQueue:
                    ticTacTocGameQueue[level] = {}
                ticTacTocGameQueue[level][current_user.id] = self
                await self.accept()
            
                if len(ticTacTocGameQueue[level])  >= 2:

                    group_name = str(uuid.uuid4())
                    boards[group_name] = ticTacToe()
                    player1 = ticTacTocGameQueue[level].pop(next(iter(ticTacTocGameQueue[level])))
                    player2 = ticTacTocGameQueue[level].pop(next(iter(ticTacTocGameQueue[level])))

                    player1.group_name = group_name
                    player2.group_name = group_name

                    player1.player1_id = player1.scope['user'].id
                    player1.player2_id = player2.scope['user'].id

                    player2.player1_id = player1.scope['user'].id
                    player2.player2_id = player2.scope['user'].id

                    p1 = {
                        'id': player1.scope['user'].id,
                        'username': player1.scope['user'].username,
                        'avatar': player1.scope['user'].avatar.url,
                    }

                    p2 = {
                        'id': player2.scope['user'].id,
                        'username': player2.scope['user'].username,
                        'avatar': player2.scope['user'].avatar.url,
                    }

                    await player1.custome_send({
                        'action': 'match_found',
                        'message': 'match found',
                        'turn_to_play': True,
                        'c': 'X',
                        'is_over': False,
                        'player1': p1,
                        'player2': p2,
                    })

                    await player2.custome_send({
                        'action': 'match_found',
                        'message': 'match found',
                        'turn_to_play': False,
                        'c': 'O',
                        'is_over': False,
                        'player1': p1,
                        'player2': p2,
                    })

                    await self.channel_layer.group_add(self.group_name, player1.channel_name)
                    await self.channel_layer.group_add(self.group_name, player2.channel_name)
                    
            except Exception as e:
                self.close()



    async def disconnect(self, code):
        await self.channel_layer.group_send(self.group_name, {
            'type': 'custome_send',
            'action': 'disconnection',
            'message': 'Your opponent disconnected',
            'is_over': True,
        })
        del boards[self.group_name]

    @database_sync_to_async
    def create_matche(self, user1_score, user2_score):
        user1 = models.User.objects.get(pk=int(self.player1_id))
        user2 = models.User.objects.get(pk=int(self.player2_id))

        new_match = models.ticTacToeMatch(
            player1=user1,
            player2=user2,
            player1_score=user1_score,
            player2_score=user2_score,
        )

        new_match.save()

    @database_sync_to_async
    def get_level(self, id):
        score = models.ticTacToeScore.objects.get(user__id=id)
        nb_points = score.points_number
        if nb_points != 0:
            return int(nb_points / 20)
        return 0

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        idx = data['idx']
        action = data['action']
        message = data['message']
        c = data['c']

        res = boards[self.group_name].makeMove(int(idx), c)

        details = {}

        is_over = False

        if res == 'I':
            details = {
                'type': 'custome_send',
                'action': 'invalid_move',
                'message': 'invalid move',
                'is_over': is_over,
            }
        elif res == 'X' or res == 'O':
            is_over = True
            details = {
                'type': 'custome_send',
                'message': f'the Player {res} won the game.',
                'action': 'winne_state',
                'idx': idx,
                'c': c,
                'is_over': is_over,
            }
            if res == 'X':
                await self.create_matche(1, 0)
            else:
                await self.create_matche(0, 1)
            del boards[self.group_name]
        elif res == 'D':
            is_over = True
            details = {
                'type': 'custome_send',
                'message': 'Draw',
                'action': 'draw',
                'idx': idx,
                'c': c,
                'is_over': is_over,
            }
            await self.create_matche(1, 1)
            del boards[self.group_name]
        else:
            details = {
                'type': 'custome_send',
                'message': message,
                'idx': idx,
                'action': action,
                'c': c,
                'is_over': is_over,
            }
        await self.channel_layer.group_send(self.group_name, details)

    async def custome_send(self, data):
        is_over = data['is_over']
        await self.send(text_data=json.dumps(data))

        if is_over:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
    