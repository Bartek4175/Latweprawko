import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Question } from '../types';
import '../styles/Tests.css';

interface TestsProps {
  onQuestionsFetched: (questions: Question[]) => void;
  onStartExam: () => void;
  isLimited?: boolean;
}

const Tests: React.FC<TestsProps> = ({ onQuestionsFetched, onStartExam, isLimited = false }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [useOptimizedQuestions, setUseOptimizedQuestions] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('B');
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean>(false);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserId(response.data._id);
        setUseOptimizedQuestions(response.data.useOptimizedQuestions);
        setHasPremiumAccess(
          response.data.packageExpiration
            ? new Date(response.data.packageExpiration) > new Date()
            : false
        );
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
        setHasPremiumAccess(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchQuestions = async () => {
    const endpoint =
      isLimited || !hasPremiumAccess
        ? `http://localhost:5000/api/test/limited-exam-questions`
        : useOptimizedQuestions
        ? `http://localhost:5000/api/test/optimized-exam-questions/${userId}?category=${selectedCategory}`
        : `http://localhost:5000/api/test/exam-questions?category=${selectedCategory}`;

    try {
      const response = await axios.get(endpoint);
      onQuestionsFetched(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania pytań:', error);
    }
  };

  const handleStartExam = async () => {
    setIsFetchingQuestions(true); // Rozpocznij ładowanie
    await fetchQuestions(); // Poczekaj na pobranie pytań
    setIsFetchingQuestions(false); // Zakończ ładowanie
    onStartExam();

    // Nawiguj użytkownika do odpowiedniej ścieżki
    const targetPath =
      isLimited || !hasPremiumAccess ? '/exam-demo' : '/exam';
    navigate(targetPath, {
      state: {
        useOptimizedQuestions,
        selectedCategory,
        isLimited: isLimited || !hasPremiumAccess,
      },
    });
  };

  if (isFetchingQuestions) {
    return <div className="loading">Ładowanie pytań...</div>;
  }

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h1>Testy na prawo jazdy</h1>
        {(isLimited || !hasPremiumAccess) && (
          <p className="limited-info">
            <strong>Uwaga:</strong> Używasz ograniczonej bazy pytań (baza 100 pytań tylko dla kategorii B). Aby
            uzyskać dostęp do pełnej bazy pytań, wykup pakiet premium!
          </p>
        )}
        <p>
          Przygotuj się do egzaminu teoretycznego na prawo jazdy poprzez nasze testy. Wybierz odpowiedni rodzaj testu
          i sprawdź swoją wiedzę.
        </p>
        {hasPremiumAccess && !isLimited && (
          <div className="optimization-info">
            <strong>Algorytm optymalizacji pytań:</strong>{' '}
            {useOptimizedQuestions ? 'Włączony ✅' : 'Wyłączony ❌'}
          </div>
        )}
        {hasPremiumAccess && !isLimited && (
          <div className="category-selector">
            <label htmlFor="category-select">Wybierz kategorię: </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="A">Kategoria A</option>
              <option value="A1">Kategoria A1</option>
              <option value="A2">Kategoria A2</option>
              <option value="AM">Kategoria AM</option>
              <option value="B">Kategoria B</option>
              <option value="B1">Kategoria B1</option>
              <option value="C">Kategoria C</option>
              <option value="C1">Kategoria C1</option>
              <option value="D">Kategoria D</option>
              <option value="D1">Kategoria D1</option>
              <option value="PT">Kategoria PT (tramwaj)</option>
              <option value="T">Kategoria T</option>
            </select>
          </div>
        )}
      </div>
      <div className="tests-content">
        <div className="test-card">
          <h2>Rozpocznij egzamin próbny</h2>
          <p>
            Przeprowadź pełny egzamin próbny, składający się z losowych pytań, tak jak na prawdziwym egzaminie.
          </p>
          <ul>
            <li>Liczba pytań: 32</li>
            <li>Czas trwania egzaminu: 25 minut</li>
            <li>Wymagana liczba punktów do zaliczenia: 68/74</li>
          </ul>
          <button className="test-button" onClick={handleStartExam}>
            Rozpocznij egzamin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tests;
