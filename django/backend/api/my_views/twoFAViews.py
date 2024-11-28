from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from django.utils import timezone
from .. import serializers

from .. import models

from ..utiles import createTokenForUser, getRandomCode, sendMessage

import sys

class enable2fa(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        user.is_2af_active = True
        user.save()

        return Response({"message": "two factor auth enabled"})

class disable2fa(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):

        user = request.user
        user.is_2af_active = False
        user.save()

        return Response({"message": "two factor auth disabled"})


class user2FA(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            code = getRandomCode()
            user_code_model = models.Code.objects.get(user__id=user_id)
            user_code_model.number = str(code)
            user_code_model.start_date = datetime.now()
            user_code_model.save()
            sendMessage(request.user.email, code)
            return Response({'message': 'message sended'})
        except Exception as e:
            return Response({'error': 'e'}, status=400)

class confirmeCode(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            user_id = request.user.id
            code = request.data.get('code')
            user_code_model = models.Code.objects.get(user__id=user_id)

            if int(code) == int(user_code_model.number):
                elapstime = timezone.now() - user_code_model.start_date
                if elapstime.total_seconds() > 60:
                    user_code_model.number = None
                    user_code_model.save()
                    return Response( {'error' : 'code timeout'}, status=400)
                user_code_model.number = None
                user_code_model.save()
                user = models.User.objects.get(pk=user_id)
                user.is_confirmed = True
                user.save()
                request.user.is_2af_active = False
                token = createTokenForUser(request.user)
                # response = redirect('https://localhost/')
                return Response({
                    'message': 'login confirmed',
                    'access': token['access'],
                    'refresh': token['refresh'],
                    'user': serializers.UserSerializer(user).data,
                })
            return Response({'error': 'invalid code'}, status=400)
        except Exception as e:
            return Response({'error': 'invalid code'}, status=400)