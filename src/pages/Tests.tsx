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
      ? `http://localhost:5000/api/test/optimized-exam-questions/${userId}`
      : `http://localhost:5000/api/test/exam-questions`;

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
    navigate('/exam', { state: { useOptimizedQuestions } });

  };

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h1>Testy na prawo jazdy</h1>
        <p>Przygotuj się do egzaminu teoretycznego na prawo jazdy poprzez nasze testy. Wybierz odpowiedni rodzaj testu i sprawdź swoją wiedzę.</p>
        <div className="optimization-info">
          <strong>Algorytm optymalizacji pytań:</strong> {useOptimizedQuestions ? 'Włączony ✅' : 'Wyłączony ❌'}
        </div>
      </div>
      <div className="tests-content">
        <div className="test-card">
          <h2>Rozpocznij egzamin próbny</h2>
          <p>Przeprowadź pełny egzamin próbny, składający się z losowych pytań, tak jak na prawdziwym egzaminie.</p>
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
