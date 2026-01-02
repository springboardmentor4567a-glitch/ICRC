import requests, json

LOGIN_URL = 'http://127.0.0.1:5000/api/auth/login'
DASH_URL = 'http://127.0.0.1:5000/api/admin/dashboard'

payload = {'email': 'abc@icrc.com', 'password': 'password'}
try:
    r = requests.post(LOGIN_URL, json=payload, timeout=10)
    print('LOGIN_STATUS', r.status_code)
    print('LOGIN_BODY', r.text)
    if r.ok:
        token = r.json().get('access_token') or r.json().get('accessToken')
        if not token:
            print('No token in response')
        else:
            hdr = {'Authorization': f'Bearer {token}'}
            d = requests.get(DASH_URL, headers=hdr, timeout=10)
            print('DASH_STATUS', d.status_code)
            print('DASH_BODY', d.text)
except Exception as e:
    print('ERROR', e)
