from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0006_seathold'),
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='payment',
            name='status',
        ),

        migrations.RemoveField(
            model_name='payment',
            name='user',
        ),

        migrations.AddField(
            model_name='payment',
            name='payment_id',
            field=models.CharField(
                max_length=100,
                null=True,
                blank=True
            ),
        ),

        migrations.AddField(
            model_name='payment',
            name='payment_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('SUCCESS', 'Success'),
                    ('FAILED', 'Failed'),
                ],
                default='PENDING',
                max_length=20
            ),
        ),

        migrations.AlterField(
            model_name='payment',
            name='booking',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='payments',
                to='bookings.booking'
            ),
        ),
    ]