import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Container from '../components/Container';
import { apiPost } from '../lib/api';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const res = await apiPost('/api/auth/login', form);
      localStorage.setItem('mafalda_token', res.token);
      localStorage.setItem('mafalda_user', JSON.stringify(res.user));
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <main className="bg-cream py-16">
      <Container className="max-w-md">
        <Card>
          <h1 className="font-serif text-3xl">Ingresar</h1>
          <form className="mt-5 space-y-3" onSubmit={submit}>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button as="button" type="submit" className="w-full bg-stone-900 text-cream">Ingresar</Button>
            <p className="text-sm">¿No tenés cuenta? <Link className="underline" to="/signup">Crear cuenta</Link></p>
          </form>
        </Card>
      </Container>
    </main>
  );
}

export default LoginPage;
