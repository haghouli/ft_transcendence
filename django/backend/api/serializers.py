from rest_framework import serializers
from . import models
import sys
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .customObjects import CustomeFriendShip, CustomeChatRoom

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['avatar'] = user.avatar.url
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_2af_active'] = user.is_2af_active
        return token

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Score
        fields = [
            'points_number',
            'number_matches',
            'number_wins',
            'numbers_losers',
            'user',
        ]

class UserSerializer(serializers.ModelSerializer):

    level = serializers.SerializerMethodField()    
    
    class Meta:
        model = models.User
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'password',
            'status',
            'avatar',
            'create_at',
            'is_online',
            'email',
            'is_2af_active',
            'register_method',
            'level',
            'is_confirmed',
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)  # Use set_password to hash the password
        instance.save()
        return instance

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.status = validated_data.get('status', instance.status)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.is_online = validated_data.get('is_online', instance.is_online)
     
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def get_level(self, obj):
        score = models.Score.objects.filter(user=obj).first()
        if score:
            if score.points_number == 0:
                return 0
            return int(score.points_number / 20)
        return None

class MessageSerializer(serializers.ModelSerializer):

    message_user = UserSerializer()

    class Meta:
        model = models.Message
        fields = [
            'message_user',
            'message_content',
            'send_date',
            'read_date',
            'chat_room',
        ]

class FriendShipSerializer(serializers.ModelSerializer):

    friend_ship_sender =  UserSerializer()
    friend_ship_reciever = UserSerializer()

    class Meta:
        model = models.FriendShip
        fields = [
            'id',
            'friend_ship_sender',
            'friend_ship_reciever',
            'request_date',
            'status',
            'response_date',
            'banner_id',
        ]
    
class SingleMatchSerializer(serializers.ModelSerializer):

    player1 = UserSerializer()
    player2 = UserSerializer()

    class Meta:
        model = models.singleMatch
        fields = [
            'id',
            'player1',
            'player2',
            'player1_score',
            'player2_score',
            'start_date',
            'end_date',
            'type',
            'is_active',
        ]

class TicTacToeMatchSerializer(serializers.ModelSerializer):

    player1 = UserSerializer()
    player2 = UserSerializer()

    class Meta:
        model = models.singleMatch
        fields = [
            'id',
            'player1',
            'player2',
            'player1_score',
            'player2_score',
            'start_date',
            'end_date',
        ]

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tournament
        fields = [
            'id',
            'start_date',
            'end_date',
            'status',
            'maxPlayers',
        ]

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Score
        fields = [
            'points_number',
            'number_matches',
            'number_wins',
            'numbers_losers',
            'user',
        ]

class TicTacToeScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Score
        fields = [
            'points_number',
            'number_matches',
            'number_wins',
            'numbers_losers',
            'user',
        ]


class ChatRoomSerializer(serializers.ModelSerializer):

    user1 = UserSerializer()
    user2 = UserSerializer()
    class Meta:
        model = models.chatRoom
        fields = [
            'id',
            'user1',
            'user2',
            'last_updated',
            'chat_status',
            'banner_id',
            'chat_type',
        ]


class CustomeFriendShipSerializer(serializers.ModelSerializer):

    user = UserSerializer()

    class Meta:
        model = CustomeFriendShip
        fields = [
            'id',
            'user',
            'request_date',
            'status',
            'response_date',
        ]
    
class CustomeChatRoomSerializer(serializers.ModelSerializer):

    user = UserSerializer()

    class Meta:
        model = CustomeChatRoom
        fields = [
            'id',
            'user',
            'last_updated',
            'chat_status',
            'banner_id',
            'chat_type',
        ]