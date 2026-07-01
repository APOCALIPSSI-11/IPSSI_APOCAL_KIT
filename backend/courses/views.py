from django.contrib.auth.models import User
from django.db.models import Avg, Count, Max, Q
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from quizzes.models import Quiz

from .models import ClassGroup
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


class TeacherDashboardView(APIView):
    """Calcule et renvoie les KPIs globaux et la progression des étudiants pour les classes gérées par l'enseignant connecté."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: OpenApiResponse(description="Données du tableau de bord enseignant")},
        description="Renvoie les métriques globales et de progression pour les classes de l'enseignant connecté.",
    )
    def get(self, request):
        # Vérification du rôle d'enseignant
        profile = getattr(request.user, "profile", None)
        if not profile or profile.role != "teacher":
            return Response(
                {"detail": "Accès réservé aux enseignants."},
                status=status.HTTP_403_FORBIDDEN
            )

        classes = ClassGroup.objects.filter(teacher=request.user)
        students = User.objects.filter(enrolled_classes__in=classes).distinct()

        total_students = students.count()
        quizzes_completed = Quiz.objects.filter(user__in=students, score__isnull=False)
        total_quizzes_completed = quizzes_completed.count()

        avg_aggregate = quizzes_completed.aggregate(avg=Avg("score"))
        avg_score = avg_aggregate["avg"]
        average_score = round(avg_score * 10, 1) if avg_score is not None else None

        # Annotations optimisées pour récupérer les données de chaque étudiant sans requêtes N+1
        students_annotated = students.annotate(
            quizzes_count=Count("quizzes", filter=Q(quizzes__score__isnull=False)),
            avg_score_raw=Avg("quizzes__score", filter=Q(quizzes__score__isnull=False)),
            last_act=Max("quizzes__updated_at", filter=Q(quizzes__score__isnull=False)),
        ).order_by("email", "username")

        students_progress = []
        for s in students_annotated:
            students_progress.append({
                "email": s.email or s.username,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "quizzes_completed": s.quizzes_count,
                "average_score": round(s.avg_score_raw * 10, 1) if s.avg_score_raw is not None else None,
                "last_activity": s.last_act.isoformat() if s.last_act else None,
            })

        return Response(
            {
                "total_students": total_students,
                "average_score": average_score,
                "total_quizzes_completed": total_quizzes_completed,
                "students_progress": students_progress,
            },
            status=status.HTTP_200_OK
        )
