from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CourseSerializer


class CourseCreateView(APIView):
    """Crée un cours (contenu textuel ≥ 200 caractères) pour l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CourseSerializer,
        responses={201: CourseSerializer},
        description="Soumet un cours textuel. `content` doit faire au moins 200 caractères.",
    )
    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save(user=request.user)
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
