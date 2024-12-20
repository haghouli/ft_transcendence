from django.db import models
from .models import User
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import os

class CustomeFriendShip(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )

    request_date = models.DateTimeField(auto_now=True)
    status = models.IntegerField()
    response_date = models.DateTimeField(blank=True, null=True)


class CustomeChatRoom(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    last_updated = models.DateTimeField(blank=True, null=True)
    chat_status = models.BooleanField(default=True, blank=True)
    banner_id = models.IntegerField(blank=True, null=True)
    chat_type = models.IntegerField(default=0)

    def __str__(self) -> str:
        return 'customchatroom_' + str(self.id)


