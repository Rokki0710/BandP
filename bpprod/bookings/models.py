from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import datetime, time, timedelta


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает подтверждения'),
        ('confirmed', 'Подтверждено'),
        ('cancelled', 'Отменено'),
        ('completed', 'Завершено'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    studio = models.ForeignKey('catalog.Studio', on_delete=models.CASCADE, null=True, blank=True)
    equipment = models.ForeignKey('catalog.Equipment', on_delete=models.CASCADE, null=True, blank=True)
    specialist = models.ForeignKey('catalog.Specialist', on_delete=models.CASCADE, null=True, blank=True)

    booking_date = models.DateField(verbose_name="Дата бронирования")
    start_time = models.TimeField(verbose_name="Время начала")
    end_time = models.TimeField(verbose_name="Время окончания")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Общая стоимость")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Бронирование'
        verbose_name_plural = 'Бронирования'
        indexes = [
            models.Index(fields=['booking_date', 'start_time', 'end_time']),
        ]

    def __str__(self):
        return f"Бронь #{self.id} - {self.user.username} - {self.booking_date}"

    def clean(self):
        # Проверка, что выбран хотя бы один объект
        if not any([self.studio, self.equipment, self.studio]):
            raise ValidationError("Должен быть выбран хотя бы один объект (студия, оборудование или специалист)")

        # Проверка времени
        if self.start_time >= self.end_time:
            raise ValidationError("Время начала должно быть меньше времени окончания")

        # Проверка пересечений
        overlapping = Booking.objects.filter(
            booking_date=self.booking_date,
            status__in=['pending', 'confirmed']
        ).exclude(pk=self.pk)

        # Для студии
        if self.studio:
            if overlapping.filter(studio=self.studio).exists():
                studio_overlaps = overlapping.filter(
                    studio=self.studio,
                    start_time__lt=self.end_time,
                    end_time__gt=self.start_time
                )
                if studio_overlaps.exists():
                    raise ValidationError("Это время уже занято для данной студии")

        # Для оборудования
        if self.equipment:
            if overlapping.filter(equipment=self.equipment).exists():
                equip_overlaps = overlapping.filter(
                    equipment=self.equipment,
                    start_time__lt=self.end_time,
                    end_time__gt=self.start_time
                )
                if equip_overlaps.exists():
                    raise ValidationError("Это оборудование уже забронировано на это время")

        # Для специалиста
        if self.specialist:
            if overlapping.filter(specialist=self.specialist).exists():
                spec_overlaps = overlapping.filter(
                    specialist=self.specialist,
                    start_time__lt=self.end_time,
                    end_time__gt=self.start_time
                )
                if spec_overlaps.exists():
                    raise ValidationError("Этот специалист уже занят в это время")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)