import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUserUpdate: (user: User) => void; // Dodano callback do aktualizacji użytkownika
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      onUserUpdate(response.data);
    } catch (error) {
      console.error('Błąd podczas odświeżania danych użytkownika', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage('Nowe hasła się nie zgadzają.');
      return;
    }
    try {
      await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage('Hasło zostało zmienione pomyślnie.');
      await fetchUserData(); // Odśwież dane użytkownika po zmianie hasła
    } catch (error) {
      setMessage('Błąd podczas zmiany hasła.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('http://localhost:5000/api/users/delete-account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage('Konto zostało usunięte.');
    } catch (error) {
      setMessage('Błąd podczas usuwania konta.');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/export-data', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_data.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      setMessage('Błąd podczas eksportowania danych.');
    }
  };

  return (
    <Container className="my-4">
      <h1>Profil użytkownika</h1>
      {user.packageExpiration && (
        <Alert variant="success">
          Masz aktywny pakiet do {new Date(user.packageExpiration).toLocaleDateString()}.
        </Alert>
      )}
      {message && <Alert variant="info">{message}</Alert>}
      <Form>
        <Form.Group controlId="formCurrentPassword">
          <Form.Label>Aktualne hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Wpisz aktualne hasło"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formNewPassword">
          <Form.Label>Nowe hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Wpisz nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formConfirmNewPassword">
          <Form.Label>Potwierdź nowe hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Potwierdź nowe hasło"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handlePasswordChange}>
          Zmień hasło
        </Button>
      </Form>
      <Button variant="danger" className="mt-3" onClick={handleDeleteAccount}>
        Usuń konto
      </Button>
      <Button variant="secondary" className="mt-3" onClick={handleExportData}>
        Eksportuj dane
      </Button>
    </Container>
  );
};

export default Profile;
