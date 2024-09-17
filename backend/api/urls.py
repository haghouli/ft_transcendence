from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [

    # simple jwt
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', views.verify_user.as_view(), name='token_verify'),

    path("register/", views.registerView.as_view(), name="register"),
    # path("intra_login/", views.intraLoginView.as_view(), name="intra_login"),

    path("users/", views.getUsersView.as_view(), name="users"),
    path('users/add_user/', views.addUserView.as_view(), name="add_user"),
    path('users/user/<int:id>', views.userView.as_view(), name='user'),
    path('users/user/friends/<int:id>', views.getFriendsView.as_view(), name="get_friends"),
    path('users/user/online_friends/<int:id>', views.getOnlineFriendsView.as_view(), name="get_online_friends"),
    path('users/user/matches/<int:id>', views.getMatchesView.as_view(), name="get_matches"),
    path('users/user/score/<int:id>', views.getUserScore.as_view(), name="get_user_score"),
    path('users/user/chat_rooms/<int:id>', views.getUserChatRooms.as_view(), name='get_user_chat_rooms'),
    path('users/user/me/', views.getMeView.as_view(), name="get_me"),
    path('users/user/me/panding_friend_requests/', views.getPandingFriendRequestsView.as_view(), name='get_panding_friend_requests'),

    path('users/user/send_friend_request/', views.sendFriendView.as_view(), name='send_fiend_request'),
    path('users/user/accept_friend_request/<int:id>', views.acceptFriendRequestView.as_view(), name='accept_fiend_request'),
    path('users/user/delete_friend_request/<int:id>', views.deleteFriendRequestView.as_view(), name='delete_fiend_request'),

    path('users/user/ban_user/', views.banUserView.as_view(), name='ban_user'),

    path('tournaments/', views.getTournaments.as_view(), name="get_tournaments"),
    path('tournament/users/<int:id>', views.getTournamentUsers.as_view(), name="get_tournament_users"),
    path('tournament/matches/<int:id>', views.getTournamentMatches.as_view(), name="get_tournament_matches"),

    path("chat_rooms/room/messages/<int:id>", views.getChatRoomMessagesView.as_view(), name="get_chat_room_messages"),
    path("chat_rooms/room/messages/last_20/<int:id>", views.getChatRoomLast20MessagesView.as_view(), name="get_chat_room_last_20_messages"),

    path('chat_rooms/room/', views.createChatRoom.as_view(), name='create_chat_room'),
    path('chat_rooms/room/<int:id>', views.deleteChatRoom.as_view(), name='delete_chat_room'),

    path('intra_callback/',  views.intraCallBack.as_view(), name='intra_login'),

    path('send_mail/', views.user2FA.as_view(), name="send_mail"),
    path('validate_code/', views.confirmeCode.as_view(), name="verify_code"),
]