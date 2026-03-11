from django.db import models
from users.models import User


class Studio(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.URLField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="studios")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Equipment(models.Model):
    EQUIPMENT_TYPES = [
        ("photo", "Фото"),
        ("video", "Видео"),
        ("light", "Свет"),
        ("audio", "Звук"),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=EQUIPMENT_TYPES)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.URLField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="equipment")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Specialist(models.Model):
    SPECIALIZATIONS = [
        ("photographer", "Фотограф"),
        ("videographer", "Видеограф"),
    ]

    name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    portfolio = models.URLField(blank=True, null=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="specialists"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_specialization_display()})"
