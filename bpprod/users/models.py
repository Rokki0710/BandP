from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    is_client = models.BooleanField(default=True)  # True - клиент, False - исполнитель

    def __str__(self):
        return self.username
