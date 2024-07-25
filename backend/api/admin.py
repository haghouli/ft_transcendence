from django.contrib import admin
from . import models

admin.site.register(models.User)
admin.site.register(models.Message)
admin.site.register(models.FriendShip)
admin.site.register(models.userTournament)
admin.site.register(models.Tournament)
admin.site.register(models.Score)
admin.site.register(models.chatRoom)
admin.site.register(models.singleMatch)
admin.site.register(models.matchTournament)
admin.site.register(models.tournamentScore)

