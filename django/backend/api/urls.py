from django.urls import path, include
from . import views 
from  .my_views import authViews, chatViews, friendShipViews, twoFAViews, userViews, gameViews, TournamentViews
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [

    # simple jwt
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', authViews.CustomTokenRefreshView.as_view()),
    path('token/verify/', authViews.verify_user.as_view()),

    path('token/blacklist/', TokenBlacklistView.as_view()),


    path("register/", authViews.registerView.as_view()),
    path("login/", authViews.login.as_view()),
    path("change_password/", authViews.changePasswordView.as_view()),

    path("users/", userViews.getUsersView.as_view()),
    path('users/add_user/', userViews.addUserView.as_view()),
    path('users/user/<int:id>', userViews.userView.as_view()),
    path('users/user/friends/<int:id>', friendShipViews.getFriendsView.as_view()),
    path('users/user/online_friends/<int:id>', friendShipViews.getOnlineFriendsView.as_view()),
    path('users/user/matches/<int:id>', gameViews.getMatchesView.as_view()),
    path('users/user/score/<int:id>', gameViews.getUserScore.as_view()),
    path('users/user/chat_rooms/<int:id>', chatViews.getUserChatRooms.as_view()),
    path('users/user/me/', userViews.getMeView.as_view()),
    path('users/user/me/panding_friend_requests/', friendShipViews.getPandingFriendRequestsView.as_view()),

    path('users/user/send_friend_request/', friendShipViews.sendFriendView.as_view()),
    path('users/user/accept_friend_request/<int:id>', friendShipViews.acceptFriendRequestView.as_view()),
    path('users/user/delete_friend_request/<int:id>', friendShipViews.deleteFriendRequestView.as_view()),
    path('users/user/friend_ship/<int:id>', friendShipViews.getFriendShip.as_view()),

    path('users/user/ban_user/', friendShipViews.banUserView.as_view()),
    path('users/user/ban_user2/', friendShipViews.banUserView2.as_view()),

    path('users/user/unban_user/', friendShipViews.unbanUserView.as_view()),

    path('users/user/chat_block/', chatViews.chatBlock.as_view()),
    path('users/user/chat_deblock/', chatViews.chatDeblock.as_view()),

    path('tournaments/', TournamentViews.getTournaments.as_view()),
    path('tournament/users/<int:id>', TournamentViews.getTournamentUsers.as_view()),
    path('tournament/matches/<int:id>', TournamentViews.getTournamentMatches.as_view()),

    path("chat_rooms/room/messages/<int:id>", chatViews.getChatRoomMessagesView.as_view()),
    path("chat_rooms/room/messages/last_20/<int:id>", chatViews.getChatRoomLast20MessagesView.as_view()),

    path('chat_rooms/room/', chatViews.createChatRoom.as_view()),
    path('chat_rooms/room/<int:id>', chatViews.deleteChatRoom.as_view()),

    path('intra_callback/',  authViews.intraCallBack.as_view()),

    path('send_mail/', twoFAViews.user2FA.as_view()),
    path('validate_code/', twoFAViews.confirmeCode.as_view()),

    path('enable2fa/', twoFAViews.enable2fa.as_view()),
    path('disable2fa/', twoFAViews.disable2fa.as_view()),

    path('users/top_five/', gameViews.getTopFive.as_view()),

    # tic tac toe 
    path('users/user/tictactoe/matches/<int:id>', gameViews.getTicTacToeMatchesView.as_view()),
    path('users/user/tictactoe/score/<int:id>', gameViews.getTicTacToeUserScore.as_view()),
    path('users/tictactoe/top_five/', gameViews.getTicTacToeTopFive.as_view()),
]