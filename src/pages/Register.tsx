import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Alert, Form, Button, Container } from 'react-bootstrap';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import '../styles/Auth.css';

const CLIENT_ID = '510735597950-bl50mnphj88boggtftnm5lmt2ug74ues.apps.googleusercontent.com';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptRules) {
      setError('Musisz zaakceptować regulamin, aby się zarejestrować.');
      return;
    }
    try {
      await register(email, password);
      setError('');
      navigate('/login');
    } catch {
      setError('User already exists or other registration error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;
      const decoded: any = jwtDecode(googleToken);
  
      if (decoded) {
        const { email, sub: googleId } = decoded;
  
        const { data } = await register(email, 'GoogleLogin', googleId);
  
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.result));
  
        navigate('/tests');
      } else {
        throw new Error('Niepoprawne dane logowania Google');
      }
    } catch (error) {
      console.error('Błąd logowania przez Google:', error);
      setError('Logowanie przez Google nie powiodło się.');
    }
  };
  

  const handleGoogleFailure = () => {
    setError('Rejestracja przez Google nie powiodła się.');
  };

  return (
    <Container className="auth-container">
      <Form onSubmit={handleSubmit} className="auth-form">
        <h2>Rejestracja</h2>
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
        <Form.Group controlId="formAcceptRules" className="mb-3">
          <Form.Check
            type="checkbox"
            label={
              <>
                Akceptuję{' '}
                <a href="/rules" target="_blank" rel="noopener noreferrer">
                  regulamin
                </a>
              </>
            }
            checked={acceptRules}
            onChange={(e) => setAcceptRules(e.target.checked)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="auth-button">
          Zarejestruj
        </Button>
        <div className="google-login" style={{ marginTop: '20px' }}>
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
          </GoogleOAuthProvider>
        </div>
      </Form>
    </Container>
  );
};

export default Register;
