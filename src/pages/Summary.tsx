import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types';
import '../styles/Summary.css';
import ReactModal from 'react-modal';
import ReactPlayer from 'react-player';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

interface SummaryProps {
  questions: Question[];
  selectedAnswers: { [key: number]: string };
  category: string;
}

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Summary: React.FC<SummaryProps> = ({ questions, selectedAnswers, category }) => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const totalPoints = questions.reduce((sum, question, index) => {
    const selectedAnswer = selectedAnswers[index];
    const correctAnswer = question.answers.find(answer => answer.isCorrect)?.option;
    return selectedAnswer === correctAnswer ? sum + question.points : sum;
  }, 0);

  const maxPoints = questions.reduce((sum, question) => sum + question.points, 0);

  const requiredPoints = 68;

  const isPass = totalPoints >= requiredPoints;

  const basicQuestions = questions.filter(q => q.type === 'podstawowe');
  const specialistQuestions = questions.filter(q => q.type === 'specjalistyczne');

  const correctBasic = basicQuestions.filter((q, index) => {
    const selectedAnswer = selectedAnswers[index];
    const correctAnswer = q.answers.find(answer => answer.isCorrect)?.option;
    return selectedAnswer === correctAnswer;
  }).length;

  const correctSpecialist = specialistQuestions.filter((q, index) => {
    const selectedAnswer = selectedAnswers[index + basicQuestions.length];
    const correctAnswer = q.answers.find(answer => answer.isCorrect)?.option;
    return selectedAnswer === correctAnswer;
  }).length;

  const chartData = {
    labels: ['Podstawowe', 'Specjalistyczne'],
    datasets: [
      {
        label: 'Poprawne',
        data: [correctBasic, correctSpecialist],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Niepoprawne',
        data: [basicQuestions.length - correctBasic, specialistQuestions.length - correctSpecialist],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const openModal = (question: Question) => {
    setCurrentQuestion(question);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentQuestion(null);
  };

  const handleRetry = () => {
    navigate('/tests');
  };

  return (
    <div className="summary-container">
      <h2>Podsumowanie egzaminu</h2>
      <p className="category">Kategoria: {category}</p>
      <p className="total-points">Zdobyte punkty: {totalPoints} / {maxPoints}</p>
      <p className={`exam-result ${isPass ? 'positive' : 'negative'}`}>
        Wynik egzaminu: {isPass ? 'Pozytywny' : 'Negatywny'}
      </p>
      <p>
        Wymagana liczba punktów do zaliczenia: {requiredPoints}<br />
        Maksymalna liczba punktów: {maxPoints}
      </p>
      <div className="chart-container">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Wyniki egzaminu',
              },
            },
          }}
        />
      </div>
      <div className="questions-review">
        {questions.map((question, index) => {
          const selectedAnswer = selectedAnswers[index];
          const correctAnswer = question.answers.find(answer => answer.isCorrect)?.option;
          const isCorrect = selectedAnswer === correctAnswer;

          return (
            <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
              <h3>Pytanie {index + 1}</h3>
              <p>{question.content}</p>
              <p>Twoja odpowiedź: {selectedAnswer || 'Brak odpowiedzi'}</p>
              <p>Poprawna odpowiedź: {correctAnswer}</p>
              <p><strong>Punkty za pytanie:</strong> {question.points}</p>
              {question.media && (
                <button onClick={() => openModal(question)}>Pokaż {question.media.endsWith('.wmv') ? 'film' : 'zdjęcie'}</button>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={handleRetry}>Spróbuj ponownie</button>

      <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal} className="media-modal" overlayClassName="media-overlay">
        {currentQuestion && (
          <>
            <h3>{currentQuestion.content}</h3>
            <p>Twoja odpowiedź: {selectedAnswers[questions.indexOf(currentQuestion)] || 'Brak odpowiedzi'}</p>
            <p>Poprawna odpowiedź: {currentQuestion.answers.find(answer => answer.isCorrect)?.option}</p>
            <p><strong>Punkty za pytanie:</strong> {currentQuestion.points}</p>
            {currentQuestion.media && (
              currentQuestion.media.endsWith('.wmv') ? (
                <ReactPlayer url={`/materialy/${currentQuestion.media.replace('.wmv', '.mp4')}`} playing controls width="100%" height="100%" />
              ) : (
                <img src={`/materialy/${currentQuestion.media}`} alt="media" className="modal-image" style={{ width: '80%', height: 'auto' }} />
              )
            )}
          </>
        )}
        <button onClick={closeModal} className="close-modal-button">Zamknij</button>
      </ReactModal>
    </div>
  );
};

export default Summary;
