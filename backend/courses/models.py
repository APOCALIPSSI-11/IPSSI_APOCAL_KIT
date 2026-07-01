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
