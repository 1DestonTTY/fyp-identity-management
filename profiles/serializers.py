from rest_framework import serializers
from .models import Profile, IdentityName, OnlineProfile
from django.contrib.auth.models import User

#serializer for individial identity name
class IdentityNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdentityName
        fields = '__all__'

#serializer for digital/social links
class OnlineProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineProfile
        fields = '__all__'

#standard profile serializer
class ProfileSerializer(serializers.ModelSerializer):
    names = IdentityNameSerializer(many=True, read_only=True)
    online_profiles = OnlineProfileSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'

#complex serializer that adjust based on the context
class ContextProfileSerializer(serializers.ModelSerializer):
    names = serializers.SerializerMethodField()
    online_profiles = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "bio",
            "pronouns",
            "gender_identity",
            "names",
            "online_profiles",
        ]

    def get_names(self, obj):
        context_value = self.context.get("context_type")
        queryset = obj.names.filter(is_active=True)

        if context_value:
            queryset = queryset.filter(context=context_value)

        return IdentityNameSerializer(queryset, many=True).data

    def get_online_profiles(self, obj):
        context_value = self.context.get("context_type")
        request = self.context.get("request")

        queryset = obj.online_profiles.all()

        is_owner = request and request.user == obj.user
        is_admin = request and request.user.is_staff

        #visibility rules
        if is_owner:
            pass
        elif is_admin:
            queryset = queryset.exclude(visibility="private")
        else:
            queryset = queryset.filter(visibility="public")

        #context-based platform filtering
        if context_value == "professional":
            queryset = queryset.filter(platform__in=["linkedin", "github", "website"])
        elif context_value == "social":
            queryset = queryset.filter(platform__in=["instagram", "twitter"])
        elif context_value == "gaming":
            queryset = queryset.filter(platform="other")
        elif context_value == "legal":
            queryset = queryset.none()

        return OnlineProfileSerializer(queryset, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        context_value = self.context.get("context_type")

        is_owner = request and request.user == instance.user
        is_admin = request and request.user.is_staff

        if not (is_owner or is_admin):
            data.pop("gender_identity", None)
            data.pop("pronouns", None)

        if context_value in ["professional", "social", "gaming"]:
            data.pop("gender_identity", None)

        return data
    
#serializer handling user registration
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user