import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Alert, Form, Button, Container } from 'react-bootstrap';
import { login } from '../services/api';
import { User } from '../types';
import '../styles/Auth.css';

const CLIENT_ID = '510735597950-bl50mnphj88boggtftnm5lmt2ug74ues.apps.googleusercontent.com';

interface LoginProps {
  onLogin: (userData: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.result));
      onLogin(data.result);
      setError('');
      navigate('/tests');
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;
      const decoded: any = jwtDecode(googleToken);
  
      const { email, sub: googleId } = decoded;
  
      const { data } = await login(email, '', googleId);
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.result));
      onLogin(data.result);
  
      navigate('/tests');
    } catch (err) {
      console.error('Error during Google login:', err);
      setError('Logowanie przez Google nie powiodło się.');
    }
  };

  const handleGoogleError = () => {
    setError('Logowanie przez Google nie powiodło się.');
  };

  return (
    <Container className="auth-container">
      <Form onSubmit={handleSubmit} className="auth-form">
        <h2>Logowanie</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="formEmail">
          <Form.Label className="form-label">Adres email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Wpisz email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label className="form-label">Hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="auth-button">
          Zaloguj
        </Button>
        <span><GoogleOAuthProvider clientId={CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </GoogleOAuthProvider></span>
      </Form>
    </Container>
  );
};

export default Login;
