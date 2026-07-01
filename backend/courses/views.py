from django.db.models import Avg, Count, Max
from drf_spectacular.utils import extend_schema
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db.models import Avg, Count, Max, Q
from django.contrib.auth.models import User
from quizzes.models import Quiz
from .models import ClassGroup
from accounts.models import Profile, get_or_create_profile
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


class TeacherDashboardView(APIView):
    """Dashboard agrégé des classes gérées par l'enseignant connecté."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: {
                "type": "object",
                "properties": {
                    "total_students": {"type": "integer"},
                    "average_score": {"type": "number"},
                    "total_quizzes_completed": {"type": "integer"},
                    "students_progress": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "email": {"type": "string"},
                                "first_name": {"type": "string"},
                                "last_name": {"type": "string"},
                                "quizzes_completed": {"type": "integer"},
                                "average_score": {"type": "number"},
                                "last_activity": {"type": "string", "format": "date-time"},
                            },
                        },
                    },
                },
            }
        }
    )
    def get(self, request):
        profile = get_or_create_profile(request.user)
        if profile.role != Profile.Role.TEACHER:
            return Response(
                {"detail": "Accès réservé aux enseignants."},
                status=status.HTTP_403_FORBIDDEN,
            )

        class_groups = ClassGroup.objects.filter(teacher=request.user).prefetch_related("students")
        student_ids = set()
        for group in class_groups:
            student_ids.update(group.students.values_list("id", flat=True))

        if not student_ids:
            return Response(
                {
                    "total_students": 0,
                    "average_score": 0.0,
                    "total_quizzes_completed": 0,
                    "students_progress": [],
                }
            )

        quizzes = Quiz.objects.filter(user_id__in=student_ids, score__isnull=False)
        global_stats = quizzes.aggregate(
            average_score=Avg("score"),
            total_quizzes_completed=Count("id"),
        )

        students_progress = []
        student_stats_qs = (
            quizzes.values("user__id", "user__email", "user__first_name", "user__last_name")
            .annotate(
                quizzes_completed=Count("id"),
                average_score=Avg("score"),
                last_activity=Max("updated_at"),
            )
            .order_by("user__last_name", "user__first_name", "user__email")
        )

        for row in student_stats_qs:
            students_progress.append(
                {
                    "email": row["user__email"],
                    "first_name": row["user__first_name"] or "",
                    "last_name": row["user__last_name"] or "",
                    "quizzes_completed": row["quizzes_completed"],
                    "average_score": round(float(row["average_score"] or 0.0), 2),
                    "last_activity": row["last_activity"],
                }
            )

        return Response(
            {
                "total_students": len(student_ids),
                "average_score": round(float(global_stats["average_score"] or 0.0), 2),
                "total_quizzes_completed": global_stats["total_quizzes_completed"] or 0,
                "students_progress": students_progress,
            }
        )
