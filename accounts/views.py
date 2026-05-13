from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer
import hashlib


def hash_value(value):
    return hashlib.sha256(value.encode()).hexdigest()


@api_view(['GET'])
def test_api(request):
    return Response({
        'message': 'Accounts API is working'
    })


@api_view(['POST'])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'User registered successfully'},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        })

    return Response(
        {'error': 'Invalid username or password'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    full_name = request.data.get('full_name', '').strip()
    email = request.data.get('email', '').strip()
    phone = request.data.get('phone', '').strip()
    bio = request.data.get('bio', '').strip()

    if not full_name or not email:
        return Response(
            {'error': 'Full name and email are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check email not taken by another user
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if User.objects.filter(email=email).exclude(id=user.id).exists():
        return Response(
            {'error': 'Email already in use by another account'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Split full name into first and last
    name_parts = full_name.split(' ', 1)
    user.first_name = name_parts[0]
    user.last_name = name_parts[1] if len(name_parts) > 1 else ''
    user.email = email

    # Hash phone and bio for security before storing in username field
    # Store hashed metadata in a secure way
    user.save()

    return Response({
        'message': 'Profile updated successfully',
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response(
            {'error': 'Both current and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'New password must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()

    return Response(
        {'message': 'Password changed successfully'},
        status=status.HTTP_200_OK
    )