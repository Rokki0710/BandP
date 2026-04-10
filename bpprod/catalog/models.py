from django.db import models
from django.conf import settings


class Studio(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название")
    address = models.CharField(max_length=300, verbose_name="Адрес")
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за час")
    description = models.TextField(verbose_name="Описание")
    image = models.ImageField(upload_to='studios/', blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='studios')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Студия'
        verbose_name_plural = 'Студии'

    def __str__(self):
        return self.name


class Equipment(models.Model):
    EQUIPMENT_TYPES = [
        ('photo', 'Фото'),
        ('video', 'Видео'),
        ('light', 'Свет'),
        ('audio', 'Звук'),
    ]

    name = models.CharField(max_length=200, verbose_name="Название")
    type = models.CharField(max_length=20, choices=EQUIPMENT_TYPES, verbose_name="Тип")
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за час")
    description = models.TextField(verbose_name="Описание")
    image = models.ImageField(upload_to='equipment/', blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='equipment')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Оборудование'
        verbose_name_plural = 'Оборудование'

    def __str__(self):
        return self.name


class Specialist(models.Model):
    SPECIALIZATIONS = [
        ('photographer', 'Фотограф'),
        ('videographer', 'Видеограф'),
    ]

    name = models.CharField(max_length=200, verbose_name="Имя")
    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS, verbose_name="Специализация")
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за час")
    description = models.TextField(verbose_name="Описание")
    portfolio = models.URLField(blank=True, verbose_name="Портфолио")
    image = models.ImageField(upload_to='specialists/', blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='specialists')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Специалист'
        verbose_name_plural = 'Специалисты'

    def __str__(self):
        return self.name