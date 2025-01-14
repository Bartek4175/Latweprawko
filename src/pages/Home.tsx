import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/tests');
  };

  return (
    <Container className="home-container">
      <Card className="welcome-card">
        <Card.Body>
          <h1>Testy na prawo jazdy 2025 – Zdaj teorię bez problemów!</h1>
          <p>
            LatwePrawko to najlepszy sposób na zdanie egzaminu teoretycznego na prawo jazdy w 2025 roku. 
            Oferujemy orygialne pytania egzaminacyjne oraz interaktywny sposób nauki, który przygotuje Cię na każdy scenariusz.
          </p>
        </Card.Body>
      </Card>
      <Card className="info-card">
        <Card.Body>
          <h2>Dlaczego warto wybrać LatwePrawko?</h2>
          <ul>
            <li>🌟 <strong>Najbardziej aktualne pytania egzaminacyjne 2025</strong> – zgodne z najnowszymi wytycznymi ministerstwa.
            </li>
            <li>🚗 <strong>Tryb nauki i testów</strong> – ucz się w swoim tempie lub sprawdź swoje postępy w trybie egzaminacyjnym.
            </li>
            <li>📊 <strong>Szczegółowe statystyki</strong> – analizuj swoje wyniki i skup się na najtrudniejszych pytaniach.
            </li>
            <li>📱 <strong>Dostępność 24/7</strong> – ucz się gdziekolwiek jesteś, na komputerze lub telefonie.
            </li>
            <li>🧠 <strong>Optymalizacja nauki</strong> – nasz system dopasowuje pytania do Twoich wyników.
            </li>
          </ul>
        </Card.Body>
      </Card>
      <Card className="start-card">
        <Card.Body>
          <h2>Jak rozpoczać swoją drogę do prawa jazdy w 2025?</h2>
          <p>
            Rozpocznij już dziś! Rejestracja zajmuje tylko kilka minut. Po zalogowaniu się wybierz jedną z poniższych opcji:
          </p>
          <ul>
            <li>
              <strong>Testy na prawo jazdy 2025:</strong> Symulacja prawdziwego egzaminu, jak w WORD!
            </li>
            <li>
              <strong>Tryb nauki:</strong> Ucz się pytań tematycznie, poznając odpowiedzi i wyjaśnienia.
            </li>
            <li>
              <strong>Statystyki:</strong> Sprawdzaj swoje postępy, identyfikuj słabe strony i przygotuj się jeszcze lepiej.
            </li>
          </ul>
          <p>
            <Button variant="primary" onClick={handleStartTest} className="start-test-button">
            Rozpocznij testowy egzamin
          </Button>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Home;
