from django.db import models


class ContactInquiry(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=254)
    message = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.name}"


class SiteEvent(models.Model):
    class EventType(models.TextChoices):
        PAGE_VIEW = "page_view", "Page view"
        SECTION_VIEW = "section_view", "Section view"
        CTA_CLICK = "cta_click", "Call-to-action click"
        WHATSAPP_OPEN = "whatsapp_open", "WhatsApp opened"

    event_type = models.CharField(max_length=20, choices=EventType.choices)
    target = models.CharField(max_length=40)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "website event"
        verbose_name_plural = "website events"

    def __str__(self):
        return f"{self.get_event_type_display()}: {self.target}"
