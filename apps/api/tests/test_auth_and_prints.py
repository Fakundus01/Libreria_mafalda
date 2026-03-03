def test_signup_and_me_flow(client):
    signup = client.post(
        '/api/auth/signup',
        json={
            'full_name': 'Cliente Uno',
            'email': 'cliente1@example.com',
            'password': 'secreto123',
        },
    )
    assert signup.status_code == 201
    token = signup.get_json()['token']

    me = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me.status_code == 200
    assert me.get_json()['user']['email'] == 'cliente1@example.com'


def test_print_request_create_and_fetch(client):
    created = client.post(
        '/api/prints',
        json={
            'customer_name': 'Cliente Print',
            'customer_email': 'print@example.com',
            'specs': {'pages': 10, 'paper_size': 'A4', 'color_bw': 'BW'},
        },
    )
    assert created.status_code == 201
    print_code = created.get_json()['data']['print_code']

    fetched = client.get(f'/api/prints/{print_code}?email=print@example.com')
    assert fetched.status_code == 200
    assert fetched.get_json()['data']['print_code'] == print_code
