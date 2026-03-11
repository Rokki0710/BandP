from django.db import models


# Можно оставить пустым или добавить модель для логов уведомлений
class NotificationLog(models.Model):
    chat_id = models.CharField(max_length=100)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)

    def __str__(self):
        return f"Уведомление в {self.chat_id} от {self.sent_at}"
