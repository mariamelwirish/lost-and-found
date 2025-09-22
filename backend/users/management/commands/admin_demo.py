from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create an admin demo account"

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(username="admin_demo").exists():
            u = User.objects.create_superuser(
                username="admin_demo",
                email="admin_demo@mail.aub.edu",
                password="password",  # username and password are both 'password'
                first_name="Admin",
                last_name="Demo",
                phone="00000000",
            )
            self.stdout.write(self.style.SUCCESS(
                "Created admin account: username='admin_demo', password='password'"
            ))
        else:
            self.stdout.write("Admin demo user already exists.")
