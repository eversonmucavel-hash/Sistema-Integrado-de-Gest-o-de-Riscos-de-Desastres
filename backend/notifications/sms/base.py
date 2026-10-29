"""
SIGRD - Interface abstrata para backends de SMS
"""
from abc import ABC, abstractmethod


class SMSBackend(ABC):
    """Interface que todos os backends de SMS devem implementar"""

    nome = 'base'

    @abstractmethod
    def enviar(self, numero, mensagem):
        """
        Envia um SMS.

        Argumentos:
            numero (str): Número de telefone (formato internacional +258...)
            mensagem (str): Conteúdo do SMS

        Devolve:
            dict: {
                'sucesso': bool,
                'sid': str ou None,
                'erro': str ou None,
            }
        """
        pass


def get_backend(nome=None):
    """
    Devolve a instância do backend configurado.

    Backends disponíveis:
        - 'console'  → Escreve no terminal (grátis, ilimitado)
        - 'textbelt' → Envia SMS reais via Textbelt (1 grátis/dia)
        - 'textbee'  → Envia SMS reais via TextBee (app Android própria)
        - 'twilio'   → Envia SMS reais via Twilio (pago)
    """
    from django.conf import settings

    if nome is None:
        nome = getattr(settings, 'SMS_BACKEND', 'console')

    if nome == 'twilio':
        from .twilio import TwilioBackend
        return TwilioBackend()
    elif nome == 'textbelt':
        from .textbelt import TextbeltBackend
        return TextbeltBackend()
    elif nome == 'textbee':
        from .textbee import TextBeeBackend
        return TextBeeBackend()
    else:
        from .console import ConsoleBackend
        return ConsoleBackend()