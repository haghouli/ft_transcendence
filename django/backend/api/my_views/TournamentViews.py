from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models


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
