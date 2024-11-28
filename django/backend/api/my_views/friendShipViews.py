from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models

from ..utiles import getCustomFriendship
from ..customObjects import CustomeFriendShip
from django.utils import timezone
from django.db.models import Q

import sys


class getFriendsView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(status=1))
            | Q(friend_ship_reciever=user) & Q(status=1)
        )

        friends = []

        for item in friend_ships:
            current_user = item.friend_ship_sender if item.friend_ship_sender != user else item.friend_ship_reciever
            friends.append(current_user)

        # data = getCustomFriendship(friend_ships, id)
        serializer = serializers.UserSerializer(friends, many=True)
        
        return Response(serializer.data)


class getOnlineFriendsView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        friend_ships = models.FriendShip.objects.filter(
            (Q(friend_ship_sender=user) & Q(status=1)) |
            (Q(friend_ship_reciever=user) & Q(status=1))
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

        serializer = serializers.CustomeFriendShipSerializer(custom_friend_ships, many=True)
        return Response(serializer.data)

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
            user_id = request.user.id
            friendship_id = request.data.get('friendship_id')
            friendship = models.FriendShip.objects.get(pk=friendship_id)
            friendship.status = -1
            friendship.banner_id = user_id
            friendship.save()
            return Response({'message' : 'friend banned successfully'})
        except:
            return Response({'error' : 'invalid data'}, status=400)

class banUserView2(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user_id = request.user.id
            user2_id = request.data.get('user_2')
            friendship = models.FriendShip.objects.get(
                (Q(friend_ship_sender__id=int(user_id)) & Q(friend_ship_reciever__id=int(user2_id)))|
                (Q(friend_ship_sender__id=int(user2_id)) & Q(friend_ship_reciever__id=int(user_id)))
            )
            friendship.status = -1
            friendship.banner_id = user_id
            friendship.save()
            return Response({'message' : 'friend banned successfully'})
        except Exception as e:
            return Response({'error' : 'invalid data'}, status=400)


class getFriendShip(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        try:
            id1 = request.user.id
            friend_ship = models.FriendShip.objects.get(
                (Q(friend_ship_sender__id=int(id1)) & Q(friend_ship_reciever__id=int(id)))|
                (Q(friend_ship_sender__id=int(id)) & Q(friend_ship_reciever__id=int(id1)))
            )

            serializer = serializers.FriendShipSerializer(friend_ship)
            return Response(serializer.data)

        except models.FriendShip.DoesNotExist:
            # Handle the case where the FriendShip does not exist
            return Response({'error': 'Friendship not found'}, status=404)

        except Exception as e:
            return Response({'error' : 'invalid data'}, status=400)
        

class unbanUserView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            user_id = request.user.id
            user2_id = request.data.get('user_2')
            friendship = models.FriendShip.objects.get(
                (Q(friend_ship_sender__id=int(user_id)) & Q(friend_ship_reciever__id=int(user2_id)))|
                (Q(friend_ship_sender__id=int(user2_id)) & Q(friend_ship_reciever__id=int(user_id)))
            )
            friendship.status = 1
            # friendship.banner_id = -1
            friendship.save()
            return Response({'message' : 'friend banned successfully'})
        except:
            return Response({'error' : 'invalid data'}, status=400)