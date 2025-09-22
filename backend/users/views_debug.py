import secrets
from django.http import JsonResponse, HttpResponseBadRequest
from .mailer_sendgrid_http import send_verification_email

def send_test_email(request):
    to = request.GET.get("to")
    if not to:
        return HttpResponseBadRequest("Provide ?to=email@example.com")

    code = f"{secrets.randbelow(900000) + 100000}"  # random 6-digit code
    send_verification_email(to, code, full_name="Test User")

    return JsonResponse({"sent": True, "to": to, "example_code": code})
