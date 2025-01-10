import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Question } from '../types';
import '../styles/Tests.css';

interface TestsProps {
  onQuestionsFetched: (questions: Question[]) => void;
  onStartExam: () => void;
}

const Tests: React.FC<TestsProps> = ({ onQuestionsFetched, onStartExam }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [useOptimizedQuestions, setUseOptimizedQuestions] = useState<boolean>(true); // Domyślnie włączone
  const [selectedCategory, setSelectedCategory] = useState<string>('B'); // Domyślna kategoria

  // Pobieranie danych użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserId(response.data._id);
        setUseOptimizedQuestions(response.data.useOptimizedQuestions);
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
      }
    };

    fetchUserData();
  }, []);

  const fetchQuestions = async () => {
    if (!userId) {
      console.error('Brak userId!');
      return;
    }

    const endpoint = useOptimizedQuestions
      ? `http://localhost:5000/api/test/optimized-exam-questions/${userId}?category=${selectedCategory}`
      : `http://localhost:5000/api/test/exam-questions?category=${selectedCategory}`;

    try {
      const response = await axios.get(endpoint);
      onQuestionsFetched(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania pytań:', error);
    }
  };

  const handleStartExam = () => {
    fetchQuestions();
    onStartExam();
    navigate('/exam', { state: { useOptimizedQuestions, selectedCategory } });
  };

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h1>Testy na prawo jazdy</h1>
        <p>
          Przygotuj się do egzaminu teoretycznego na prawo jazdy poprzez nasze testy. Wybierz odpowiedni rodzaj testu i
          sprawdź swoją wiedzę.
        </p>
        <div className="optimization-info">
          <strong>Algorytm optymalizacji pytań:</strong> {useOptimizedQuestions ? 'Włączony ✅' : 'Wyłączony ❌'}
        </div>
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
