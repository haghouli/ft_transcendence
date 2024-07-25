from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import os

def uploads(instace, file_name):
    return os.path.join('uploads', file_name);

class User(AbstractUser):
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=200, blank=True)
    status = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to=uploads, default='/media/uploads/user-default.png')
    create_at = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.username

class FriendShip(models.Model):
    friend_ship_sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friend_ship_sender'
    )
    friend_ship_reciever = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friend_ship_reciever'
    )
    request_date = models.DateTimeField(auto_now=True)
    status = models.IntegerField()
    response_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('friend_ship_sender', 'friend_ship_reciever')

    def __str__(self) -> str:
        return 'friendship_' + str(self.id)

# class Match(models.Model):
#     start_date = models.DateTimeField(auto_now=True)
#     end_date = models.DateTimeField()
#     type = models.IntegerField()
#     status = models.IntegerField()

#     def __str__(self) -> str:
#         return 'match_' + str(self.id)
    
# class UserMatch(models.Model):
#     match = models.ForeignKey(
#         Match,
#         on_delete=models.CASCADE,
#         related_name='match'
#     )
#     user = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name='user'
#     )

#     def __str__(self) -> str:
#         return 'usermatch_' + str(self.id)

# for fix the proble of getting user opponent

class singleMatch(models.Model):
    player1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="match_player1"
    )
    player2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="match_player2"
    )

    player1_score = models.IntegerField(blank=True, default=0)
    player2_score = models.IntegerField(blank=True, default=0)

    start_date = models.DateTimeField(auto_now=True)
    end_date = models.DateTimeField()
    type = models.IntegerField()
    status = models.IntegerField()

    def __str__(self) -> str:
        return 'match1_' + str(self.id)

# class Team():

#     user1 = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="team_user1"
#     )

#     user2 = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name="team_user2"
#     )


# class dueMatch():
#     team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="team_1")
#     team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="team_2")

#     team1_score = models.IntegerField(blank=True, default=0)
#     team2_score = models.IntegerField(blank=True, default=0)

#     start_date = models.DateTimeField(auto_now=True)
#     end_date = models.DateTimeField()
#     type = models.IntegerField()
#     status = models.IntegerField()

#     def __str__(self) -> str:
#         return 'dueMatch_' + str(self.id)


class Tournament(models.Model):
    start_date = models.DateTimeField(auto_now=True)
    end_date = models.DateTimeField()
    status = models.IntegerField()
    maxPlayers = models.IntegerField()

    def __str__(self) -> str:
        return 'tournament_' + str(self.id)
    

class matchTournament(models.Model):

    match = models.ForeignKey(singleMatch, on_delete=models.CASCADE, related_name="matchTournament_match")
    tour = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matchTournament_tour")

    def __str__(self) -> str:
        return 'match_tournament_' + str(self.id)

class tournamentScore(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user"
    )
    tour = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name="tour"
    )

    score = models.IntegerField(default=0, blank=True)

    def __str__(self) -> str:
        return 'tournament_score_' + str(self.id)

class userTournament(models.Model):
    user = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL
    )
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
    )

    user_tournament_name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return 'userTournament_' + str(self.id)

class Score(models.Model):
    points_number = models.IntegerField(default=0)
    number_matches = models.IntegerField(default=0)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='score_user',
    )

    def __str__(self) -> str:
        return 'score_' + str(self.id)


class chatRoom(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_room_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_room_user2')

    class Meta:
        unique_together = ('user1', 'user2')

    def clean(self):
        if chatRoom.objects.filter(user1=self.user2, user2=self.user1).exists():
            raise ValidationError("A chat room already exists.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


    def __str__(self) -> str:
        return 'chatroom_' + str(self.id)

class Message(models.Model):
    message_sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='message_sender'
    )
    message_reciever = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='message_reciever'
    )
    message_content = models.TextField()
    send_date = models.DateTimeField(auto_now=True)
    read_date = models.DateTimeField()
    chat_room = models.ForeignKey(
        chatRoom,
        on_delete=models.CASCADE,
        related_name='message_chat_room'
    )

    def __str__(self) -> str:
        return 'message_' + str(self.id)
