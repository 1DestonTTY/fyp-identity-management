from django.db import models
from django.contrib.auth.models import User

#core profile extednding django default user
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True, null=True)
    pronouns = models.CharField(max_length=50, blank=True, null=True)
    gender_identity = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

#model to handle multiple names for a single user
class IdentityName(models.Model):
    NAME_TYPE_CHOICES = [
        ("legal", "Legal"),
        ("preferred", "Preferred"),
        ("professional", "Professional"),
        ("social", "Social"),
        ("alias", "Alias"),
    ]

    CONTEXT_CHOICES = [
        ("legal", "Legal"),
        ("professional", "Professional"),
        ("social", "Social"),
        ("gaming", "Gaming"),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="names")
    name_type = models.CharField(max_length=20, choices=NAME_TYPE_CHOICES)
    context = models.CharField(max_length=20, choices=CONTEXT_CHOICES)
    full_name = models.CharField(max_length=255)
    given_name = models.CharField(max_length=100, blank=True, null=True)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    family_name = models.CharField(max_length=100, blank=True, null=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.full_name} ({self.context})"

#model to store links
class OnlineProfile(models.Model):
    PLATFORM_CHOICES = [
        ("github", "GitHub"),
        ("linkedin", "LinkedIn"),
        ("twitter", "Twitter/X"),
        ("instagram", "Instagram"),
        ("website", "Website"),
        ("other", "Other"),
    ]

    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("restricted", "Restricted"),
        ("private", "Private"),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="online_profiles")
    platform = models.CharField(max_length=30, choices=PLATFORM_CHOICES)
    handle = models.CharField(max_length=100, blank=True, null=True)
    url = models.URLField()
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")

    def __str__(self):
        return f"{self.platform} - {self.profile.user.username}"