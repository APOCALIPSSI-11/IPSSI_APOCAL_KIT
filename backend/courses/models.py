from django.conf import settings
from django.db import models


class Course(models.Model):
    """Contenu textuel soumis par un utilisateur, base d'un futur quiz."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Course<{self.title!r} by {self.user.email}>"


class ClassGroup(models.Model):
    """Représente une classe d'étudiants gérée par un enseignant."""

    name = models.CharField(
        max_length=100,
        help_text="Nom du groupe ou de la classe."
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="managed_classes",
        help_text="L'enseignant responsable de la classe."
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="enrolled_classes",
        blank=True,
        help_text="Les étudiants inscrits dans cette classe."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.teacher.email})"
