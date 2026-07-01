# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("quizzes", "0002_question_selected_index"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="chapter",
            field=models.CharField(
                blank=True,
                help_text="Nom du chapitre associé à cette question (généré par le LLM).",
                max_length=100,
                null=True,
            ),
        ),
    ]
