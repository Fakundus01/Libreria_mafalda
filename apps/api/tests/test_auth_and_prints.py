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
    assert 'mafalda_customer_session=' in signup.headers.get('Set-Cookie', '')

    me = client.get('/api/auth/me')
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
def test_customer_login_cookie_session_and_logout(client):
    signup = client.post(
        '/api/auth/signup',
        json={
            'full_name': 'Cliente Dos',
            'email': 'cliente2@example.com',
            'password': 'secreto123',
        },
    )
    assert signup.status_code == 201

    logout = client.post('/api/auth/logout')
    assert logout.status_code == 200

    me_after_signup_logout = client.get('/api/auth/me')
    assert me_after_signup_logout.status_code == 401

    login = client.post(
        '/api/auth/login',
        json={'email': 'cliente2@example.com', 'password': 'secreto123'},
    )
    assert login.status_code == 200
    assert 'mafalda_customer_session=' in login.headers.get('Set-Cookie', '')

    me = client.get('/api/auth/me')
    assert me.status_code == 200
    assert me.get_json()['user']['email'] == 'cliente2@example.com'

    logout = client.post('/api/auth/logout')
    assert logout.status_code == 200

    me_after_logout = client.get('/api/auth/me')
    assert me_after_logout.status_code == 401


