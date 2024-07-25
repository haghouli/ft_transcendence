from channels.db import database_sync_to_async
from api import models
import sys
import json
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication
from rest_framework_simplejwt.tokens import Token

@database_sync_to_async
def get_user(user_id):
    try:
        return models.User.objects.get(id=user_id)
    except models.User.DoesNotExist:
        return None
    
def verify_token(scope):

    headers = dict(scope['headers'])
    cookie_header = headers[b'cookie'].decode('utf-8')

    cookies = {}
    for cookie in cookie_header.split('; '):
        key, value = cookie.split('=')
        cookies[key] = value

    tokens = json.loads(cookies.get('my_token', '{}'))
    try:
        token = Token(tokens.get('access', ''))
        authentication = JWTTokenUserAuthentication()
        user, validated_token = authentication.authenticate_credentials(token)
        return user

    except Exception as e:
        # Handle token verification failure
        print(f"Token verification failed: {e}")
        return None

class QueryAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        query_params = scope['query_string'].decode()
        query_dict = dict(q.split('=') for q in query_params.split('&'))
        user_id = query_dict.get('id')

        # should add token verification a come in the cookie the function above (verify_token)

        scope['user'] = await get_user(user_id)

        return await self.app(scope, receive, send)