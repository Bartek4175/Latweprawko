import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Question, Answer } from '../types';
import ReactPlayer from 'react-player';
import '../styles/Learn.css';
import { AxiosError } from 'axios';

interface LearnProps {
  userId: string;
}

const Learn: React.FC<LearnProps> = ({ userId }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState('losowe');
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('B');
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  
  const categories = [
    'A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'PT', 'T'
  ];


  const fetchRandomQuestion = async () => {
    try {
      setIsLoading(true);
      setShowExplanation(false);
      setExplanation(null);

      const response = await axios.get('http://localhost:5000/api/questions/random-question', {
        params: { 
          type: questionType === 'losowe' ? undefined : questionType, 
          category,
          userId,
        },
      });
  
      setCurrentQuestion(response.data);
      setSelectedAnswer(null);
      setIsLoading(false);
    } catch (error) {
      const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
        console.log('Brak pytań do wyświetlenia');
      } else {
        console.error('Błąd podczas pobierania pytania:', error);
      }
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

  const fetchCompletedQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions/completed-questions', {
        params: { userId, category },
      });
      setCompletedQuestions(response.data.completedQuestions);
    } catch (error) {
      console.error('Błąd przy pobieraniu ukończonych pytań:', error);
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
    fetchTotalQuestions();
    fetchCompletedQuestions();
  }, [questionType, category]);

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);

    if (currentQuestion) {
      const correctAnswer = currentQuestion.answers.find((ans) => ans.option === answer);

      if (correctAnswer?.isCorrect && userId) {
        try {
          await axios.post('http://localhost:5000/api/questions/update-progress', {
            userId,
            questionId: currentQuestion._id,
            category,
            isReviewed: true,
          });
          fetchCompletedQuestions();
          console.log('Postęp zapisany');
        } catch (error) {
          console.error('Błąd przy zapisywaniu postępu:', error);
        }
      }
    }
  };

  const handleNextQuestion = () => {
    fetchRandomQuestion();
    setIsVideoEnded(false);
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

  const handleReplayVideo = () => {
    setIsVideoEnded(false);
    setVideoKey((prevKey) => prevKey + 1);
  };

  const handleVideoEnded = () => {
    setIsVideoEnded(true);
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
        <div className="question-media" style={{ width: '100%', maxWidth: '600px', height: 'auto', position: 'relative' }}>
          {currentQuestion.media ? (
            currentQuestion.media.endsWith('.wmv') ? (
              <div>
                {isVideoEnded && (
                  <div className="replay-icon" onClick={handleReplayVideo}>
                    <p><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 118.66" width="40" height="40">
                      <path d="M16.68,22.2c-1.78,2.21-3.43,4.55-5.06,7.46C5.63,40.31,3.1,52.39,4.13,64.2c1.01,11.54,5.43,22.83,13.37,32.27 c2.85,3.39,5.91,6.38,9.13,8.97c11.11,8.93,24.28,13.34,37.41,13.22c13.13-0.12,26.21-4.78,37.14-13.98 c3.19-2.68,6.18-5.73,8.91-9.13c6.4-7.96,10.51-17.29,12.07-27.14c1.53-9.67,0.59-19.83-3.07-29.66 c-3.49-9.35-8.82-17.68-15.78-24.21C96.7,8.33,88.59,3.76,79.2,1.48c-2.94-0.71-5.94-1.18-8.99-1.37c-3.06-0.2-6.19-0.13-9.4,0.22 c-2.01,0.22-3.46,2.03-3.24,4.04c0.22,2.01,2.03,3.46,4.04,3.24c2.78-0.31,5.49-0.37,8.14-0.19c2.65,0.17,5.23,0.57,7.73,1.17 c8.11,1.96,15.1,5.91,20.84,11.29c6.14,5.75,10.85,13.12,13.94,21.43c3.21,8.61,4.04,17.51,2.7,25.96 C113.59,75.85,110,84,104.4,90.96c-2.47,3.07-5.12,5.78-7.91,8.13c-9.59,8.07-21.03,12.15-32.5,12.26 c-11.47,0.11-23-3.76-32.76-11.61c-2.9-2.33-5.62-4.98-8.13-7.97c-6.92-8.22-10.77-18.09-11.65-28.2 c-0.91-10.38,1.32-20.99,6.57-30.33c1.59-2.82,3.21-5.07,5.01-7.24l0.53,14.7c0.07,2.02,1.76,3.6,3.78,3.53 c2.02-0.07,3.6-1.76,3.53-3.78l-0.85-23.42c-0.07-2.02-1.76-3.59-3.78-3.52c-0.13,0.01-0.25,0.02-0.37,0.03v0l-22.7,3.19 c-2,0.28-3.4,2.12-3.12,4.13c0.28,2,2.12,3.4,4.13,3.12L16.68,22.2L16.68,22.2L16.68,22.2z M85.78,58.71L53.11,80.65V37.12 L85.78,58.71L85.78,58.71z"/>
                    </svg> Odtwórz ponownie</p>
                  </div>
                )}
                <ReactPlayer
                  key={videoKey}
                  url={"/materialy/" + currentQuestion.media.replace('.wmv', '.mp4')}
                  playing
                  controls={false}
                  onPlay={() => setIsLoading(false)}
                  onReady={() => setIsLoading(false)}
                  onEnded={handleVideoEnded} 
                  onError={() => setIsLoading(false)}
                  width="100%"
                  height="100%"
                />
              </div>
            ) : (
              <img
                key={currentQuestion._id}
                src={"/materialy/" + currentQuestion.media}
                alt="media"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                style={{ width: '100%', height: 'auto' }}
              />
            )
          ) : (
            <img
              key={currentQuestion._id}
              src={"/materialy/brak.png"}
              alt="media"
              onLoad={() => setIsLoading(false)}
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
            <p>Postęp: {completedQuestions} / {totalQuestions} pytań</p>
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
