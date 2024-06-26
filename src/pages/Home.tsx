import React from 'react';
import { Container, Card } from 'react-bootstrap';
import '../styles/Home.css';

const Home: React.FC = () => {
  return (
    <Container className="home-container">
      <Card className="welcome-card">
        <Card.Body>
          <h1>Witaj!</h1>
          <p>Dzięki LatwePrawko bez problemów zdasz egzamin teoretyczny na prawo jazdy! Rozpocznij naukę już teraz.</p>
        </Card.Body>
      </Card>
      <Card className="info-card">
        <Card.Body>
          <h2>Dlaczego warto korzystać z LatwePrawko?</h2>
          <ul>
            <li>Intuicyjny interfejs użytkownika</li>
            <li>Aktualne pytania egzaminacyjne</li>
            <li>Tryb nauki i egzaminu próbnego</li>
            <li>Szczegółowe statystyki wyników</li>
            <li>Możliwość nauki w dowolnym miejscu i czasie</li>
          </ul>
        </Card.Body>
      </Card>
      <Card className="start-card">
        <Card.Body>
          <h2>Jak zacząć?</h2>
          <p>Aby rozpocząć, zaloguj się na swoje konto, a następnie wybierz jedną z opcji:</p>
          <ul>
            <li><strong>Testy:</strong> Rozpocznij egzamin próbny</li>
            <li><strong>Nauka:</strong> Ucz się pytań w trybie nauki</li>
            <li><strong>Statystyki:</strong> Przeglądaj swoje wyniki</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Home;
