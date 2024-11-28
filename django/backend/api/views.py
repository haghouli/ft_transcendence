from django.shortcuts import redirect

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers
from . import models

from .utiles import createTokenForUser, getIntraUser, saveIntraUserImage, getCustomFriendship, getRandomCode, sendMessage
from .customObjects import CustomeFriendShip, CustomeChatRoom
from django.utils import timezone
from django.db.models import Q

import sys
import os


def twoFA(user):
    try:
        code = getRandomCode()
        user_code_model = models.Code.objects.get(user__id=user.id)
        user_code_model.number = str(code)
        user_code_model.save()
        sendMessage(user.email, code)
        return Response({'message': 'message sended'})
    except Exception as e:
        return Response({'error': 'error'}, status=400)

def set_cookie(value, response):
    response.set_cookie(
        'my_token', value['access'],
        samesite='Lax',
        secure=True,
    )

def intraLogin(code, request):
    res_json = getIntraUser(code)
    if res_json is None:
        return Response({'error': 'Invalid login'}, status=400)

    first_name = res_json['first_name']
    last_name = res_json['last_name']
    email = res_json['email']
    username = res_json['login']
    image_url = res_json['image']['link']

    user = models.User.objects.filter(email=email).first()
    if user is not None:
        # if user.is_2af_active:
        #     return twoFA(user)
        token = createTokenForUser(user)
        response = redirect('https://:3000/')
        set_cookie(token, response)
        return response

    file_name = 'uploads/' + username + '.jpg'
    saveIntraUserImage(image_url, file_name)

    new_instance = models.User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        avatar=file_name,
    )

    new_instance.save()
    user = models.User.objects.get(username=username)
    if user.is_2af_active:
        return twoFA(user)

    token = createTokenForUser(user)
    response = redirect('https://localhost:3000')
    set_cookie(token, response)
    return response


# ---------------------------- views ----------------------------


class login(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        try:
            username = request.data.get('username')
            password = request.data.get('password')
            user = models.User.objects.get(username=username)
            if user.check_password(password):
                token = createTokenForUser(user)
                response = Response()
                set_cookie(token, response)
                serializer = serializers.UserSerializer(user)
                response.data = {
                    'token': token['access'],
                    'user': serializer.data,
                }
                return response
                # token = createTokenForUser(user)
                # response = redirect('http://127.0.0.1:3000/')
                # set_cookie(token, response)
                # return response
            raise Exception('invalid password')
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class intraCallBack(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        response = intraLogin(code, request)
        return response


class verify_user(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        user = models.User.objects.get(pk=user_id)
        serialiser = serializers.UserSerializer(user)
        return Response(serialiser.data)


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


############################################
################ user views ################
############################################

class getUsersView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        users = models.User.objects.all()
        serializer = serializers.UserSerializer(users, many=True)
        return Response(serializer.data)


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
            user_id = request.user.id
            user = models.User.objects.get(id=int(user_id))
            serializer = serializers.UserSerializer(user, request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response({'error' : 'invalid input data'}, status=400)
        except Exception as e:
            return Response({'error' : 'invalid user'}, status=400)
    
    def delete(self, request):

        try:
            user_id = request.user.id
            user = models.User.objects.get(id=user_id)
            user.delete()
            picture_path = user.avatar.path
            os.remove(picture_path)
            return Response({'message': 'user deleted'})
        except:
            return Response({'error' : 'invalid user'}, status=400)


# ***************************************************************************************

class getFriendsView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(status=1))
            | Q(friend_ship_reciever=user) & Q(status=1)
        )

        data = getCustomFriendship(friend_ships, id)
        return Response(data)


class getOnlineFriendsView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(status=1) & Q(friend_ship_reciever__is_online=True)) |
            (Q(friend_ship_reciever=user) & Q(status=1) & Q(friend_ship_sender__is_online=True))
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

            friend_ship = CustomeFriendShip(
                id=item.id,
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



############################################
################ chat views ################
############################################

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
        last_20_messages = models.Message.objects.filter(chat_room__id=id).order_by('-send_date')[:20:-1]
        serializer = serializers.MessageSerializer(last_20_messages, many=True)
        return Response(serializer.data)
    
class getUserChatRooms(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user_rooms = models.chatRoom.objects.filter(Q(user1__id=id) | Q(user2__id=id)).order_by('-last_updated')
        custom_user_rooms = []
        for item in user_rooms:
            tmp_user = item.user1 if item.user1.id != id else item.user2
            custom_chat_room = CustomeChatRoom(
                id=item.id,
                user=tmp_user,
                last_updated=item.last_updated,
                chat_status=item.chat_status,
                banner_id=item.banner_id,
            )
            custom_user_rooms.append(custom_chat_room)

        serializer = serializers.CustomeChatRoomSerializer(custom_user_rooms, many=True)

        return Response(serializer.data)


class createChatRoom(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, ):

        try:
            user1 = request.user
            user2_id = request.data.get('user2')
            user2 = models.User.objects.get(pk=user2_id)
            models.chatRoom.objects.create(user1=user1, user2=user2)

            return Response({'message': 'chat room created successfully'})
        except Exception as e:
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

class chatBlock(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):

        try:
            chat_room_id = request.data.get('chat_room_id')
            chat_room = models.chatRoom.objects.get(pk=int(chat_room_id))
            chat_room.chat_status = False
            chat_room.banner_id = request.user.id
            chat_room.save()

            return Response({'message': 'user block'})
        except Exception as e:
            return Response({'error': 'invlaid data' }, status=400)

class chatDeblock(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):

        try:
            chat_room_id = request.data.get('chat_room_id')
            chat_room = models.chatRoom.objects.get(pk=int(chat_room_id))
            chat_room.chat_status = True
            chat_room.banner_id = request.user.id
            chat_room.save()

            return Response({'message': 'user block'})
        except Exception as e:
            return Response({'error': 'invlaid data' }, status=400)


############################################
############ friendships views #############
############################################

class sendFriendView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            sender_id = request.user.id
            reciever_id = int(request.data.get('reciever_id'))

            sender = models.User.objects.get(pk=sender_id)
            reciever = models.User.objects.get(pk=reciever_id)

            models.FriendShip.objects.create(
                friend_ship_sender=sender,
                friend_ship_reciever=reciever,
                status=0
            )

            return Response({'message' : 'friend request sended successfully'})
        except Exception as e:
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



############################################
############ 2fa views #############
############################################

class user2FA(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            code = getRandomCode()
            user_code_model = models.Code.objects.get(user__id=user_id)
            user_code_model.number = str(code)
            user_code_model.save()
            sendMessage(request.user.email, code)
            return Response({'message': 'message sended'})
        except Exception as e:
            return Response({'error': 'error'}, status=400)

class confirmeCode(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            user_id = request.user.id
            code = request.data.get('code')
            user_code_model = models.Code.objects.get(user__id=user_id)
            if int(code) == int(user_code_model.number):
                user_code_model.number = None
                user_code_model.save()
                user = models.User.objects.get(pk=int(user_id))
                # user.is_2af_active = False
                user.save()
                request.user.is_2af_active = False
                token = createTokenForUser(request.user)
                return Response({'token': token['access']})
            return Response({'error': 'invalid code'}, status=400)
        except Exception as e:
            return Response({'error': 'invalid code'}, status=400)

