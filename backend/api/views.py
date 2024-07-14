from django.shortcuts import render
from django.http.response import HttpResponse

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .consumers import online_users

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from . import serializers
from . import models

from django.conf import settings
from django.db.models import Q
import requests

import os
import sys
from django.utils import timezone
from .customObjects import CustumeFriendShip
# ---------------------------- functions ----------------------------

def createTokenForUser(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def getIntraUser(request):
    code = request.data.get('code')
    myrequest = requests.post(settings.INTRA_API, data={
        'grant_type': 'authorization_code',
        'client_id': settings.INTRA_UID,
        'client_secret': settings.INTRA_SECRET,
        'code': code,
        'redirect_uri': settings.BACKEND_URL,
    })
    if myrequest.status_code != 200:
        return None
    data = myrequest.json()
    access_token = data['access_token']
    myrequest2 = requests.get('https://api.intra.42.fr/v2/me', headers={
        'Authorization' : 'bearer {}'.format(access_token),
    })
    if myrequest2.status_code != 200:
        return None
    res_json = myrequest2.json()
    return res_json


def saveIntraUserImage(image_url, file_name):
    save_path = os.path.join(settings.BASE_DIR,'media', file_name)
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)


def getCustomFriendship(friend_ships, user_id):

    custom_friend_ships = []
    for item in friend_ships:
        tmp_user = None
        tmp_user = item.friend_ship_reciever if item.friend_ship_sender.id == user_id else item.friend_ship_sender

        friend_ship = CustumeFriendShip(
            user=tmp_user,
            request_date=item.request_date,
            status=item.status,
            response_date=item.response_date,
        )
        custom_friend_ships.append(friend_ship)

    serializer = serializers.CustuomeFriendShipSerializer(custom_friend_ships, many=True)
    return serializer.data


# ---------------------------- views ----------------------------

class verify_user(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        user = models.User.objects.get(pk=user_id)
        print(user_id, file=sys.stderr)
        serialiser = serializers.UserSerializer(user)

        return Response(serialiser.data)

class intraLoginView(APIView):

    authentication_classes = [] 
    permission_classes = [AllowAny] 

    def post(self, request):
        res_json = getIntraUser(request)
        if res_json is None:
            return Response({'error': 'Invalid login'}, status=400)

        id = res_json['id']
        first_name = res_json['first_name']
        last_name = res_json['last_name']
        email = res_json['email']
        username = res_json['login']
        image_url = res_json['image']['link']

        user = models.User.objects.filter(username=username, id=id).first()
        if user is not None:
            token = createTokenForUser(user)
            user_serializer = serializers.UserSerializer(user)
            return Response({
                'tokens': token, 
                'user': user_serializer.data,
                'message': 'User already exists'
            })
    
        file_name = 'uploads/' + username + '.jpg'
        saveIntraUserImage(image_url, file_name)
    
        new_instance = models.User(
            id=id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            avatar=file_name,
        )

        new_instance.save()

        user = models.User.objects.get(username=username)
        user_serializer = serializers.UserSerializer(user)
        token = createTokenForUser(user)

        return Response({
            'tokens': token,
            'user': user_serializer.data,
            'message': 'User created successfully'
        })

class registerView(APIView):

    authentication_classes = [] 
    permission_classes = [AllowAny] 

    def post(self, request):
        user = request.data
        serializer = serializers.UserSerializer(data=user)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error': 'invalid data'}, status=400)

class getUsersView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        users = models.User.objects.all()
        serializer = serializers.UserSerializer(users, many=True)
        return Response(serializer.data)


# should be updated if i work with simple jwt
class getMeView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pk = request.user.id
            user = models.User.objects.get(pk=pk)
            serializer = serializers.UserSerializer(user)
            return Response(serializer.data)
        except:
            return Response({'error': 'invalid user'}, status=400)
    

class addUserView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = serializers.UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error': 'invalid data'},status=400)
        
    
class userView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        try:
            user = models.User.objects.get(id=id)
            serializer = serializers.UserSerializer(user)

            return Response(serializer.data)
        except:
            return Response({'error' : 'invalid user'}, status=400)
    
    def put(self, request, id):

        try:
            user = models.User.objects.get(id=id)
            serializer = serializers.UserSerializer(user, request.data)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data, file=sys.stderr)
                return Response(serializer.data)
            return Response({'error' : 'invalid input data'}, status=400)
        except Exception as e:
            print(e, file=sys.stderr)
            return Response({'error' : 'invalid user'}, status=400)
    
    def delete(self, request, id):

        try:
            user = models.User.objects.get(id=id)
            user.delete()
            picture_path = user.avatar.path
            os.remove(picture_path)
            return Response({'message': 'user deleted'})
        except:
            return Response({'error' : 'invalid user'}, status=400)


# ***************************************************************************************

class getFriendsView(APIView):

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(status=1))
            | Q(friend_ship_reciever=user) & Q(status=1)
        )

        data = getCustomFriendship(friend_ships, id)
        return Response(data)



class getOnlineFriendsView(APIView):

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(friend_ship_sender__status=1) & Q(friend_ship_sender__is_online=1))
            | (Q(friend_ship_reciever=user) & Q(friend_ship_sender__status=1) & Q(friend_ship_sender__is_online=1))
        )

        online_users = []
        for item in friend_ships:
            online_user = item.friend_ship_sender if item.friend_ship_sender.id != id else item.friend_ship_reciever
            online_users.append(online_user)
        
        serializer = serializers.UserSerializer(online_users, many=True)
        return Response(serializer.data)

class getPandingFriendRequestsView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        friend_requests_received = models.FriendShip.objects.filter(friend_ship_reciever=user, status=0)
        
        custom_friend_ships = []
        for item in friend_requests_received:

            friend_ship = CustumeFriendShip(
                user=item.friend_ship_sender,
                request_date=item.request_date,
                status=item.status,
                response_date=item.response_date,
            )
            custom_friend_ships.append(friend_ship)

        serializer = serializers.CustuomeFriendShipSerializer(custom_friend_ships, many=True)
        return Response(serializer.data)

class getMatchesView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        matches = models.singleMatch.objects.filter(Q(player1=user) | Q(player2=user))
        serializer = serializers.SingleMatchSerializer(matches, many=True)
        return Response(serializer.data)

class getTournaments(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):

        tournaments = models.Tournament.objects.all()
        serializer = serializers.TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)
    

class getTournamentUsers(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        userTournaments = models.userTournament.objects.filter(tournament__id=int(id))
        users = []
        for item in userTournaments:
            users.append(item.user)
        
        serializer = serializers.UserSerializer(users, many=True)
        return Response(serializer.data)
    
class getTournamentMatches(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        matchTournament = models.matchTournament.objects.filter(tour__id=int(id))
        matches = []
        for item in matchTournament:
            matches.append(item.match)
        
        serializer = serializers.SingleMatchSerializer(matches, many=True)
        return Response(serializer.data)

class getUserScore(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        scores = models.Score.objects.get(pk=id)
        serializer = serializers.ScoreSerializer(scores)
        return Response(serializer.data)

class getChatRoomMessagesView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        chat_room_messages = models.Message.objects.filter(chat_room__id=id)
        serializer = serializers.MessageSerializer(chat_room_messages, many=True)
        return Response(serializer.data)

class getChatRoomLast20MessagesView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        chat_room_messages = models.Message.objects.filter(chat_room__id=id)

        models.Message.objects.filter(chat_room__id=id).order_by('send_date')[:20]

        serializer = serializers.MessageSerializer(chat_room_messages, many=True)
        return Response(serializer.data)
    
class getUserChatRooms(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user_rooms = models.chatRoom.objects.filter(Q(user1__id=id) | Q(user2__id=id))
        serializer = serializers.ChatRoomSerializer(user_rooms, many=True) 
        return Response(serializer.data)


class createChatRoom(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, ):

        try:
            user1 = request.user
            user2_id = request.data.get('user2')
            user2 = models.User.objects.get(pk=user2_id)

            models.chatRoom.objects.create(
                user1=user1,
                user2=user2
            )
            return Response({'message': 'chat room created successfully'})
        except Exception as e:
            print(e, file=sys.stderr)
            return Response({'error': 'invalid data'}, status=400)

        # serializer = serializers.ChatRoomSerializer(data=request.data)
        # if serializer.is_valid():
            # serializer.save()

class deleteChatRoom(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        try:
            char_room = models.chatRoom.objects.get(pk=id)
            char_room.delete()
            return Response({'message': 'chat room deleted successfully'})
        except:
            return Response({'error': 'invalid data'}, status=400)
        

def handleNotification(receiver_id):

    if receiver_id in online_users:

        print("i am here", file=sys.stderr)
        channel_name = online_users[receiver_id]['channel_name']

        group_name = "test_group"

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_add)(group_name, channel_name)
        
        async_to_sync(channel_layer.send)(group_name, {
            "message": "hello"
        })

        async_to_sync(channel_layer.group_discard)(group_name, channel_name)

class sendFriendView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            sender_id = request.user.id
            receiver_id = int(request.data.get('reciver_id'))
            # print(receiver_id, file=sys.stderr)

            sender = models.User.objects.get(pk=sender_id)
            reveiver = models.User.objects.get(pk=receiver_id)

            models.FriendShip.objects.create(
                friend_ship_sender=sender,
                friend_ship_reciever=reveiver,
                status=0
            )
            
            # handleNotification(receiver_id)

            return Response({'message' : 'friend request sended successfully'})
        except Exception as e:
            print(e, file=sys.stderr)
            return Response({'error' : 'invalid data'}, status=400)

class acceptFriendRequestView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            friendship = models.FriendShip.objects.get(pk=id)
            friendship.status = 1
            friendship.response_date = timezone.now()
            friendship.save()
            return Response({'message' : 'friend request accepted successfully'})
        except:
            return Response({'error' : 'invalid data'}, status=400)

class deleteFriendRequestView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            friendship = models.FriendShip.objects.get(pk=id)
            friendship.delete()
            return Response({'message' : 'friend request accepted successfully'})
        except:
            return Response({'error' : 'invalid data'}, status=400)

class banUserView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            friendship_id = request.data.get('friendship_id')
            friendship = models.FriendShip.objects.get(pk=friendship_id)
            friendship.status = -1
            friendship.save()
            return Response({'message' : 'friend banned successfully'})
        except:
            return Response({'error' : 'invalid data'}, status=400)

