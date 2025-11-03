# backend/api/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import ItemPost, ItemImage


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 0
    fields = ("image", "preview", "uploaded_at")
    readonly_fields = ("preview", "uploaded_at")

    def preview(self, obj):
        if not obj or not obj.image:
            return "—"
        # Small thumbnail preview in admin
        return format_html('<img src="{}" style="max-height:80px;"/>', obj.image.url)


@admin.register(ItemPost)
class ItemPostAdmin(admin.ModelAdmin):
    # List page
    list_display = (
        "id",
        "title",
        "status",
        "location",
        "date",
        "owner",
        "creationDate",
        "updateDate",
        "received_from_poster",
    )
    list_filter = ("status", "location", "date", "creationDate", "received_from_poster")
    search_fields = (
        "title",
        "description",
        "location",
        "owner__username",
        "owner__email",
        "contact_email",
        "contact_phone",
        "received_from_poster",
    )
    ordering = ("-creationDate",)
    date_hierarchy = "date"
    list_per_page = 25

    # Edit page
    readonly_fields = ("creationDate", "updateDate")
    autocomplete_fields = ("owner",)
    fieldsets = (
        ("Basics", {"fields": ("title", "description", "status")}),
        ("Where / When", {"fields": ("location", "date")}),
        ("Contact", {"fields": ("owner", "contact_email", "contact_phone")}),
        ("System", {"fields": ("creationDate", "updateDate")}),
    )

    inlines = [ItemImageInline]

    actions = ["mark_as_found", "mark_as_lost", "mark_as_received"]

    def mark_as_found(self, request, queryset):
        updated = queryset.update(status="found")
        self.message_user(request, f"Marked {updated} post(s) as FOUND.")
    mark_as_found.short_description = "Mark selected as FOUND"

    def mark_as_lost(self, request, queryset):
        updated = queryset.update(status="lost")
        self.message_user(request, f"Marked {updated} post(s) as LOST.")
    mark_as_lost.short_description = "Mark selected as LOST"

    def mark_as_received(self, request, queryset):
        updated = queryset.update(received_from_poster=True)
        self.message_user(request, f"Marked {updated} post(s) as RECEIVED.")
    mark_as_received.short_description = "Mark selected as RECEIVED"
