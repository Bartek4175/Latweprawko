import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types';

interface PricingProps {
  user: User | null;
  onUserUpdate: (user: User) => void; // Dodano callback do aktualizacji użytkownika
}

const packages = [
  { name: '3 dni', duration: 3, price: 9.99 },
  { name: '30 dni', duration: 30, price: 29.99 },
  { name: '90 dni', duration: 90, price: 79.99 },
];

const Pricing: React.FC<PricingProps> = ({ user, onUserUpdate }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handlePurchase = async (days: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/users/purchase-package', {
        days,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage(`Pakiet na ${days} dni został zakupiony. Nowa data wygaśnięcia: ${new Date(response.data.packageExpiration).toLocaleDateString()}`);
      setError(null);
      await fetchUserData(); // Odśwież dane użytkownika po zakupie pakietu
    } catch (error) {
      setError('Błąd podczas zakupu pakietu.');
      setMessage(null);
    }
  };

  return (
    <Container className="my-4">
      <h1>Cennik</h1>
      {user && user.packageExpiration && (
        <Alert variant="success">
          Masz aktywny pakiet do {new Date(user.packageExpiration).toLocaleDateString()}.
        </Alert>
      )}
      {message && <Alert variant="success" onClose={() => setMessage(null)} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <Row>
        {packages.map((pkg) => (
          <Col md={4} key={pkg.duration}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{pkg.name}</Card.Title>
                <Card.Text>Cena: {pkg.price} zł</Card.Text>
                <Button variant="primary" onClick={() => handlePurchase(pkg.duration)}>
                  Kup teraz
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Pricing;
