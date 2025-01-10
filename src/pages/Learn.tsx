import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Question, Answer } from '../types';
import ReactPlayer from 'react-player';
import '../styles/Learn.css';

const Learn: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState('losowe'); // Domyślnie 'losowe'
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]); // Przechowywanie przerobionych pytań
  const [category, setCategory] = useState<string>('B'); // Kategoria pytań
  const [totalQuestions, setTotalQuestions] = useState<number>(0); // Liczba wszystkich pytań w danej kategorii

  const categories = [
    'A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'PT', 'T'
  ];

  const fetchRandomQuestion = async () => {
    try {
      setIsLoading(true);
      setShowExplanation(false);
      setExplanation(null);
      const response = await axios.get('http://localhost:5000/api/questions/random-question', {
        params: { type: questionType === 'losowe' ? undefined : questionType, category }
      });

      // Jeśli pytanie już zostało przerobione, pobieramy kolejne
      if (completedQuestions.includes(response.data._id)) {
        fetchRandomQuestion();
      } else {
        setCurrentQuestion(response.data);
        setSelectedAnswer(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania pytania:', error);
      setIsLoading(false);
    }
  };

  const fetchExplanation = async (questionId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/${questionId}/explanation`);
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Błąd podczas pobierania wytłumaczenia:', error);
    }
  };

  const fetchTotalQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions/total-questions', {
        params: { category }
      });
      setTotalQuestions(response.data.totalQuestions); 
    } catch (error) {
      console.error('Błąd przy pobieraniu liczby pytań:', error);
    }
  };
  
  useEffect(() => {
    fetchRandomQuestion();
    fetchTotalQuestions(); // Fetch total questions when category changes
  }, [questionType, category]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    fetchRandomQuestion();
  };

  const handleTypeChange = (type: string) => {
    setQuestionType(type);
  };

  const handleCategoryChange = (category: string) => {
    setCategory(category);
  };

  const handleShowExplanation = () => {
    if (currentQuestion) {
      fetchExplanation(currentQuestion._id);
      setShowExplanation(!showExplanation);
    }
  };

  if (isLoading) {
    return <div className="loading">Ładowanie...</div>;
  }

  if (!currentQuestion) {
    return <div>Nie znaleziono pytania.</div>;
  }

  return (
    <div className="learn-container">
      <div className="learn-header">
        <div className="points-value">Nauka: Pytanie {questionType}</div>
      </div>
      <div className="learn-main">
        <div className="question-media" style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
          {currentQuestion.media ? (
            currentQuestion.media.endsWith('.wmv') ? (
              <ReactPlayer
                key={currentQuestion._id} // Reset ReactPlayer dla każdego pytania
                url={"/materialy/" + currentQuestion.media.replace('.wmv', '.mp4')}
                playing
                controls={false} // Wyłączamy kontrolki
                onPlay={() => setIsLoading(false)}
                onReady={() => setIsLoading(false)}
                onEnded={() => {}}
                onError={() => setIsLoading(false)} // Obsługa błędów wczytywania
                width="100%"
                height="100%"
              />
            ) : (
              <img
                key={currentQuestion._id} // Reset img dla każdego pytania
                src={"/materialy/" + currentQuestion.media}
                alt="media"
                onLoad={() => setIsLoading(false)} // Obsługa załadowania obrazu
                onError={() => setIsLoading(false)}
                style={{ width: '100%', height: 'auto' }}
              />
            )
          ) : (
            <img
              key={currentQuestion._id} // Reset img dla każdego pytania
              src={"/materialy/brak.png"}
              alt="media"
              onLoad={() => setIsLoading(false)} // Obsługa załadowania obrazu
              onError={() => setIsLoading(false)}
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
                className={`answer-button ${selectedAnswer === answer.option ? (answer.isCorrect ? 'correct' : 'incorrect') : ''}`}
                style={{ width: '100%' }}
              >
                {answer.content}
              </button>
            ))}
          </div>
          {selectedAnswer && (
            <div className={`feedback ${currentQuestion.answers.find((answer) => answer.option === selectedAnswer)?.isCorrect ? 'correct-text' : 'incorrect-text'}`}>
              {currentQuestion.answers.find((answer) => answer.option === selectedAnswer)?.isCorrect
                ? 'Poprawna odpowiedź!'
                : 'Niepoprawna odpowiedź'}
            </div>
          )}
          {selectedAnswer && (
            <button className="show-explanation-button" onClick={handleShowExplanation}>
              {showExplanation ? 'Ukryj wytłumaczenie' : 'Pokaż wytłumaczenie'}
            </button>
          )}
          {showExplanation && explanation && (
            <div className="explanation-text">
              {explanation}
            </div>
          )}
        </div>
      </div>
      <div className="learn-footer">
        <div className="type-buttons">
          <button
            className={`type-button ${questionType === 'podstawowe' ? 'active' : ''}`}
            onClick={() => handleTypeChange('podstawowe')}
          >
            Podstawowe
          </button>
          <button
            className={`type-button ${questionType === 'specjalistyczne' ? 'active' : ''}`}
            onClick={() => handleTypeChange('specjalistyczne')}
          >
            Specjalistyczne
          </button>
          <button
            className={`type-button ${questionType === 'losowe' ? 'active' : ''}`}
            onClick={() => handleTypeChange('losowe')}
          >
            Dowolna
          </button>
        </div>
        <button className="next-button" onClick={handleNextQuestion}>Następne pytanie</button>
      </div>

      <main className="flex-grow-1">
        <div className="learn-container">
          <div className="learn-header">
            <div className="points-value">Postęp</div>
          </div>
          <div className="progress-info">
            <p>Postęp: {completedQuestions.length} / {totalQuestions} pytań</p>
          </div>
          <div className="category-selection">
            <select onChange={(e) => handleCategoryChange(e.target.value)} value={category}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Kategoria {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Learn;
