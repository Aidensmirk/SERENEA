from django.contrib import admin

from .models import ContactInquiry

admin.site.site_header = "SERÈNEA Administration"
admin.site.site_title = "SERÈNEA Admin"
admin.site.index_title = "Website management"


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = ("name", "email", "created_at")
    list_filter = ("created_at",)
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    search_fields = ("name", "email", "message")
