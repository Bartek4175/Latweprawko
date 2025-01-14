import React from 'react';
import { Container } from 'react-bootstrap';

const Rules: React.FC = () => {
  return (
    <Container className="rules-container">
      <h1>Regulamin</h1>
      <p>
        Niniejszy regulamin określa zasady korzystania z serwisu LatwePrawko. Korzystając z serwisu, użytkownik akceptuje
        poniższe postanowienia.
      </p>
      <h2>1. Postanowienia ogólne</h2>
      <p>
        Serwis LatwePrawko umożliwia naukę pytań egzaminacyjnych na prawo jazdy. Użytkownik zobowiązuje się do korzystania
        z serwisu zgodnie z obowiązującym prawem.
      </p>
      <h2>2. Rejestracja i konto użytkownika</h2>
      <ul>
        <li>Rejestracja w serwisie jest bezpłatna.</li>
        <li>Użytkownik ponosi odpowiedzialność za poufność swojego hasła.</li>
        <li>W przypadku naruszenia zasad regulaminu konto użytkownika może zostać zablokowane.</li>
      </ul>
      <h2>3. Prawa autorskie</h2>
      <p>
        Wszystkie materiały dostępne w serwisie są chronione prawem autorskim. Kopiowanie lub rozpowszechnianie treści bez
        zgody właściciela serwisu jest zabronione.
      </p>
      <h2>4. Reklamacje</h2>
      <p>
        Reklamacje dotyczące działania serwisu należy zgłaszać za pośrednictwem formularza kontaktowego.
      </p>
      <h2>5. Postanowienia końcowe</h2>
      <p>
        Regulamin może być zmieniany przez właściciela serwisu. Informacje o zmianach będą udostępniane na stronie głównej.
      </p>
    </Container>
  );
};

export default Rules;