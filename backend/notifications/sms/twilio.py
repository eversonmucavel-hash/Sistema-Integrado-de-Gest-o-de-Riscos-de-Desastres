"""
SIGRD - Backend de SMS usando Twilio
Requer TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER no .env
"""
from django.conf import settings
from .base import SMSBackend


class TwilioBackend(SMSBackend):
    """Backend que envia SMS reais via Twilio"""

    nome = 'twilio'

    def __init__(self):
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)

        if not self.account_sid or not self.auth_token or not self.phone_number:
            raise ValueError(
                'TwilioBackend requer TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN '
                'e TWILIO_PHONE_NUMBER configurados no .env'
            )

    def enviar(self, numero, mensagem):
        try:
            from twilio.rest import Client
        except ImportError:
            return {
                'sucesso': False,
                'sid': None,
                'erro': 'Pacote twilio nao instalado. Execute: pip install twilio',
            }

        try:
            client = Client(self.account_sid, self.auth_token)
            message = client.messages.create(
                body=mensagem,
                from_=self.phone_number,
                to=numero,
            )
            return {
                'sucesso': True,
                'sid': message.sid,
                'erro': None,
            }
        except Exception as e:
            return {
                'sucesso': False,
                'sid': None,
                'erro': str(e),
            }