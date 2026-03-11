from rest_framework import serializers
from .models import Studio, Equipment, Specialist


class StudioSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Studio
        fields = [
            "id",
            "name",
            "address",
            "price_per_hour",
            "description",
            "image",
            "owner",
            "owner_username",
            "created_at",
        ]
        read_only_fields = ["owner"]


class EquipmentSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "type",
            "price_per_hour",
            "description",
            "image",
            "owner",
            "owner_username",
            "created_at",
        ]
        read_only_fields = ["owner"]


class SpecialistSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Specialist
        fields = [
            "id",
            "name",
            "specialization",
            "price_per_hour",
            "description",
            "portfolio",
            "owner",
            "owner_username",
            "created_at",
        ]
        read_only_fields = ["owner"]
