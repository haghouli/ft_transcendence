from django.contrib import admin
from . import models

admin.site.register(models.User)
admin.site.register(models.Message)
admin.site.register(models.FriendShip)
admin.site.register(models.Match)
admin.site.register(models.UserMatch)
admin.site.register(models.userTournament)
admin.site.register(models.Tournament)
admin.site.register(models.Score)
admin.site.register(models.chatRoom)