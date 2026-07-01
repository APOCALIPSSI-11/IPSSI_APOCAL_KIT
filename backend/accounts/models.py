"""
Modèles de l'app accounts.

[Note pédagogique] On garde le modèle User standard de Django (simple et
robuste), et on lui ajoute un Profil 1-pour-1 pour les infos métier qui ne sont
pas dans User — ici `email_verified` (l'utilisateur a-t-il cliqué le lien de
confirmation envoyé par email ?).

Choix d'architecture « email = identifiant » : à l'inscription, on met
username = email (voir SignupSerializer). Le login se fait donc par email, sans
backend d'authentification custom. C'est le compromis le plus simple pour un
kit pédagogique (un vrai produit utiliserait souvent un User personnalisé avec
USERNAME_FIELD = 'email').
"""

from django.conf import settings
from django.db import models


class Profile(models.Model):
    """Informations complémentaires attachées à un utilisateur."""

    class Role(models.TextChoices):
        STUDENT = "student", "Étudiant"
        TEACHER = "teacher", "Enseignant"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    # Validation "soft" : le compte fonctionne même si l'email n'est pas vérifié,
    # mais un bandeau invite l'utilisateur à cliquer le lien de confirmation.
    email_verified = models.BooleanField(default=False)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text="Rôle de l'utilisateur sur la plateforme.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Profile<{self.user.email or self.user.username}>"


def get_or_create_profile(user) -> Profile:
    """Récupère (ou crée) le profil d'un utilisateur.

    Pratique pour les comptes créés AVANT l'ajout du modèle Profile (ils n'ont
    pas encore de profil) : on le crée à la volée plutôt que de planter.
    """
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


class RGPDRequestLog(models.Model):
    """Audit Trail RGPD (T-RGPD-01.3) : trace inaltérable des demandes SAR.

    On stocke l'email en texte plutôt qu'une FK vers User : une demande de
    suppression (droit à l'oubli, Art. 17) efface le User, mais le log
    d'audit doit rester lisible malgré tout.
    """

    REQUEST_TYPE_CHOICES = [
        ("export", "Export de données"),
        ("delete", "Suppression de compte"),
    ]

    class Status(models.TextChoices):
        RECEIVED = "received", "Reçue"
        PROCESSING = "processing", "En cours"
        ANSWERED = "answered", "Répondue"

    user_email = models.EmailField(help_text="Email de l'utilisateur ayant formulé la demande")
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE_CHOICES)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.RECEIVED)
    file_hash = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        help_text="SHA-256 de l'archive/JSON renvoyé à l'utilisateur (intégrité de la réponse SAR).",
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Log Audit RGPD"
        verbose_name_plural = "Logs Audit RGPD"

    def __str__(self) -> str:
        return f"{self.request_type} · {self.user_email} · {self.timestamp:%Y-%m-%d %H:%M}"
