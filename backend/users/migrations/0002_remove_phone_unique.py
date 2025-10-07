# Generated manually to remove unique constraint from phone field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pendinguser',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
