from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, time, timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from catalog.models import Studio
from bookings.models import Booking

User = get_user_model()


class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+1234567890'
        }

    def test_create_user(self):
        """Тест создания пользователя"""
        response = self.client.post('/api/register/', self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_token_obtain(self):
        """Тест получения JWT токена"""
        # Сначала создаем пользователя
        self.client.post('/api/register/', self.user_data)

        # Пытаемся получить токен
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class BookingTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Создаем пользователя
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Создаем студию
        self.studio = Studio.objects.create(
            name='Test Studio',
            address='Test Address',
            price_per_hour=1000,
            description='Test Description',
            owner=self.user
        )

        # Аутентифицируемся
        self.client.force_authenticate(user=self.user)

    def test_create_booking(self):
        """Тест создания бронирования"""
        booking_data = {
            'studio': self.studio.id,
            'booking_date': (timezone.now().date() + timedelta(days=1)).isoformat(),
            'start_time': '10:00:00',
            'end_time': '12:00:00'
        }

        response = self.client.post('/api/bookings/', booking_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(Booking.objects.get().total_price, 2000)  # 2 часа * 1000

    def test_booking_availability(self):
        """Тест проверки доступности времени"""
        # Создаем первое бронирование
        Booking.objects.create(
            user=self.user,
            studio=self.studio,
            booking_date=timezone.now().date() + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(12, 0),
            total_price=2000
        )

        # Пытаемся создать пересекающееся бронирование
        booking_data = {
            'studio': self.studio.id,
            'booking_date': (timezone.now().date() + timedelta(days=1)).isoformat(),
            'start_time': '11:00:00',
            'end_time': '13:00:00'
        }

        response = self.client.post('/api/bookings/', booking_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)