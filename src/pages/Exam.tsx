import React, { useState, useEffect, useCallback } from 'react';
import { Question, Answer } from '../types';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import '../styles/Exam.css'; // Importowanie stylów CSS
import Summary from './Summary';
import axios from 'axios';

interface ExamProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
  userId: string; // Dodano userId jako props
  useOptimizedQuestions?: boolean; // Dodano flagę do sterowania algorytmem optymalizacji
}

const Exam: React.FC<ExamProps> = ({ questions, onAnswer, userId }) => {
  const location = useLocation();
  const { useOptimizedQuestions = true } = location.state || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(questions.length);
  const [timer, setTimer] = useState(1500); // 25 minut w sekundach
  const [reviewTime, setReviewTime] = useState(20); // 20 sekund na zapoznanie się z pytaniem
  const [answerTime, setAnswerTime] = useState(15); // 15 sekund na udzielenie odpowiedzi
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [answerTimes, setAnswerTimes] = useState<{ [key: number]: number }>({}); // Czas odpowiedzi na pytania
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExamEnded, setIsExamEnded] = useState(false);
  const [isMediaEnded, setIsMediaEnded] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null); // Czas rozpoczęcia pytania

  const handleNextQuestion = useCallback(() => {
    if (questionStartTime !== null) {
      const currentTime = Date.now();
      const timeSpent = Math.floor((currentTime - questionStartTime) / 1000);
      console.log(`Czas spędzony na pytaniu ${currentQuestionIndex + 1}: ${timeSpent} sekund`);
      setAnswerTimes(prev => ({ ...prev, [currentQuestionIndex]: timeSpent }));
    }

    setIsLoading(true);
    setIsMediaEnded(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setReviewTime(20);
      setAnswerTime(15);
      setQuestionStartTime(Date.now()); // Ustawianie czasu startu dla nowego pytania
    } else {
      handleEndExam();
    }
  }, [currentQuestionIndex, questions.length, questionStartTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMediaEnded) {
      if (reviewTime > 0) {
        interval = setInterval(() => {
          setReviewTime(prevReviewTime => prevReviewTime - 1);
        }, 1000);
      } else if (answerTime > 0) {
        if (!questionStartTime) setQuestionStartTime(Date.now());
        interval = setInterval(() => {
          setAnswerTime(prevAnswerTime => prevAnswerTime - 1);
        }, 1000);
      } else {
        handleNextQuestion();
      }
    }
    return () => clearInterval(interval);
  }, [reviewTime, answerTime, isMediaEnded, handleNextQuestion, questionStartTime]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer,
    });
    setAnsweredQuestions(a => ({
      ...a,
      [currentQuestionIndex]: true,
    }));
    onAnswer(currentQuestion._id, answer);
    setReviewTime(0);
  };

  const handleEndExam = async () => {
    if (questionStartTime !== null) {
      const currentTime = Date.now();
      const timeSpent = Math.floor((currentTime - questionStartTime) / 1000);
      setAnswerTimes((prev) => ({ ...prev, [currentQuestionIndex]: timeSpent }));
    }

    try {
      await axios.post('http://localhost:5000/api/test-results/save', {
        userId,
        answers: Object.entries(selectedAnswers).map(([index, answer]) => ({
          questionId: questions[parseInt(index)]._id,
          answer,
          timeSpent: answerTimes[parseInt(index)] || 0,
        })),
      });
      console.log('Wynik egzaminu zapisany.');
    } catch (error) {
      console.error('Błąd podczas zapisywania wyniku egzaminu:', error);
    }
    setIsExamEnded(true);
  };

  const currentQuestion = questions[currentQuestionIndex] || ({} as Question);

  const handleMediaReady = () => {
    setIsLoading(false);
  };

  const handleMediaError = () => {
    setIsLoading(false);
  };

  const handleVideoEnd = () => {
    setIsMediaEnded(true);
  };

  useEffect(() => {
    setAnsweredQuestions(a => ({
      ...a,
      [currentQuestionIndex]: true,
    }));
  }, [currentQuestionIndex]);

  if (isExamEnded) {
    return <Summary questions={questions} selectedAnswers={selectedAnswers} />;
  }

  return (
    <div className="exam-container">
      {isLoading && <div className="loading">Ładowanie...</div>}
      <div className="exam-header">
          <div className="points-value">Wartość punktowa: {currentQuestion.points || 0}</div>
          <div className="category">Kategoria: B</div>
          <div className="timer">Czas do końca testu: {`${Math.floor(timer / 60)}:${('0' + (timer % 60)).slice(-2)}`}</div>
          <button className="end-exam-button" onClick={handleEndExam}>Zakończ egzamin</button>
          <div className="question-progress">
            Pytanie {currentQuestionIndex + 1} z {totalQuestions}
          </div>
          {useOptimizedQuestions && (
            <div
              className="optimized-questions-icon"
              title="Optymalizacja pytań włączona"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <img src="/icons/lightning.png" alt="Optymalizacja pytań" style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Optymalizacja włączona</span>
            </div>
          )}
        </div>
      <div className="exam-main">
        <div className="question-media" style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
          {currentQuestion.media ? (
            currentQuestion.media.endsWith('.wmv') ? (
              <ReactPlayer
                key={currentQuestionIndex}
                url={"/materialy/" + currentQuestion.media.replace('.wmv', '.mp4')}
                playing
                controls={false}
                onPlay={handleMediaReady}
                onReady={handleMediaReady}
                onEnded={handleVideoEnd}
                onError={handleMediaError}
                width="100%"
                height="100%"
              />
            ) : (
              <img
                key={currentQuestionIndex}
                src={"/materialy/" + currentQuestion.media}
                alt="media"
                onLoad={() => { handleMediaReady(); setIsMediaEnded(true); }}
                onError={handleMediaError}
                style={{ width: '100%', height: 'auto' }}
              />
            )
          ) : (
            <img
              key={currentQuestionIndex}
              src={"/materialy/brak.png"}
              alt="media"
              onLoad={() => { handleMediaReady(); setIsMediaEnded(true); }}
              onError={handleMediaError}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
        <div className="question-content">
          <div className="question-text">{currentQuestion.content || 'Brak treści pytania'}</div>
          <div className="answers">
            {currentQuestion.answers && currentQuestion.answers.map((answer: Answer, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.option)}
                className={`answer-button ${selectedAnswers[currentQuestionIndex] === answer.option ? 'selected' : ''}`}
              >
                {answer.content}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="exam-footer">
        <div className="question-counter">
          Pytania podstawowe: {Object.keys(answeredQuestions).filter(key => questions[parseInt(key)].type === 'podstawowe').length} z 20
        </div>
        <div className="question-counter">
          Pytania specjalistyczne: {Object.keys(answeredQuestions).filter(key => questions[parseInt(key)].type === 'specjalistyczne').length} z 12
        </div>
        <div className="question-timer">
          {reviewTime > 0 ? `Czas na zapoznanie się: ${reviewTime}s` : `Czas na odpowiedź: ${answerTime}s`}
        </div>
        <button className="next-button" onClick={handleNextQuestion}>Następne</button>
      </div>
    </div>
  );
};

export default Exam;
