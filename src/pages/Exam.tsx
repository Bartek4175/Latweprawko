import React, { useState, useEffect, useCallback } from 'react';
import { Question, Answer } from '../types';
import ReactPlayer from 'react-player';
import '../styles/Exam.css'; // Importowanie stylów CSS
import Summary from './Summary';
import axios from 'axios';

interface ExamProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
  userId: string; // Dodano userId jako props
}

const Exam: React.FC<ExamProps> = ({ questions, onAnswer, userId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(questions.length);
  const [timer, setTimer] = useState(1500); // 25 minut w sekundach
  const [reviewTime, setReviewTime] = useState(20); // 20 sekund na zapoznanie się z pytaniem
  const [answerTime, setAnswerTime] = useState(15); // 15 sekund na udzielenie odpowiedzi
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExamEnded, setIsExamEnded] = useState(false);
  const [isMediaEnded, setIsMediaEnded] = useState(false);

  const handleNextQuestion = useCallback(() => {
    setIsLoading(true);
    setIsMediaEnded(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setReviewTime(20);
      setAnswerTime(15);
    } else {
      handleEndExam(); // Zapisz wynik egzaminu na końcu
    }
  }, [currentQuestionIndex, questions.length]);

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
        interval = setInterval(() => {
          setAnswerTime(prevAnswerTime => prevAnswerTime - 1);
        }, 1000);
      } else {
        handleNextQuestion();
      }
    }
    return () => clearInterval(interval);
  }, [reviewTime, answerTime, isMediaEnded, handleNextQuestion]);

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
    setReviewTime(0); // Przejdź od razu do czasu na odpowiedź
  };

  const handleEndExam = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/test-results/save', {
        userId,
        answers: Object.entries(selectedAnswers).map(([index, answer]) => ({
          questionId: questions[parseInt(index)]._id,
          answer,
        })),
      });
      console.log('Wynik egzaminu zapisany', response.data);
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
      </div>
      <div className="exam-main">
        <div className="question-media" style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
          {currentQuestion.media ? (
            currentQuestion.media.endsWith('.wmv') ? (
              <ReactPlayer
                key={currentQuestionIndex} // Reset ReactPlayer dla każdego pytania
                url={"/materialy/" + currentQuestion.media.replace('.wmv', '.mp4')}
                playing
                controls={false} // Wyłączamy kontrolki
                onPlay={handleMediaReady}
                onReady={handleMediaReady}
                onEnded={handleVideoEnd} // Automatycznie zakończ czas na zapoznanie się po zakończeniu filmu
                onError={handleMediaError} // Obsługa błędów wczytywania
                width="100%"
                height="100%"
              />
            ) : (
              <img
                key={currentQuestionIndex} // Reset img dla każdego pytania
                src={"/materialy/" + currentQuestion.media}
                alt="media"
                onLoad={() => { handleMediaReady(); setIsMediaEnded(true); }} // Obsługa załadowania obrazu
                onError={handleMediaError}
                style={{ width: '100%', height: 'auto' }}
              />
            )
          ) : (
            <img
              key={currentQuestionIndex} // Reset img dla każdego pytania
              src={"/materialy/brak.png"}
              alt="media"
              onLoad={() => { handleMediaReady(); setIsMediaEnded(true); }} // Obsługa załadowania obrazu
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
