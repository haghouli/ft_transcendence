import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from api.routing import websocket_urlpatterns
from .middlewares import QueryAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_project.settings')

application = ProtocolTypeRouter({
    'http' : get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        QueryAuthMiddleware(URLRouter(websocket_urlpatterns))
    ),
})
