from django.urls import re_path

from . import consumers, MatchingConsumer, tournamentLogicConsumer
from . import  singleMatchLocalConsumer

websocket_urlpatterns = [
    # re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path("ws/online/", consumers.OnlineConsumer.as_asgi()),
    re_path(r'ws/mackmakingsocket/', consumers.ticTacToeConusmer.as_asgi()),
    
    
    re_path(r'ws/socket-server/', MatchingConsumer.MatchmakingConsumer.as_asgi()),
    re_path(r'ws/localTournament/(?P<type>\w+)/$', tournamentLogicConsumer.TournamentLogicConsumer.as_asgi()),
    re_path(r'ws/localSingle/(?P<type>\w+)', singleMatchLocalConsumer.SingleMatchLocalConsumer.as_asgi())    
]