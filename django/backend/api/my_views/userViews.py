from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models

import sys

import os

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