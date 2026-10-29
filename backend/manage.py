#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# ============================================
# FORÇAR GDAL NO WINDOWS (ANTES DO DJANGO CARREGAR)
# ============================================
# O nome exato do ficheiro que encontrámos na pasta do Conda é 'gdal.dll'
GDAL_PATH = r'C:\Users\everson\miniconda3\envs\sigrd\Library\bin\gdal.dll'

if os.path.exists(GDAL_PATH):
    # Define a variável de ambiente que o Django lê
    os.environ['GDAL_LIBRARY_PATH'] = GDAL_PATH
    
    # Adiciona a pasta bin ao PATH para o Windows encontrar as dependências da DLL
    GDAL_DIR = os.path.dirname(GDAL_PATH)
    os.environ['PATH'] = GDAL_DIR + os.pathsep + os.environ['PATH']
    
    # Regista a pasta no sistema de DLL do Windows (Python 3.8+)
    if hasattr(os, 'add_dll_directory'):
        try:
            os.add_dll_directory(GDAL_DIR)
        except OSError:
            pass
# ============================================

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigrd_core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()