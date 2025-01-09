import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Answer {
  option: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  numerPytania: string;
  content: string;
  media?: string;
  points: number;
  category: string;
  answers: Answer[];
  type: string;
}

const Testy: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minut w sekundach
  const [startTime, setStartTime] = useState<number>(0);
  const [answerTimes, setAnswerTimes] = useState<
    { questionId: string; timeSpent: number }[]
  >([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/test/exam-questions');
        setQuestions(response.data);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Błąd podczas pobierania pytań:', error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerClick = (isCorrect: boolean, points: number) => {
    const endTime = Date.now();
    const timeSpent = (endTime - startTime) / 1000;

    setAnswerTimes((prev) => [
      ...prev,
      { questionId: questions[currentQuestion]._id, timeSpent },
    ]);

    if (isCorrect) {
      setScore(score + points);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setStartTime(Date.now());
    } else {
      saveResults();
      alert(`Koniec testu! Twój wynik: ${score} punktów.`);
    }
  };

  const saveResults = async () => {
    try {
      await axios.post('http://localhost:5000/api/test-results/save', {
        userId: 'USER_ID_PLACEHOLDER', // Uzupełnić ID użytkownika
        answers: answerTimes,
      });
      console.log('Wyniki zapisane pomyślnie');
    } catch (error) {
      console.error('Błąd podczas zapisu wyników:', error);
    }
  };

  if (questions.length === 0) {
    return <div>Ładowanie pytań...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div>
      <h1>Egzamin teoretyczny na prawo jazdy</h1>
      <div>
        <p>
          Czas pozostały: {Math.floor(timeLeft / 60)}:
          {timeLeft % 60 < 10 ? '0' : ''}
          {timeLeft % 60}
        </p>
        <p>
          Pytanie {currentQuestion + 1} / {questions.length}
        </p>
        <p>{question.content}</p>
        {question.media && (
          <div>
            {question.media.endsWith('.mp4') ? (
              <video src={`/materiały/${question.media}`} controls />
            ) : (
              <img src={`/materiały/${question.media}`} alt="Media" />
            )}
          </div>
        )}
        <div>
          {question.answers.map((answer) => (
            <button
              key={answer.option}
              onClick={() => handleAnswerClick(answer.isCorrect, question.points)}
            >
              {answer.option}: {answer.content}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testy;
