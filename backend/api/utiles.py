from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
import os
from . import serializers
from .customObjects import CustomeFriendShip

def createTokenForUser(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def getIntraUser(code):
    myrequest = requests.post(settings.INTRA_API, data={
        'grant_type': 'authorization_code',
        'client_id': settings.INTRA_UID,
        'client_secret': settings.INTRA_SECRET,
        'code': code,
        'redirect_uri': settings.BACKEND_URL,
    })
    if myrequest.status_code != 200:
        return None
    data = myrequest.json()
    access_token = data['access_token']
    myrequest2 = requests.get('https://api.intra.42.fr/v2/me', headers={
        'Authorization' : 'bearer {}'.format(access_token),
    })
    if myrequest2.status_code != 200:
        return None
    res_json = myrequest2.json()
    return res_json


def saveIntraUserImage(image_url, file_name):
    save_path = os.path.join(settings.BASE_DIR,'media', file_name)
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)


def getCustomFriendship(friend_ships, user_id):

    custom_friend_ships = []
    for item in friend_ships:
        tmp_user = None
        tmp_user = item.friend_ship_reciever if item.friend_ship_sender.id == user_id else item.friend_ship_sender

        friend_ship = CustomeFriendShip(
            id=item.id,
            user=tmp_user,
            request_date=item.request_date,
            status=item.status,
            response_date=item.response_date,
        )
        custom_friend_ships.append(friend_ship)

    serializer = serializers.CustomeChatRoomSerializer(custom_friend_ships, many=True)
    return serializer.data