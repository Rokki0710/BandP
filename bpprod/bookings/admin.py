from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'booking_date', 'start_time', 'end_time', 'total_price', 'status']
    list_filter = ['status', 'booking_date']
    search_fields = ['user__username', 'user__email']