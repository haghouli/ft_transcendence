from django.db import models
from .models import User
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import os



class CustumeFriendShip(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )

    request_date = models.DateTimeField(auto_now=True)
    status = models.IntegerField()
    response_date = models.DateTimeField(blank=True, null=True)

