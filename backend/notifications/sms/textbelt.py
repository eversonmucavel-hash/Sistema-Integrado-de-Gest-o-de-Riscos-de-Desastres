"""
SIGRD - Backend de SMS usando Textbelt
Textbelt permite 1 SMS grátis por dia sem conta (key='textbelt')
Para mais SMS: https://textbelt.com (planos pagos)

Documentação: https://textbelt.com/api/
"""
import requests
from django.conf import settings
from .base import SMSBackend


class TextbeltBackend(SMSBackend):
    """Backend que envia SMS via Textbelt (1 grátis/dia)"""

    nome = 'textbelt'

    URL_API = 'https://textbelt.com/text'

    def __init__(self):
        # 'textbelt' = chave grátis (1 SMS/dia)
        # Ou chave paga obtida em textbelt.com
        self.api_key = getattr(settings, 'TEXTBELT_API_KEY', 'textbelt')

    def enviar(self, numero, mensagem):
        """
        Envia SMS via Textbelt.

        Argumentos:
            numero (str): Número em formato internacional (+258...)
            mensagem (str): Texto do SMS

        Devolve:
            dict: {sucesso, sid, erro}
        """
        try:
            response = requests.post(
                self.URL_API,
                data={
                    'phone': numero,
                    'message': mensagem,
                    'key': self.api_key,
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            if data.get('success'):
                return {
                    'sucesso': True,
                    'sid': data.get('textId', 'textbelt-ok'),
                    'erro': None,
                }
            else:
                return {
                    'sucesso': False,
                    'sid': None,
                    'erro': data.get('error', 'Erro desconhecido do Textbelt'),
                }

        except requests.exceptions.Timeout:
            return {
                'sucesso': False,
                'sid': None,
                'erro': 'Timeout ao contactar o Textbelt',
            }
        except requests.exceptions.RequestException as e:
            return {
                'sucesso': False,
                'sid': None,
                'erro': f'Erro de rede: {str(e)}',
            }
        except Exception as e:
            return {
                'sucesso': False,
                'sid': None,
                'erro': f'Erro inesperado: {str(e)}',
            }