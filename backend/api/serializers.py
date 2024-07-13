from rest_framework import serializers
from . import models
import sys
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['avatar'] = user.avatar.url
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'status', 'avatar', 'create_at', 'is_online']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.status = validated_data.get('status', instance.status)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.is_online = validated_data.get('is_online', instance.is_online)

        # print(instance.status, file=sys.stderr)
     
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Message
        fields = ['message_sender', 'message_reciever', 'message_content', 'send_date', 'read_date', 'chat_room']

class FriendShipSerializer(serializers.ModelSerializer):

    friend_ship_sender =  UserSerializer()
    friend_ship_reciever = UserSerializer()

    class Meta:
        model = models.FriendShip
        fields = ['id', 'friend_ship_sender', 'friend_ship_reciever', 'request_date', 'status', 'response_date']
    
class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ['start_date', 'end_date', 'type', 'status']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Tournament
        fields = ['start_date', 'end_date', 'status', 'max_players']

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Score
        fields = ['points_number', 'number_matches', 'user']

class ChatRoomSerializer(serializers.ModelSerializer):

    user1 = UserSerializer()
    user2 = UserSerializer()
    class Meta:
        model = models.chatRoom
        fields = ['id', 'user1', 'user2']


class UserMatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.UserMatch
        fields = ['id', 'match', 'user']