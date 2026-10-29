"""
SIGRD - Backend de SMS para desenvolvimento
Escreve no terminal em vez de enviar SMS real
"""
from .base import SMSBackend


class ConsoleBackend(SMSBackend):
    """Backend que escreve SMS no terminal (desenvolvimento)"""

    nome = 'console'

    def enviar(self, numero, mensagem):
        linha = '=' * 60
        print()
        print(linha)
        print('  [SMS - CONSOLE BACKEND]')
        print(linha)
        print(f'  Para:    {numero}')
        print(f'  Mensagem: {mensagem[:200]}{"..." if len(mensagem) > 200 else ""}')
        print(linha)
        print()

        return {
            'sucesso': True,
            'sid': f'console-{numero[-4:] if len(numero) >= 4 else "0000"}',
            'erro': None,
        }