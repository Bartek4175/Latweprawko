import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types';

interface PricingProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

const packages = [
  {
    name: '3 dni',
    duration: 3,
    price: 9.99,
    pricePerDay: 9.99 / 3,
    features: [
      'Dostęp do pełnej bazy pytań',
      'Dostęp do wszystkich kategorii prawa jazdy',
      'Zaawansowany algorytm wspomagający naukę',
      'Dostęp do statystyk i postępów',
      'Dostęp do nauki i przerabiania pytań',
    ],
  },
  {
    name: '30 dni',
    duration: 30,
    price: 19.99,
    pricePerDay: 19.99 / 30,
    features: [
      'Dostęp do pełnej bazy pytań',
      'Dostęp do wszystkich kategorii prawa jazdy',
      'Zaawansowany algorytm wspomagający naukę',
      'Dostęp do statystyk i postępów',
      'Dostęp do nauki i przerabiania pytań',
    ],
  },
  {
    name: '90 dni',
    duration: 90,
    price: 39.99, 
    pricePerDay: 39.99 / 90,
    features: [
      'Dostęp do pełnej bazy pytań',
      'Dostęp do wszystkich kategorii prawa jazdy',
      'Zaawansowany algorytm wspomagający naukę',
      'Dostęp do statystyk i postępów',
      'Dostęp do nauki i przerabiania pytań',
    ],
  },
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
      setMessage(`Pakiet na ${days} dni został zakupiony. Nowa data wygaśnięcia dostępu: ${new Date(response.data.packageExpiration).toLocaleDateString()}`);
      setError(null);
      await fetchUserData();
    } catch (error) {
      setError('Błąd podczas zakupu pakietu.');
      setMessage(null);
    }
  };

  const getPricePerDay = (price: number, duration: number) => {
    return (price / duration).toFixed(2);
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
                <Card.Text>
                  <strong>Cena: {pkg.price} zł</strong>
                  <br />
                  <strong>Co zawiera pakiet:</strong>
                  <div style={{ paddingLeft: '20px' }}>
                    {pkg.features.map((feature, index) => (
                      <div key={index}>{feature}</div>
                    ))}
                  </div>
                  <strong>Cena dzienna: {getPricePerDay(pkg.price, pkg.duration)} zł</strong>
                </Card.Text>
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
