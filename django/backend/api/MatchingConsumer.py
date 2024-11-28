import json

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import Q
from .models import User, singleMatch, Score
import time
import sys, asyncio, logging
from .game import Player, Ball, Net, Table, PLAYER_WIDTH, PLAYER_HEIGHT, gameOver, PLAYER_POS, movePlayerRemote
from datetime import datetime

MAX_SCORE = 5

class MatchmakingConsumer(AsyncWebsocketConsumer):
    waiting_players = []
    channel_name_map = {}
    room_name = None
    playing_rooms = {}
    cpt = 0


    async def connect(self):
        self.user = self.scope["user"]
        self.room_name = None
        self.player1 = None
        self.player2 = None
        self.now = None
        try:
            if self.user:
                self.__class__.cpt += 1
                if self.user.username in self.__class__.channel_name_map:
                    if (await self.is_player_in_active_game(self.user.username)):
                        await self.resumeGame()
                    else:
                        self.__class__.channel_name_map.pop(self.user.username)
                        await self.joinGame()
                else:
                    await self.joinGame()
            else:
                await self.close()
        except:
            pass

    async def joinGame(self):
        player = await self.get_player_obj(self.user)
        player_infos = await self.player_dict(player)
        if self.user.username in self.__class__.waiting_players:
            await self.accept()
            await self.send(text_data=json.dumps({
                    'status': 'deja',
                    'username': self.user.username,
                    }))
        else:
            await self.accept()
            await self.add_to_waiting_list()
            if (len (self.waiting_players) == 1):
                order = 1
            else:
                order = 12  

            await self.send(text_data=json.dumps({
                    'status': 'waiting_opponent',
                    'player': player_infos,
                    'image': f'./images/{self.user.username}.jpeg',
                    'order' : order
                    }))
            await self.match_players()

    async def resumeGame(self):
        await self.accept()
        if self.room_name == None:
            self.room_name = await self.get_player_room()   
            if self.room_name == None:
                await self.internal_server_error()
                return
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        self.player1, self.player2 = await self.get_players_by_room()
        player1_infos = await self.player_dict(self.player1)
        player2_infos = await self.player_dict(self.player2)
        player = await self.get_player_obj(self.user)
        player_infos = await self.player_dict(player)


        await self.send(text_data=json.dumps({
                'status': 'game_resumed',
                'player1': player1_infos,
                'player2': player2_infos,
                'player' : player_infos
                }))
        
    async def disconnect(self, close_code):
        self.remove_from_waiting_list()
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        
    async def add_to_waiting_list(self):
        self.__class__.channel_name_map[self.user.username] = self.channel_name
        self.__class__.waiting_players.append(self.user.username)
        

    def remove_from_waiting_list(self):
        if self.user.username in self.__class__.waiting_players:
            self.__class__.waiting_players.remove(self.user.username)

    async def match_players(self):
        if len(self.__class__.waiting_players) >= 2:
            self.acknowledgments = 0
            self.player1 = await self.get_player_obj(self.__class__.waiting_players.pop(0)) 
            self.player2 = await self.get_player_obj(self.__class__.waiting_players.pop(0))
            player1_infos = await self.player_dict(self.player1)
            player2_infos = await self.player_dict(self.player2)
            self.room_name = await self.generate_unique_room_name()
            await self.create_match(self.room_name, self.player1, self.player2)

            player1_channel = await self.get_channel_name(self.player1.username)
            player2_channel = await self.get_channel_name(self.player2.username)

            await self.channel_layer.group_add(self.room_name, player1_channel)
            await self.channel_layer.group_add(self.room_name, player2_channel)
            await self.inform_PlayersMathced(player1_infos, player2_infos )


            # Format the current time with milliseconds
    async def inform_PlayersMathced(self, player1_infos, player2_infos):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'playersMatched',
                'status': 'players_matched',
                'player1': player1_infos,
                'player2': player2_infos,
                'player1Image': './images/aankote.jpeg',
                'player2Image': './images/aayoub.jpeg'
            }
        )

    async def playersMatched(self, event):
        await self.send(text_data=json.dumps({
            'status': event['status'],
            'player1' : event['player1'],
            'player2' : event['player2'],
            'player1Image' : event['player1Image'],
            'player2Image' :  event['player2Image']
        }))

    async def internal_server_error(self):
        await self.send(text_data=json.dumps({
            'status': 'http500'
        }))

    async def createGame(self):
        lplayer_infos   = await self.player_infos(self.player1)
        rplayer_infos   = await self.player_infos(self.player2)
        table = Table(1083, 624)
        self.__class__.playing_rooms[self.room_name] = {
            'ball': Ball(table.width / 2, table.height / 2),
            'net': Net(),
            'lplayer': Player(PLAYER_POS),
            'rplayer': Player(Table.width - PLAYER_WIDTH - PLAYER_POS),
            'table': table,
        }
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'pre_match',
                'status': 'pre_match', 
                'lplayer_obj': lplayer_infos,
                'rplayer_obj': rplayer_infos,
            })
    
    async def pre_match(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pre_match',
            'status': event['status'],
            'lplayer_obj' : event['lplayer_obj'],
            'rplayer_obj' : event['rplayer_obj'],
        }))
            
    async def player_infos(self, player):
        return{
            'first_name' : player.first_name,
            'last_name' : player.last_name,
            'username' : player.username,
        }
    
    async def startGame(self):
        if not self.__class__.playing_rooms.get(self.room_name):
            await self.createGame()
            self.__class__.playing_rooms[self.room_name]['task'] = asyncio.create_task(self.send_data_periodically())

    async def setPlayers(self, event):
        await self.send(text_data=json.dumps({
            'type': 'setPlayers',
            'message' : event['message'],
            'status' : event['status'],
            'player1' :event['player1'],
            'player2' :event['player2'],
        }))


#/********************************************************************************************************/


    async def receive(self, text_data):
        if self.room_name == None:
            self.room_name = await self.get_player_room()
            self.player1, self.player2 = await self.get_players_by_room()
        text_data_json = json.loads(text_data)

        action = text_data_json.get('action')
        if action == 'gave_up':
            await self.gavingUp()

        if action == 'start_match':
            await self.startGame()

        if self.room_name in self.__class__.playing_rooms:
            key = text_data_json.get('key')
            game_state = self.__class__.playing_rooms[self.room_name]
            movePlayerRemote(key, game_state, self.player1.username, self.user.username)

    async def generate_unique_room_name(self):
        while True:
            room_name = f"room_{int(time.time() * 1000)}"
            exists = await self.room_exists(room_name)
            if not exists:
                return room_name
            
    async def gavingUp(self):
        task = self.__class__.playing_rooms[self.room_name].get('task')

        # Check if the task exists and is still running, then cancel it
        if task and not task.done():
            task.cancel()
        game_state = self.__class__.playing_rooms[self.room_name]
        if self.user.username == self.player1.username:
            game_state['lplayer'].score = 0
            game_state['rplayer'].score = MAX_SCORE
            await self.save_match_score(self.player1, self.player2, game_state['lplayer'].score, game_state['rplayer'].score)
            await self.save_match_stats(game_state['lplayer'].score, game_state['rplayer'].score)
            pass
        else:
            game_state['lplayer'].score = MAX_SCORE
            game_state['rplayer'].score = 0
            await self.save_match_score(self.player1, self.player2, game_state['lplayer'].score, game_state['rplayer'].score)
            await self.save_match_stats(game_state['lplayer'].score, game_state['rplayer'].score)
        await self.mark_room_inactive()
        # del self.__class__.playing_rooms[self.room_name]
        self.__class__.channel_name_map.pop(self.player1.username)
        self.__class__.channel_name_map.pop(self.player2.username)
        # First, get the task object
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'notify_opponent',
                'status' : 'leaving',
                'left_player': self.user.username
            })
            
    
    async def notify_opponent(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'notify_opponent',
                'status': event['status'],
                'left_player': event['left_player']
            }
        ))

    async def send_data_periodically(self):
        game_state = self.__class__.playing_rooms[self.room_name]
        while True:
            self.player1_info = await self.player_dict(self.player1)
            self.player2_info = await self.player_dict(self.player2)
            if gameOver(game_state['lplayer'] ,game_state['rplayer'], MAX_SCORE ) is  not None:
                await self.endTheGame()
                break
            game_state['ball'].update(game_state['lplayer'], game_state['rplayer'], game_state['table'])
            data = {
                'type': 'game_state',
                'action': 'changes',
                'player': game_state['lplayer'].to_dict(),
                'opponent': game_state['rplayer'].to_dict(),
                'net': game_state['net'].to_dict(),
                'ball': game_state['ball'].to_dict(),
                'table': game_state['table'].to_dict(),
                'username':self.user.username,
                'lplayer_obj':self.player1_info,
                "rplayer_obj": self.player2_info
            }

            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'game_state',
                    'data': data,
                }
            )
            await asyncio.sleep(0.01)
    
    async def game_state(self, event):
        data = event['data']
        await self.send(text_data=json.dumps(data))

    
    async def endTheGame(self):
        if not await self.is_player_in_active_game(self.user.username):
            return
        game_state = self.__class__.playing_rooms[self.room_name]
        if gameOver(game_state['lplayer'] ,game_state['rplayer'], MAX_SCORE ) is game_state['lplayer']:
            self.winner = self.player1.username
            self.loser = self.player2.username
            self.winnerScore = game_state['lplayer'].score
            self.loserScore = game_state['rplayer'].score
            await self.save_match_score(self.player1, self.player2, game_state['lplayer'].score, game_state['rplayer'].score)
            await self.save_match_stats(game_state['lplayer'].score, game_state['rplayer'].score)

        if gameOver(game_state['lplayer'] ,game_state['rplayer'], MAX_SCORE ) is game_state['rplayer']:
            self.winner = self.player2.username
            self.loser = self.player1.username
            self.winnerScore = game_state['rplayer'].score
            self.loserScore = game_state['lplayer'].score
            await self.save_match_score(self.player1, self.player2, game_state['lplayer'].score, game_state['rplayer'].score)
            await self.save_match_stats(game_state['lplayer'].score, game_state['rplayer'].score)

        await self.mark_room_inactive()
        data = {
            'action': 'game_over',
            'winner': self.winner,
            'loser' : self.loser,
            'winnerScore' : self.winnerScore,
            'loserScore' : self.loserScore
        }
        if self.room_name in self.__class__.playing_rooms:
            if 'task' in self.__class__.playing_rooms[self.room_name]:
                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'game_over',
                        'data': data,
                    }
                )
                self.__class__.playing_rooms[self.room_name]['task'].cancel()
            del self.__class__.playing_rooms[self.room_name]
        self.__class__.channel_name_map.pop(self.player1.username)
        self.__class__.channel_name_map.pop(self.player2.username)
        
    async def game_over(self, event):
        data = event['data']
        await self.send(text_data=json.dumps(data))

    @sync_to_async
    def save_match_score(self, player1, player2, player1_score, player2_score):
        try:
            score1 = Score.objects.filter(user=player1).first()
            score2 = Score.objects.filter(user=player2).first()

            if player1_score > player2_score:
                if score1 and score2:
                    score1.number_matches += 1
                    score1.number_wins += 1
                    score1.points_number += 2
                    score1.save()

                    score2.number_matches += 1
                    score2.numbers_losers += 1
                    score2.save()
            else:
                if score1 and score2:
                    score2.number_matches += 1
                    score2.number_wins += 1
                    score2.points_number += 2
                    score2.save()

                    score1.number_matches += 1
                    score1.numbers_losers += 1
                    score1.save()
        except Exception as e:
            pass
    @sync_to_async
    def save_match_stats(self, player1_score, player2_score):
        room = singleMatch.objects.filter(name=self.room_name).first()
        if room:
            room.is_active = False
            room.player1_score = player1_score
            room.player2_score = player2_score
            room.save()
            return room.name
        return None
    
    @sync_to_async
    def room_exists(self, room_name):
        return singleMatch.objects.filter(name=room_name).exists()

    @sync_to_async
    def create_match(self, room_name, player1, player2):
        singleMatch.objects.create(
            name=room_name,
            player1=player1,
            player2=player2,
            is_active=True
        )

    @sync_to_async
    def get_channel_name(self, username):
        return self.__class__.channel_name_map.get(username)

    @sync_to_async
    def is_player_in_active_game(self, username):
        return singleMatch.objects.filter(
            Q(player1__username=username, is_active=True) | Q(player2__username=username, is_active=True)
        ).exists()

    @sync_to_async
    def mark_room_inactive(self):
        room = singleMatch.objects.filter(
            Q(player1__username=self.user.username) | Q(player2__username=self.user.username),
            is_active=True
        ).first()
        if room:
            room.is_active = False
            room.save()
            return room.name
        return None
    
    @sync_to_async 
    def get_player_obj(self, username):
        user = User.objects.filter(
            Q(username=username)).first()
        return user
    
    @sync_to_async 
    def get_player_room(self):
        room = singleMatch.objects.filter(
            Q(player1__username=self.user.username, is_active=True) | Q(player2__username=self.user.username, is_active=True)).first()
        return room.name if room else None

    @sync_to_async 
    def get_players_by_room(self):
        match = singleMatch.objects.filter(Q(name=self.room_name)).first()
        if match:
            player1 = match.player1
            player2 = match.player2
            return player1, player2
        else:
            return None, None 

    async def opponent_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_left',
            'status': event['status']
        }))
            
    async def player_dict(self, player):
        return{
            'first_name' : player.first_name,
            'last_name' : player.last_name,
            'username' : player.username,
            'avatar' : player.avatar.url,
        }