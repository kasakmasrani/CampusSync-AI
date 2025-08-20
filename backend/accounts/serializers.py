from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
import re


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    def validate_password(self, value):
        # Password must be at least 8 characters, contain a number, a letter, and a special character
        pattern = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters long and include a letter, a number, and a special character."
            )
        return value


    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'student_id', 'department', 'year', 'password']
        read_only_fields = ['id']

    def validate_role(self, value):
        allowed = ['student', 'organizer']
        if value not in allowed:
            raise serializers.ValidationError(f"Role must be one of {allowed}")
        return value

    def create(self, validated_data):
        validated_data['username'] = validated_data['email']  # Set username to email
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = User.objects.filter(email=email).first()
            
            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            
        raise serializers.ValidationError("Invalid credentials")
    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField()

    def validate_password(self, value):
        pattern = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters long and include a letter, a number, and a special character."
            )
        return value
