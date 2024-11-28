from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models

from django.db.models import Q

import sys


class getMatchesView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        matches = models.singleMatch.objects.filter(Q(player1=user) | Q(player2=user))
        serializer = serializers.SingleMatchSerializer(matches, many=True)
        return Response(serializer.data)
    

class getUserScore(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        try:
            scores = models.Score.objects.get(user__id=id)
            serializer = serializers.ScoreSerializer(scores)
            return Response(serializer.data)
        except:
            return Response({'error' : 'invalid request'}, status=400)


from django.db.models import Sum

class getTopFive(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            top_users = (
                models.User.objects
                .annotate(total_points=Sum('score_user__points_number'))
                .filter(total_points__gt=0)
                .order_by('-total_points')
                [:5]
            )

            serializer = serializers.UserSerializer(top_users, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response({'error': 'error'}, status=500)


############################ pong ############################

class getTicTacToeMatchesView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        user = models.User.objects.get(id=id)
        matches = models.ticTacToeMatch.objects.filter(Q(player1=user) | Q(player2=user))
        serializer = serializers.TicTacToeMatchSerializer(matches, many=True)
        return Response(serializer.data)

class getTicTacToeUserScore(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):

        try:
            scores = models.ticTacToeScore.objects.get(user__id=id)
            serializer = serializers.TicTacToeScoreSerializer(scores)
            return Response(serializer.data)
        except:
            return Response({'error' : 'invalid request'}, status=400)


class getTicTacToeTopFive(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            top_users = (
                models.User.objects
                .annotate(total_points=Sum('tictactoe_score_user__points_number'))
                .filter(total_points__gt=0)
                .order_by('-total_points')
                [:5]
            )

            serializer = serializers.UserSerializer(top_users, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response({'error': 'error'}, status=500)