from django.shortcuts import redirect

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import serializers
from .. import models

from django.conf import settings

from ..utiles import createTokenForUser, getIntraUser, saveIntraUserImage, getRandomCode, sendMessage

import random
import math
import sys
import re

from django.db.models import Q

from datetime import datetime, timedelta

FRONT_URL = f"https://{settings.DOMAIN_NAME}:3000"

def getRandomUsername(username):
    digits = [i for i in range(0, 10)]
    random_str = ""
    for i in range(2):
        index = math.floor(random.random() * 10)
        random_str += str(digits[index])
    return f'{username}_{str(random_str)}'


password_pattern = re.compile(
    r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{12,}$'
)

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

def set_cookie(key, value, response, days=7):
    expires = datetime.utcnow() + timedelta(days=days)
    response.set_cookie(
        key,
        value,
        samesite='Lax',
        secure=True,
        expires=expires.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
    )

def intraLogin(code, request):
    res_json = getIntraUser(code)
    if res_json is None:
        response = redirect(f'{FRONT_URL}/#/login?message=Error occurres')
        response.data = {'error': 'Invalid login'}
        response.status=400
        return response

    first_name = res_json['first_name']
    last_name = res_json['last_name']
    email = res_json['email']
    username = res_json['login']
    image_url = res_json['image']['link']

    user = models.User.objects.filter(email=email).first()
    if user is not None and user.register_method == 1:
        token = createTokenForUser(user)
        response = redirect(f'{FRONT_URL}/')
        set_cookie('my_token', token['access'], response, 60)
        set_cookie('refresh', token['refresh'], response, 60)
        return response
    elif user is not None and user.register_method == 0:
        response = redirect(f'{FRONT_URL}/#/login?message=user email already exist')
        response.data = { "error", "the email is already exist" }
        return response
    
    user = models.User.objects.filter(username=username).first()
    if user is not None:
        username = getRandomUsername(username)

    file_name = 'uploads/' + username + '.jpg'
    saveIntraUserImage(image_url, file_name)

    new_instance = models.User(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        avatar=file_name,
        register_method=1,
        is_confirmed=True,
    )

    new_instance.save()
    user = models.User.objects.get(username=username)

    token = createTokenForUser(user)
    response = redirect(f'{FRONT_URL}/')
    set_cookie('my_token', token['access'], response, 60)
    set_cookie('refresh', token['refresh'], response, 60)
    return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        refresh_token = request.data.get('refresh')

        try:
            token = RefreshToken(refresh_token)
            user_id = token['user_id']

            if not models.User.objects.filter(id=user_id).exists():
                return Response({"detail": "User not found"}, status=404)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

        return response

class login(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        try:

            username = request.data.get('username')
            password = request.data.get('password')
        
            try:
                user = models.User.objects.get(username=username)
            except models.User.DoesNotExist:
                return Response({'error': 'Invalid username or password.'}, status=401)

            if not user.check_password(password):
                return Response({'error': 'Invalid username or password.'}, status=401)
            
            token = createTokenForUser(user)
            response = Response()
            set_cookie('my_token', token['access'], response, 60)
            set_cookie('refresh', token['refresh'], response, 60)
            serializer = serializers.UserSerializer(user)
        
            response.data = {
                'token': token,
                'user': serializer.data,
            }
            return response

        except Exception as e:
            return Response({'error': 'An Error while trying to login.'}, status=400)


class intraCallBack(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            code = request.query_params.get('code')
            response = intraLogin(code, request)
            return response
        except:
            return redirect(f'{FRONT_URL}/#/login?message=An Error occures.', status=500)


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
        
        try:
            user = request.data
            serializer = serializers.UserSerializer(data=user)
            user_password = user.get('password')
            try:
                current = models.User.objects.get(
                    Q(email=user["email"]) |
                    Q(username=user['username'])
                )
                if current.is_confirmed == False:
                    current.delete()
            except Exception as e:
                pass
            
            if not password_pattern.fullmatch(user_password):
                return Response(
                    {'error': {
                        'password': 'passord should cantain atlest 12 character mixed with numbers and special characters',
                    }},
                    status=400
                )

            if serializer.is_valid():
                try:

                    serializer.save()
                    username = request.data.get('username')
                    current_user = models.User.objects.get(username=user.get('username'))

                    token = createTokenForUser(current_user)
                    response = Response()
                    serializer = serializers.UserSerializer(current_user)
                    response.data = {
                        'token': token,
                        'user': serializer.data,
                    }
                    return response

                except Exception as e:
                    return Response({'error': 'An Error occures'}, status=500)
            return Response({'error': serializer.errors}, status=400)
        except Exception as e:
            Response({'error': 'An Error occures'}, status=500)


class changePasswordView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'old password and new password are required'}, status=400)

        if not user.check_password(old_password):
            return Response({'error': 'wrong password'}, status=400)
        
        if not password_pattern.fullmatch(new_password):
            return Response({'error': 'invalid new password'}, status=400)

        if request.user.register_method == 1:
            return Response({'error': 'invalid action'}, status=400)
        
        user.set_password(new_password)
        user.save()
        return Response({'message': 'password updated sucessfully'})


        
