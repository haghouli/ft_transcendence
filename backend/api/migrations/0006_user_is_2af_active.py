# Generated by Django 4.2.13 on 2024-08-03 12:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_code_number_alter_code_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_2af_active',
            field=models.BooleanField(default=False),
        ),
    ]
