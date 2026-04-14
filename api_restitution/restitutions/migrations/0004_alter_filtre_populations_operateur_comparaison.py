from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restitutions', '0003_remove_formats_status_llm_restitutions_status_llm'),
    ]

    operations = [
        migrations.AlterField(
            model_name='filtre_populations',
            name='operateur_comparaison',
            field=models.CharField(
                max_length=10,
                choices=[
                    ('>', '>'),
                    ('>=', '>='),
                    ('<', '<'),
                    ('<=', '<='),
                    ('==', '=='),
                    ('!=', '!='),
                    ('%', '%'),
                    ('%%', '%%'),
                    ('A%', 'A%'),
                    ('%A', '%A'),
                    ('between', 'between'),
                ],
            ),
        ),
    ]
