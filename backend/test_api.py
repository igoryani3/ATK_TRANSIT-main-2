import requests
import sys

BASE_URL = 'http://localhost:5000'
LOGIN_URL = f'{BASE_URL}/api/auth/login'

def test_api():
    session = requests.Session()
    
    # Login
    print(f"Logging in to {LOGIN_URL}...")
    try:
        response = session.post(LOGIN_URL, json={'username': 'dispatcher', 'password': 'dispatcher123'})
        if response.status_code != 200:
            print(f"Login failed: {response.status_code} - {response.text}")
            return
        print("Login successful")
    except Exception as e:
        print(f"Login connection failed: {e}")
        return

    # Test Endpoints
    endpoints = [
        '/api/trips',
        '/api/drivers',
        '/api/vehicles',
        '/api/clients'
    ]
    
    for endpoint in endpoints:
        url = f'{BASE_URL}{endpoint}'
        print(f"Testing {url}...")
        try:
            response = session.get(url)
            if response.status_code == 200:
                data = response.json()
                print(f"  Success: Got {len(data)} items")
                if len(data) > 0:
                    print(f"  First item sample: {str(data[0])[:100]}...")
            else:
                print(f"  Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"  Connection failed: {e}")

if __name__ == '__main__':
    test_api()
