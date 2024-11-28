from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Player, Ball, Net, Table, PLAYER_WIDTH, PLAYER_POS, gameOver, movePlayer
import json, asyncio, copy, random, sys
MAX_SCORE = 3
class TournamentLogicConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.players = []
        self.matches = []
        self.tours = {}
        self.match_nbr = 0
        self.tour = 0
        self.next_match = 0
        self.next_player = 0
        self.next_tour = 0

        await self.accept()
        self.tourType = self.scope['url_route']['kwargs']['type']

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action= text_data_json.get('action')
        if (action == "player_joined"):
            user = text_data_json.get('user')
            if not self.userExists(user):
                self.players.append(user)
                self.create_tournament_dict()
                self.create_matchs()
                await self.start_tournament()
            else:    
                await self.send(text_data=json.dumps({
                        'status': 'userFound'
                    }))
                

        if action == "start_match":
            self.start_match()
        
        if action == "move_player":
            key = text_data_json.get('key')
            if key == "ArrowUp" or key == "ArrowDown" or key == "w" or key == "s":
                movePlayer(key, self.game_state['lplayer'], self.game_state['rplayer'], self.game_state['table']) 
         
        if (action == "next_match"):
            if self.match_nbr == len (self.tours[self.tour]) :
                self.tour += 1
                self.next_match = 0
                self.next_tour += 1
                self.match_nbr = 0

                await self.send(text_data=json.dumps({
                        'status': 'next_tour',
                        'tournament_stats' : self.tours,
                    }))
            else:
                self.start_match()

        if (action == "next_tour"):
            self.match_nbr = 0
            if len (self.tours[self.tour]) == 1 and len (self.tours[self.tour][self.match_nbr]) == 1:
                await self.send(text_data=json.dumps({
                        'status': 'fin_tournament',
                        'tournament' : self.tours,
                        'winner' : self.players[0]
                    }))
            else:
                self.start_match()
        if (action == "fin_tournament"):
            print("tournament finiched")
           

    async def start_tournament(self):
        if len (self.players) == self.getMaxPlayers():
            await self.send(text_data=json.dumps({
                    'status': 'players_ready',
                    'tournament_stats' : self.tours,
                    'currentMatch' : self.tours[self.tour][self.match_nbr]
                }))
    
    def getMaxPlayers(self):
        numberPlayers = {
            "tour4": 4,
            "tour8": 8,
            "tour16": 16
        }
        return numberPlayers.get(self.tourType)

    def userExists(self, user):
        return user in self.players
    
    def create_matchs(self):
        random.shuffle(self.players)
        for i in range(0, len(self.players), 2):
            match = self.players[i:i + 2]
            self.matches.append(match)
        self.tours[self.tour] = copy.deepcopy(self.matches)
        self.matches.clear()

    async def send_data_periodically(self):

        while True:
            if  gameOver(self.game_state['lplayer'] ,self.game_state['rplayer'], MAX_SCORE ) is  not None:
                await self.endGame()
                # self.close
                break
            self.game_state['ball'].update(self.game_state['lplayer'], self.game_state['rplayer'],  self.game_state['table'])
            data = {
                'lplayer': self.game_state['lplayer'].to_dict(),
                'rplayer': self.game_state['rplayer'].to_dict(),
                'net': self.game_state['net'].to_dict(),
                'ball': self.game_state['ball'].to_dict(),
                'table': self.game_state['table'].to_dict(),
                'lplayer_name' : self.tours[self.tour][self.match_nbr][0],
                'rplayer_name' : self.tours[self.tour][self.match_nbr][1],
                'lplayer_score' : self.game_state['lplayer'].score,
                'rplayer_score' : self.game_state['rplayer'].score,
            }
            await self.send(text_data=json.dumps({
                    'status': 'render',
                    'game_state': data,
                    }))
            await asyncio.sleep(0.009)

    async def endGame(self):
        winner = gameOver(self.game_state['lplayer'] ,self.game_state['rplayer'], MAX_SCORE)
        if winner == self.game_state['lplayer']:
            self.players.remove(self.tours[self.tour][self.match_nbr][1])
            winner_name = self.tours[self.tour][self.match_nbr][0]
        else:
            self.players.remove(self.tours[self.tour][self.match_nbr][0])
            winner_name = self.tours[self.tour][self.match_nbr][1]
        
        await self.winnerNextTour(winner_name)
    
        self.task.cancel()
        self.match_nbr += 1
        if self.match_nbr == len (self.tours[self.tour]) :
            self.tour += 1
            self.match_nbr = 0

        if len (self.players ) == 1:
            await self.send(text_data=json.dumps({
                    'status': 'tournament_finiched',
                    'tournament_stats' : self.tours,
                    'winner': self.players[0]
                    }))
        else:
            await self.send(text_data=json.dumps({
                    # 'status': 'game_over',
                        'status': 'game_over',
                        'tournament_stats' : convert_keys_to_strings(self.tours),
                        'currentMatch' : self.tours[self.tour][self.match_nbr]
                    }))

    def start_match(self):
        table = Table(1083, 624)
        lplayer = Player(PLAYER_POS)
        rplayer = Player(table.width - PLAYER_WIDTH - PLAYER_POS)
        self.game_state = {
                    'ball': Ball(table.width / 2, table.height / 2),
                    'net': Net(),
                    'lplayer': lplayer,
                    'rplayer': rplayer,
                    'table': table
                }
        self.task =  asyncio.create_task(self.send_data_periodically())

    def create_tournament_dict(self):
        num_players = self.getMaxPlayers()
        
        round_number = 0

        while num_players > 1:
            matches = []
  
            for _ in range(num_players // 2):
                matches.append(['', ''])  

            if num_players % 2 == 1:
                matches.append([''])  

            self.tours[round_number] = matches

            num_players = len(matches)
            
            round_number += 1

        if num_players == 1:
            self.tours[round_number] = [['']] 



    async def  winnerNextTour(self, value):
        for i in range(len(self.tours)):
            for j in range(len(self.tours[i])):
                if self.tours[i][j][0] == '':
                    self.tours[i][j][0] = value
                    return
                elif self.tours[i][j][1] == '' :
                    self.tours[i][j][1] = value
                    return
                

def convert_keys_to_strings(d):
    return {str(key): value for key, value in d.items()}