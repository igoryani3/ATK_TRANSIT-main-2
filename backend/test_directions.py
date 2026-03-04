from app import create_app

app = create_app()
with app.test_client() as client:
    response = client.get('/api/directions')
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        import json
        data = json.loads(response.data)
        print(f'Directions count: {len(data)}')
        if len(data) > 0:
            print(f'First direction: {data[0]["name"]}')
            print(f'First direction has {len(data[0]["variants"])} variants')
            if len(data[0]["variants"]) > 0:
                variant = data[0]["variants"][0]
                print(f'First variant keys: {list(variant.keys())}')
    else:
        print(f'Error: {response.data.decode()}')
