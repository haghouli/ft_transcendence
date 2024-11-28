from channels.db import database_sync_to_async
from api import models
import sys
from rest_framework_simplejwt.tokens import  AccessToken, RefreshToken
from asgiref.sync import sync_to_async


@sync_to_async
def validate_access_token(token):
    try:
        # Decode and validate the access token
        access_token = AccessToken(token)
        if access_token['token_type'] != 'access':
            raise Exception('Invalid token type')
        return access_token
    except Exception as e:
        raise e

@database_sync_to_async
def get_user(user_id):
    try:
        return models.User.objects.get(id=user_id)
    except models.User.DoesNotExist:
        return None
    
async def verify_token(scope):

    headers = dict(scope['headers'])
    cookie_header = headers[b'cookie'].decode('utf-8')

    cookies = {}
    for cookie in cookie_header.split('; '):
        key, value = cookie.split('=')
        cookies[key] = value

    try:

        token = cookies.get('my_token', '')

        if not token:
            raise Exception('No refresh token found')

        access_token = await validate_access_token(token)

        user_id = access_token['user_id']

        user = await get_user(user_id)

        if user:
            return user
        else:
            raise Exception('User not found')

    except Exception as e:
        return None

class QueryAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        try:
            
            scope['user'] = await verify_token(scope)


            return await self.app(scope, receive, send)
        except Exception as e:
            pass