from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, IdentityName, OnlineProfile

class IdentityPrivacyTests(TestCase):
    def setUp(self):
        # 1. Setup a Test User and Profile
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Profile is created via signals or manually in your RegisterView
        self.profile = Profile.objects.create(
            user=self.user, 
            bio="Software Engineer", 
            pronouns="They/Them", 
            gender_identity="Non-binary"
        )

        # 2. Create Identity Names for different contexts
        IdentityName.objects.create(
            profile=self.profile, full_name="Legal Name User", 
            context="legal", name_type="legal", is_active=True
        )
        IdentityName.objects.create(
            profile=self.profile, full_name="Professional User", 
            context="professional", name_type="professional", is_active=True
        )
        IdentityName.objects.create(
            profile=self.profile, full_name="GamerTag99", 
            context="gaming", name_type="alias", is_active=True
        )

        # 3. Create Online Profiles with visibility rules
        OnlineProfile.objects.create(
            profile=self.profile, platform="linkedin", 
            url="https://linkedin.com/in/test", visibility="public"
        )
        OnlineProfile.objects.create(
            profile=self.profile, platform="other", handle="SteamID", 
            url="https://steam.com/test", visibility="private"
        )

    def test_professional_context_filtering(self):
        """Verify only professional data is returned in professional context"""
        response = self.client.get("/api/my-profile/?context=professional")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see professional name
        names = [n['full_name'] for n in response.data['names']]
        self.assertIn("Professional User", names)
        self.assertNotIn("Legal Name User", names)
        
        # Should see LinkedIn but NOT Steam (private/gaming)
        platforms = [p['platform'] for p in response.data['online_profiles']]
        self.assertIn("linkedin", platforms)
        self.assertNotIn("other", platforms)

    def test_legal_context_disclosure(self):
        """Verify legal context reveals sensitive identity fields"""
        response = self.client.get("/api/my-profile/?context=legal")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see Legal Name
        names = [n['full_name'] for n in response.data['names']]
        self.assertIn("Legal Name User", names)
        
        # Gender identity should be present in representation for owner/legal
        self.assertIn("gender_identity", response.data)
        self.assertEqual(response.data["gender_identity"], "Non-binary")

    def test_export_returns_only_authenticated_users_data(self):
        """Verify the GDPR export is locked to the authenticated owner"""
        # 1. Create another user
        other_user = User.objects.create_user(username="hacker", password="password123")
        
        # FIX: Manually create the profile for the hacker user
        Profile.objects.create(user=other_user) 
        
        self.client.force_authenticate(user=other_user)
        
        # 2. Request export data
        response = self.client.get("/api/export-data/")
        
        # 3. Always check status code first to catch errors before checking keys
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify the hacker gets their OWN username, not the 'testuser' data
        self.assertEqual(response.data['user_metadata']['username'], "hacker")
        self.assertNotEqual(response.data['user_metadata']['username'], "testuser")

    def test_non_admin_blocked_from_context_preview(self):
        viewer = User.objects.create_user(username="viewer", password="password123")
        self.client.force_authenticate(user=viewer)

        response = self.client.get(f"/api/profiles/{self.profile.id}/context-preview/?context=professional")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_sees_public_and_restricted_but_not_private(self):
        admin = User.objects.create_user(username="adminuser", password="password123", is_staff=True)
        self.client.force_authenticate(user=admin)

        OnlineProfile.objects.create(
            profile=self.profile,
            platform="website",
            url="https://example.com/restricted",
            visibility="restricted"
        )

        response = self.client.get(f"/api/profiles/{self.profile.id}/context-preview/?context=professional")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        platforms = [p["platform"] for p in response.data["online_profiles"]]
        self.assertIn("linkedin", platforms)
        self.assertIn("website", platforms)
        self.assertNotIn("other", platforms)