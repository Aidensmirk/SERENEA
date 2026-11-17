import json
from datetime import timedelta

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import ContactInquiry, SiteEvent


EVENT_TARGETS = {
    SiteEvent.EventType.PAGE_VIEW: {"home"},
    SiteEvent.EventType.SECTION_VIEW: {"about", "programs", "resources", "faq", "contact"},
    SiteEvent.EventType.CTA_CLICK: {
        "announcement_contact",
        "header_contact",
        "hero_programs",
        "hero_about",
        "support_01",
        "support_02",
        "support_03",
        "programs_contact",
        "resources_contact",
        "faq_contact",
        "form_preview",
        "form_edit",
    },
    SiteEvent.EventType.WHATSAPP_OPEN: {"contact_whatsapp"},
}

TARGET_LABELS = {
    "announcement_contact": "Announcement",
    "header_contact": "Header contact",
    "hero_programs": "Hero: find your next step",
    "hero_about": "Hero: get to know us",
    "support_01": "Personal support",
    "support_02": "Community circles",
    "support_03": "Wellbeing workshops",
    "resources_contact": "Getting started",
    "faq_contact": "FAQ contact",
    "form_preview": "Preview message",
    "form_edit": "Edit message",
}


@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"status": "ok"})


@csrf_exempt
@require_http_methods(["POST"])
def analytics(request):
    if request.content_type != "application/json":
        return JsonResponse({"detail": "Send the event as JSON."}, status=415)
    if len(request.body) > 2048:
        return JsonResponse({"detail": "The event payload is too large."}, status=413)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"detail": "The request body must be valid JSON."}, status=400)

    if not isinstance(data, dict) or set(data) != {"event", "target"}:
        return JsonResponse({"detail": "Provide only an event and target."}, status=400)

    event_type = data["event"]
    target = data["target"]
    if (
        not isinstance(event_type, str)
        or event_type not in EVENT_TARGETS
        or not isinstance(target, str)
        or target not in EVENT_TARGETS[event_type]
    ):
        return JsonResponse({"detail": "This website event is not recognized."}, status=400)

    SiteEvent.objects.create(event_type=event_type, target=target)
    return JsonResponse({"status": "recorded"}, status=201)


def metrics_dashboard(request):
    now = timezone.now()
    today = timezone.localdate(now)
    seven_day_start = now - timedelta(days=7)
    fourteen_day_start = now - timedelta(days=13)

    recent_events = SiteEvent.objects.filter(created_at__gte=seven_day_start)
    event_totals = {
        row["event_type"]: row["total"]
        for row in recent_events.values("event_type").annotate(total=Count("id"))
    }

    daily_views = {
        row["day"]: row["total"]
        for row in SiteEvent.objects.filter(
            event_type=SiteEvent.EventType.PAGE_VIEW,
            created_at__gte=fourteen_day_start,
        )
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(total=Count("id"))
    }
    chart_days = []
    for offset in range(13, -1, -1):
        day = today - timedelta(days=offset)
        chart_days.append({"label": day.strftime("%a"), "date": day, "views": daily_views.get(day, 0)})
    maximum_views = max((day["views"] for day in chart_days), default=0)
    for day in chart_days:
        day["height"] = round(day["views"] / maximum_views * 100) if maximum_views else 0

    top_ctas = [
        {
            "label": TARGET_LABELS.get(row["target"], row["target"]),
            "total": row["total"],
        }
        for row in recent_events.filter(event_type=SiteEvent.EventType.CTA_CLICK)
        .values("target")
        .annotate(total=Count("id"))
        .order_by("-total", "target")[:5]
    ]

    return render(
        request,
        "inquiries/site_metrics.html",
        {
            "today": today,
            "page_views": event_totals.get(SiteEvent.EventType.PAGE_VIEW, 0),
            "section_views": event_totals.get(SiteEvent.EventType.SECTION_VIEW, 0),
            "cta_clicks": event_totals.get(SiteEvent.EventType.CTA_CLICK, 0),
            "whatsapp_opens": event_totals.get(SiteEvent.EventType.WHATSAPP_OPEN, 0),
            "chart_days": chart_days,
            "top_ctas": top_ctas,
        },
    )


@csrf_exempt
@require_http_methods(["POST"])
def contact(request):
    if request.content_type != "application/json":
        return JsonResponse(
            {"detail": "Send your inquiry as JSON."}, status=415
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"detail": "The request body must be valid JSON."}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({"detail": "The request body must be a JSON object."}, status=400)

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")
    errors = {}

    if not isinstance(name, str) or not name.strip():
        errors["name"] = ["Please enter your name."]
    elif len(name.strip()) > 120:
        errors["name"] = ["Your name must be 120 characters or fewer."]

    if not isinstance(email, str) or not email.strip():
        errors["email"] = ["Please enter your email address."]
    elif len(email.strip()) > 254:
        errors["email"] = ["Your email address must be 254 characters or fewer."]
    else:
        try:
            validate_email(email.strip())
        except ValidationError:
            errors["email"] = ["Please enter a valid email address."]

    if not isinstance(message, str) or not message.strip():
        errors["message"] = ["Please share a little about what you need."]
    elif len(message.strip()) > 5000:
        errors["message"] = ["Your note must be 5000 characters or fewer."]

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    inquiry = ContactInquiry.objects.create(
        name=name.strip(),
        email=email.strip(),
        message=message.strip(),
    )
    return JsonResponse(
        {"message": "Thank you for reaching out.", "id": inquiry.pk},
        status=201,
    )
