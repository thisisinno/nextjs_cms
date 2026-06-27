import os

import requests


def translate_text(text, source='en', target='sw'):
    text = (text or '').strip()
    if not text:
        return ''

    base_url = os.getenv('LIBRETRANSLATE_URL', '').rstrip('/')
    api_key = os.getenv('LIBRETRANSLATE_API_KEY', '')

    if not base_url:
        return ''

    payload = {
        'q': text,
        'source': source,
        'target': target,
        'format': 'text',
    }
    if api_key:
        payload['api_key'] = api_key

    try:
        response = requests.post(f'{base_url}/translate', json=payload, timeout=20)
        response.raise_for_status()
        return response.json().get('translatedText', '')
    except Exception:
        return ''
