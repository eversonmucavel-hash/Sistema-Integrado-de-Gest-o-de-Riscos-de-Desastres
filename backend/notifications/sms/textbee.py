"""
SIGRD - Backend de SMS usando TextBee
Envia SMS através de um telemóvel Android registado no TextBee.
Documentação: https://textbee.dev
"""
import requests
from django.conf import settings
from .base import SMSBackend


class TextBeeBackend(SMSBackend):
    """Backend que envia SMS via TextBee (app Android própria)"""

    nome = 'textbee'

    BASE_URL = 'https://api.textbee.dev/api/v1'

    def __init__(self):
        self.api_key = getattr(settings, 'TEXTBEE_API_KEY', '')
        self.device_id = getattr(settings, 'TEXTBEE_DEVICE_ID', '')

        if not self.api_key or not self.device_id:
            raise ValueError(
                'TextBeeBackend requer TEXTBEE_API_KEY e TEXTBEE_DEVICE_ID '
                'configurados no .env'
            )

    def enviar(self, numero, mensagem):
        """
        Envia SMS via TextBee.

        Argumentos:
            numero (str): Número internacional (+258...)
            mensagem (str): Texto do SMS

        Devolve:
            dict: {sucesso, sid, erro}
        """
        url = f'{self.BASE_URL}/gateway/devices/{self.device_id}/send-sms'

        headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json',
        }

        payload = {
            'recipients': [numero],
            'message': mensagem,
        }

        try:
            response = requests.post( url, json=payload, headers=headers, timeout=60)

            if response.status_code in (200, 201):
                data = response.json()
                # TextBee devolve {data: {smsBatchId, ...}}
                sms_data = data.get('data', {})
                sid = sms_data.get('smsBatchId', 'textbee-ok')
                return {
                    'sucesso': True,
                    'sid': str(sid),
                    'erro': None,
                }
            else:
                # Tentar obter mensagem de erro
                try:
                    erro_json = response.json()
                    erro_msg = erro_json.get('message') or str(erro_json)
                except Exception:
                    erro_msg = response.text[:200]

                return {
                    'sucesso': False,
                    'sid': None,
                    'erro': f'HTTP {response.status_code}: {erro_msg}',
                }

        except requests.exceptions.Timeout:
            return {
                'sucesso': False,
                'sid': None,
                'erro': 'Timeout ao contactar o TextBee',
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