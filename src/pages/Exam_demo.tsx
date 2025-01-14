import React, { useState, useEffect, useCallback } from 'react';
import { Question, Answer } from '../types';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import '../styles/Exam.css';
import Summary from './Summary';

interface ExamProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
}

const Exam: React.FC<ExamProps> = ({ questions, onAnswer }) => {
  const isLimited = true;
  const location = useLocation();
  const { selectedCategory } = location.state || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalBasicQuestions, setTotalBasicQuestions] = useState(0);
  const [totalSpecialistQuestions, setTotalSpecialistQuestions] = useState(0);
  const [answeredBasic, setAnsweredBasic] = useState(0);
  const [answeredSpecialist, setAnsweredSpecialist] = useState(0);
  const [timer, setTimer] = useState(1500); // 25 minut w sekundach
  const [reviewTime, setReviewTime] = useState(20); // 20 sekund na zapoznanie się z pytaniem
  const [answerTime, setAnswerTime] = useState(15); // 15 sekund na udzielenie odpowiedzi
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExamEnded, setIsExamEnded] = useState(false);
  const [isMediaEnded, setIsMediaEnded] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  useEffect(() => {
    const basicCount = questions.filter((q) => q.type === 'podstawowe').length;
    const specialistCount = questions.filter((q) => q.type === 'specjalistyczne').length;

    setTotalQuestions(questions.length);
    setTotalBasicQuestions(basicCount);
    setTotalSpecialistQuestions(specialistCount);
    setIsLoading(false);
  }, [questions]);

  const handleNextQuestion = useCallback(() => {
    setIsLoading(true);
    setIsMediaEnded(false);

    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === 'podstawowe') {
      setAnsweredBasic((prev) => prev + 1);
    } else if (currentQuestion.type === 'specjalistyczne') {
      setAnsweredSpecialist((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setReviewTime(20);
      setAnswerTime(15);
      setQuestionStartTime(Date.now());
    } else {
      handleEndExam();
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMediaEnded) {
      if (reviewTime > 0) {
        interval = setInterval(() => {
          setReviewTime((prev) => prev - 1);
        }, 1000);
      } else if (answerTime > 0) {
        if (!questionStartTime) setQuestionStartTime(Date.now());
        interval = setInterval(() => {
          setAnswerTime((prev) => prev - 1);
        }, 1000);
      } else {
        handleNextQuestion();
      }
    }
    return () => clearInterval(interval);
  }, [reviewTime, answerTime, isMediaEnded, handleNextQuestion, questionStartTime]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
    onAnswer(currentQuestion._id, answer);
    setReviewTime(0);
  };

  const handleEndExam = () => {
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

  if (isExamEnded) {
    return (
      <Summary
        questions={questions}
        selectedAnswers={selectedAnswers}
        category={selectedCategory}
        isLimited={isLimited}
      />
    );
  }

  return (
    <div className="exam-container">
      {isLimited && (
        <div className="limited-info">
          <strong>Ograniczona baza pytań. Wykup pakiet, aby uzyskać dostęp do pełnej bazy pytań.</strong>
        </div>
      )}
     {isLoading && <div className="loading">Ładowanie...</div>}
      <div className="exam-header">
        <div className="points-value">Wartość punktowa: {currentQuestion.points || 0}</div>
        <div className="category">Kategoria: {selectedCategory}</div>
        <div className="timer">
          Czas do końca testu: {`${Math.floor(timer / 60)}:${('0' + (timer % 60)).slice(-2)}`}
        </div>
        <button className="end-exam-button" onClick={handleEndExam}>
          Zakończ egzamin
        </button>
        <div className="question-progress">
          Pytanie {currentQuestionIndex + 1} z {totalQuestions}
        </div>
      </div>
      <div className="exam-main">
        <div className="question-media" style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
          {currentQuestion.media ? (
            currentQuestion.media.endsWith('.wmv') ? (
              <ReactPlayer
                key={currentQuestionIndex}
                url={'/materialy/' + currentQuestion.media.replace('.wmv', '.mp4')}
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
                src={'/materialy/' + currentQuestion.media}
                alt="media"
                onLoad={() => {
                  handleMediaReady();
                  setIsMediaEnded(true);
                }}
                onError={handleMediaError}
                style={{ width: '100%', height: 'auto' }}
              />
            )
          ) : (
            <img
              key={currentQuestionIndex}
              src={'/materialy/brak.png'}
              alt="media"
              onLoad={() => {
                handleMediaReady();
                setIsMediaEnded(true);
              }}
              onError={handleMediaError}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
        <div className="question-content">
          <div className="question-text">{currentQuestion.content || 'Brak treści pytania'}</div>
          <div className="answers">
            {currentQuestion.answers &&
              currentQuestion.answers.map((answer: Answer, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer.option)}
                  className={`answer-button ${
                    selectedAnswers[currentQuestionIndex] === answer.option ? 'selected' : ''
                  }`}
                >
                  {answer.content}
                </button>
              ))}
          </div>
        </div>
      </div>
      <div className="exam-footer">
        <div className="question-counter">
          Pytania podstawowe: {answeredBasic} z {totalBasicQuestions}
        </div>
        <div className="question-counter">
          Pytania specjalistyczne: {answeredSpecialist} z {totalSpecialistQuestions}
        </div>
        <div className="question-timer">
          {reviewTime > 0 ? `Czas na zapoznanie się: ${reviewTime}s` : `Czas na odpowiedź: ${answerTime}s`}
        </div>
        {currentQuestionIndex === questions.length - 1 ? (
    <button className="end-exam-button" onClick={handleEndExam}>
      Zakończ egzamin
    </button>
  ) : (
    <button className="next-button" onClick={handleNextQuestion}>
      Następne
    </button>
  )}
      </div>
      
    </div>
  );
};

export default Exam;
