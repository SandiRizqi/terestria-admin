"""
Authentication middleware for Terestria Mobile Admin.

Enforces token authentication at the middleware level for all /api/mobile/ endpoints,
providing a security layer on top of DRF's permission classes.
"""
from django.http import JsonResponse
from rest_framework.authtoken.models import Token


class TokenAuthMiddleware:
    """
    Middleware that requires a valid Token for all /api/mobile/ endpoints,
    except for public endpoints like /api-token-auth/.
    """

    # Paths that don't require authentication
    PUBLIC_PATHS = [
        '/api-token-auth/',
        '/admin/',
        '/static/',
        '/media/',
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Skip middleware for non-API and public paths
        if not path.startswith('/api/mobile/'):
            return self.get_response(request)

        for public_path in self.PUBLIC_PATHS:
            if path.startswith(public_path):
                return self.get_response(request)

        # Check for Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Token '):
            return JsonResponse(
                {'detail': 'Authentication credentials were not provided.'},
                status=401
            )

        token_key = auth_header[6:]  # Strip "Token " prefix
        try:
            token = Token.objects.select_related('user').get(key=token_key)
            if not token.user.is_active:
                return JsonResponse(
                    {'detail': 'User account is disabled.'},
                    status=401
                )
            # Attach user to request for downstream use
            request.user = token.user
        except Token.DoesNotExist:
            return JsonResponse(
                {'detail': 'Invalid token.'},
                status=401
            )

        return self.get_response(request)
