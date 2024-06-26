import React from 'react';
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

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test/exam-questions');
      onQuestionsFetched(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania pytań:', error);
    }
  };

  const handleStartExam = () => {
    fetchQuestions();
    onStartExam();
    navigate('/exam');
  };

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h1>Testy na prawo jazdy</h1>
        <p>Przygotuj się do egzaminu teoretycznego na prawo jazdy poprzez nasze testy. Wybierz odpowiedni rodzaj testu i sprawdź swoją wiedzę.</p>
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
          <button className="test-button" onClick={handleStartExam}>Rozpocznij egzamin</button>
        </div>
      </div>
    </div>
  );
};

export default Tests;
