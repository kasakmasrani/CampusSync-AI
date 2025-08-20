from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .permissions import IsOrganizer
from .serializers import UserSerializer, LoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
import re
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            # Default to student if not provided
            if 'role' not in data or not data['role']:
                data['role'] = 'student'
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Registration error: {str(e)}") 
            return Response(
                {"detail": "Registration failed - " + str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class LoginView(generics.GenericAPIView):
    """
    View for user login.
    Allows any user (authenticated or not) to login.
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except ValidationError as e:
            # Return 400 for invalid credentials
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()  # logs full stack trace in terminal
            return Response({'detail': f'Login failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveAPIView):
    """
    View for authenticated users to view their profile.
    Requires authentication but no specific role.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"detail": "Refresh token missing."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_url = f"http://localhost:8080/reset-password/{uid}/{token}"

                send_mail(
                    "Reset Your Password",
                    f"Click the link to reset: {reset_url}",
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                )
                return Response({"message": "Reset link sent."})
            except User.DoesNotExist:
                # Don't expose user existence
                return Response({"message": "Reset link sent."})
        return Response(serializer.errors, status=400)

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
                user = User.objects.get(pk=uid)
                token = serializer.validated_data["token"]
                if not default_token_generator.check_token(user, token):
                    return Response({"message": "Invalid or expired token"}, status=400)

                user.set_password(serializer.validated_data["password"])
                user.save()
                return Response({"message": "Password reset successful."})
            except Exception as e:
                return Response({"message": "Invalid token or user."}, status=400)
        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        
        user = request.user
        current_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response({"detail": "Current and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if current_password == new_password:
            return Response({"detail": "New password must be different from current password."}, status=status.HTTP_400_BAD_REQUEST)

        # Password regex validation
        pattern = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
        if not re.match(pattern, new_password):
            return Response({"detail": "Password must be at least 8 characters long and include a letter, a number, and a special character."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)

class OrganizerDashboardView(APIView):
    """
    View for organizer-specific dashboard.
    Requires both authentication and organizer role.
    """
    permission_classes = [IsOrganizer, permissions.IsAuthenticated]
    
    def get(self, request):
        """
        GET method for organizer dashboard
        Returns a welcome message with organizer-specific content
        """
        # Example response with organizer-specific data
        response_data = {
            "message": "Welcome to the Organizer Dashboard!",
            "user": {
                "id": request.user.id,
                "name": f"{request.user.first_name} {request.user.last_name}",
                "email": request.user.email,
                "role": request.user.role
            },
            "actions": [
                "Create events",
                "Manage attendees",
                "View analytics"
            ]
        }
        return Response(response_data, status=status.HTTP_200_OK)
