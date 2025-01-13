import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tests from './pages/Tests';
import Exam from './pages/Exam';
import UserStats from './pages/UserStats';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import { Question, User } from './types';
import Learn from './pages/Learn';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Flaga inicjalizacji

  useEffect(() => {
    const storedUser: User | null = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    setIsInitialized(true); // Oznacz, że stan użytkownika został załadowany
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Uaktualnienie w localStorage
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleQuestionsFetched = (fetchedQuestions: Question[]) => {
    setQuestions(fetchedQuestions);
    setIsLoading(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    console.log(`Question ID: ${questionId}, Answer: ${answer}`);
  };

  const handleStartExam = () => {
    setIsLoading(true);
  };

  const isPackageValid = () => {
    if (!user || !user.packageExpiration) return false;
    const currentDate = new Date();
    const expirationDate = new Date(user.packageExpiration);
    return expirationDate >= currentDate;
  };

  if (!isInitialized) {
    // Wyświetl loader, dopóki stan użytkownika nie zostanie załadowany
    return <div className="loading">Ładowanie...</div>;
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar user={user} onLogout={handleLogout} />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/tests"
              element={
                isPackageValid() ? (
                  <Tests onQuestionsFetched={handleQuestionsFetched} onStartExam={handleStartExam} />
                ) : (
                  <Navigate to="/pricing" />
                )
              }
            />
            <Route
              path="/learn"
              element={
                isPackageValid() && user ? <Learn userId={user._id} /> : <Navigate to="/pricing" />
              }
            />
            <Route
              path="/exam"
              element={
                questions.length > 0 && user ? (
                  <Exam questions={questions} onAnswer={handleAnswer} userId={user._id} />
                ) : (
                  <Home />
                )
              }
            />
            {user && <Route path="/user-stats" element={<UserStats userId={user._id} />} />}
            {user && <Route path="/profile" element={<Profile user={user} onUserUpdate={handleLogin} />} />}
            <Route path="/pricing" element={<Pricing user={user} onUserUpdate={handleLogin} />} />
          </Routes>
          {isLoading && <div className="loading">Ładowanie...</div>}
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;