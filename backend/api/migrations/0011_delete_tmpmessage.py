# Generated by Django 4.2.13 on 2024-05-18 07:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_tmpmessage'),
    ]

    operations = [
        migrations.DeleteModel(
            name='tmpMessage',
        ),
    ]