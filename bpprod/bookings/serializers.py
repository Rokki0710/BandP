from rest_framework import serializers
from .models import Booking
from catalog.models import Studio, Equipment, Specialist
from datetime import datetime, timedelta


class BookingSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status', 'created_at')

    def get_item_name(self, obj):
        if obj.studio:
            return obj.studio.name
        elif obj.equipment:
            return obj.equipment.name
        elif obj.specialist:
            return obj.specialist.name
        return None

    def get_item_type(self, obj):
        if obj.studio:
            return 'studio'
        elif obj.equipment:
            return 'equipment'
        elif obj.specialist:
            return 'specialist'
        return None

    def validate(self, data):
        # Проверка наличия хотя бы одного объекта
        if not any([data.get('studio'), data.get('equipment'), data.get('specialist')]):
            raise serializers.ValidationError("Должен быть выбран хотя бы один объект")

        # Проверка времени
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Время начала должно быть меньше времени окончания")

        # Проверка на прошедшие даты
        booking_datetime = datetime.combine(data['booking_date'], data['start_time'])
        if booking_datetime < datetime.now():
            raise serializers.ValidationError("Нельзя бронировать на прошедшее время")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user

        # Расчет стоимости
        item = None
        if validated_data.get('studio'):
            item = validated_data['studio']
        elif validated_data.get('equipment'):
            item = validated_data['equipment']
        elif validated_data.get('specialist'):
            item = validated_data['specialist']

        if item:
            start = validated_data['start_time']
            end = validated_data['end_time']
            hours = (datetime.combine(datetime.min, end) - datetime.combine(datetime.min, start)).seconds / 3600
            validated_data['total_price'] = float(item.price_per_hour) * hours
        return super().create(validated_data)