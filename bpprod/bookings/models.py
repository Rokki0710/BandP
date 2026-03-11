from django.db import models
from users.models import User
from catalog.models import Studio, Equipment, Specialist


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Ожидает подтверждения"),
        ("confirmed", "Подтверждено"),
        ("cancelled", "Отменено"),
        ("completed", "Завершено"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, null=True, blank=True)
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, null=True, blank=True
    )
    specialist = models.ForeignKey(
        Specialist, on_delete=models.CASCADE, null=True, blank=True
    )
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Бронь #{self.id} от {self.user.username}"
