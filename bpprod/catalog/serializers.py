from rest_framework import serializers
from .models import Studio, Equipment, Specialist


class StudioSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Studio
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')


class EquipmentSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')


class SpecialistSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Specialist
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')