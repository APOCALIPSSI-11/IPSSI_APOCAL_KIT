from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """Création et lecture d'un cours."""

    class Meta:
        model = Course
        fields = ["id", "title", "content", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "content": {"required": True, "allow_blank": False},
        }

    def validate_content(self, value: str) -> str:
        value = value.strip()
        if len(value) < 200:
            raise serializers.ValidationError(
                f"Le contenu doit faire au moins 200 caractères "
                f"(actuellement {len(value)})."
            )
        return value
