from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models

from ..customObjects import CustomeChatRoom
from django.db.models import Q

import sys


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
                chat_type=item.chat_type
            )
            custom_user_rooms.append(custom_chat_room)

        serializer = serializers.CustomeChatRoomSerializer(custom_user_rooms, many=True)

        return Response(serializer.data)


class createChatRoom(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            user1 = request.user
            user2_id = request.data.get('user2')
            user2 = models.User.objects.get(pk=user2_id)

            res = models.chatRoom.objects.filter(
                (Q(user1=user1) & Q(user2=user2)) |
                (Q(user1=user2) & Q(user2=user1))
            ).first()

            if res:
                return Response({'error': 'chat room already exist'}, status=409)

            models.chatRoom.objects.create(user1=user1, user2=user2)

            return Response({'message': 'chat room created successfully'})
        except Exception as e:
            return Response({'error': 'invalid data'}, status=400)

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