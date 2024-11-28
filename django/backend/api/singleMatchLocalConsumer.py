from channels.generic.websocket import AsyncWebsocketConsumer
import json, sys
from .game import Player, Ball, Net, Table, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_POS, gameOver, movePlayer
import asyncio
MAX_SCORE = 5
class SingleMatchLocalConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.type = self.scope['url_route']['kwargs']['type']
        await self.accept()
        if (self.type == "multi"):
            tabel = Table(1000, 1000)
            ball = Ball(tabel.width / 2, tabel.height / 2)
            self.game_state = {
                'ball': ball,
                'net': Net(),
                'lplayer': Player(20),
                'rplayer': Player(tabel.width - PLAYER_WIDTH - PLAYER_POS),
                'tplayer': Player(tabel.width / 2, PLAYER_POS, PLAYER_HEIGHT, PLAYER_WIDTH),
                'table': tabel,
            }
        else:
            tabel = Table(1086, 624)
            self.game_state = {
                'ball': Ball(tabel.width / 2, tabel.height / 2),
                'net': Net(),
                'lplayer': Player(20),
                'rplayer': Player(tabel.width - PLAYER_WIDTH - 20), 
                'table':tabel,
            }
             
        await self.send(text_data=json.dumps({
                    'action': 'startGame',
                    }))

    async def receive(self, text_data):

        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        if action and action == 'startGame':
            asyncio.create_task(self.send_data_periodically())
        elif action == "move_player":
            key = text_data_json.get('key')
            if self.type == "multi":
                movePlayer(key, self.game_state['lplayer'], self.game_state['rplayer'], self.game_state['table'], self.game_state['tplayer']) 
            else:
                movePlayer(key, self.game_state['lplayer'], self.game_state['rplayer'], self.game_state['table']) 

        pass

    async def disconnect(self, close_code):
        pass

    async def send_data_periodically(self):

        while True:
            if self.type == "multi":
                if  gameOver(self.game_state['lplayer'] ,self.game_state['rplayer'], 5, self.game_state['tplayer'] ) is  not None:
                    await self.endGame(self.game_state['lplayer'] ,self.game_state['rplayer'], self.game_state['tplayer'])
                    self.close
                    break
            elif  gameOver(self.game_state['lplayer'] ,self.game_state['rplayer'], MAX_SCORE) is  not None:
                await self.endGame(self.game_state['lplayer'], self.game_state['rplayer'])
                self.close
                break
            if self.type == "multi":
                self.game_state['ball'].update(self.game_state['lplayer'], self.game_state['rplayer'], self.game_state['table'], self.game_state['tplayer'])
                data = {
                    'lplayer': self.game_state['lplayer'].to_dict(),
                    'rplayer': self.game_state['rplayer'].to_dict(),
                    'tplayer': self.game_state['tplayer'].to_dict(),
                    'net': self.game_state['net'].to_dict(),
                    'ball': self.game_state['ball'].to_dict(),
                    'table': self.game_state['table'].to_dict(),
                    'name' : 'alaoui ali'

                }
            else:
                self.game_state['ball'].update(self.game_state['lplayer'], self.game_state['rplayer'], self.game_state['table'])
                data = {
                    'lplayer': self.game_state['lplayer'].to_dict(),
                    'rplayer': self.game_state['rplayer'].to_dict(),
                    'net': self.game_state['net'].to_dict(),
                    'ball': self.game_state['ball'].to_dict(),
                    'table': self.game_state['table'].to_dict(),
                    'name' : 'alaoui ali'
                }
            await self.send(text_data=json.dumps({
                    'action': 'changes',
                    'game_state': data,
                    }))
            await asyncio.sleep(0.01)

    async def endGame(self, lplayer, rplayer, tplayer = None):
        data = {
            'lplayer' : lplayer.to_dict(),
            'rplayer' : rplayer.to_dict()
        }
        if tplayer is not None:
           data['tplayer'] = tplayer.to_dict()
        await self.send(text_data=json.dumps({
            'action': 'gameOver',
            'game_state': data,

        }))
        