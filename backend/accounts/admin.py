"""L'admin Django par défaut suffit pour User. Seul RGPDRequestLog a un admin custom."""

from django.contrib import admin

from .models import RGPDRequestLog


@admin.register(RGPDRequestLog)
class RGPDRequestLogAdmin(admin.ModelAdmin):
    """Audit Trail RGPD en lecture seule (T-RGPD-01.3) : toute modification est interdite."""

    list_display = ["user_email", "request_type", "status", "timestamp", "ip_address"]
    readonly_fields = ["user_email", "request_type", "status", "file_hash", "timestamp", "ip_address"]
    list_filter = ["request_type", "status"]
    search_fields = ["user_email"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
