import json

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase

from .models import ContactInquiry, SiteEvent


class ContactApiTests(TestCase):
    def test_health_endpoint(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_contact_endpoint_stores_valid_inquiry(self):
        response = self.client.post(
            "/api/contact/",
            data=json.dumps(
                {
                    "name": "Sam Example",
                    "email": "sam@example.com",
                    "message": "I would like to learn about support.",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactInquiry.objects.count(), 1)
        self.assertEqual(ContactInquiry.objects.get().email, "sam@example.com")

    def test_contact_endpoint_rejects_invalid_email(self):
        response = self.client.post(
            "/api/contact/",
            data=json.dumps(
                {"name": "Sam", "email": "not-an-email", "message": "Hello."}
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["errors"])
        self.assertEqual(ContactInquiry.objects.count(), 0)

    def test_contact_endpoint_rejects_non_json(self):
        response = self.client.post(
            "/api/contact/", data="hello", content_type="text/plain"
        )

        self.assertEqual(response.status_code, 415)

    def test_analytics_endpoint_stores_only_allowed_aggregate_events(self):
        response = self.client.post(
            "/api/analytics/",
            data=json.dumps({"event": "page_view", "target": "home"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(SiteEvent.objects.count(), 1)
        self.assertEqual(SiteEvent.objects.get().target, "home")

    def test_analytics_endpoint_rejects_unknown_targets_and_extra_data(self):
        for payload in (
            {"event": "page_view", "target": "unknown"},
            {"event": "page_view", "target": "home", "email": "visitor@example.com"},
        ):
            with self.subTest(payload=payload):
                response = self.client.post(
                    "/api/analytics/",
                    data=json.dumps(payload),
                    content_type="application/json",
                )
                self.assertEqual(response.status_code, 400)

        self.assertEqual(SiteEvent.objects.count(), 0)

    def test_metrics_dashboard_is_staff_only_and_shows_aggregate_counts(self):
        SiteEvent.objects.create(event_type=SiteEvent.EventType.PAGE_VIEW, target="home")
        SiteEvent.objects.create(event_type=SiteEvent.EventType.WHATSAPP_OPEN, target="contact_whatsapp")

        response = self.client.get("/admin/metrics/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response.url)

        staff_user = get_user_model().objects.create_user(
            username="metrics-staff",
            password="test-password",
            is_staff=True,
        )
        self.client.force_login(staff_user)
        response = self.client.get("/admin/metrics/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Website metrics")
        self.assertContains(response, "WhatsApp opens")
        self.assertEqual(response.context["page_views"], 1)
        self.assertEqual(response.context["whatsapp_opens"], 1)

    def test_inquiry_admin_requires_staff_access(self):
        ContactInquiry.objects.create(
            name="Sam Example",
            email="sam@example.com",
            message="A note for the team.",
        )
        response = self.client.get("/admin/inquiries/contactinquiry/")
        self.assertEqual(response.status_code, 302)

        staff_user = get_user_model().objects.create_user(
            username="serenea-staff",
            password="ExamplePassword-42",
            is_staff=True,
        )
        staff_user.user_permissions.add(
            Permission.objects.get(codename="view_contactinquiry")
        )
        self.client.force_login(staff_user)
        response = self.client.get("/admin/inquiries/contactinquiry/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sam Example")
