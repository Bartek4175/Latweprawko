import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tests from './pages/Tests';
import Exam from './pages/Exam';
import ExamDemo from './pages/Exam_demo';
import UserStats from './pages/UserStats';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import { Question, User } from './types';
import Learn from './pages/Learn';
import Rules from './pages/Rules';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  {/*const [isLoading, setIsLoading] = useState(false);*/}
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLimited, setIsLimited] = useState(true);

  useEffect(() => {
    const storedUser: User | null = JSON.parse(localStorage.getItem('user') || 'null');
    if (storedUser) {
      setUser(storedUser);
      setIsLimited(false);
    } else {
      setIsLimited(true);
    }
    setIsInitialized(true);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLimited(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLimited(true);
  };

  const handleQuestionsFetched = (fetchedQuestions: Question[]) => {
    setQuestions(fetchedQuestions);
     {/*setIsLoading(false);*/}
  };

  const handleAnswer = (questionId: string, answer: string) => {
    console.log(`Question ID: ${questionId}, Answer: ${answer}`);
  };

  const handleStartExam = () => {
     {/* setIsLoading(true);*/}
  };

  const isPackageValid = () => {
    if (!user || !user.packageExpiration) return false;
    const currentDate = new Date();
    const expirationDate = new Date(user.packageExpiration);
    return expirationDate >= currentDate;
  };

  if (!isInitialized) {
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
                <Tests
                  onQuestionsFetched={handleQuestionsFetched}
                  onStartExam={handleStartExam}
                  isLimited={isLimited}
                />
              }
            />
            <Route
              path="/learn"
              element={
                user && isPackageValid() ? (
                  <Learn userId={user._id} />
                ) : (
                  <Navigate to="/pricing" />
                )
              }
            />
            <Route
              path="/exam-demo"
              element={
                <ExamDemo
                  questions={questions}
                  onAnswer={handleAnswer}
                />
              }
            />
            <Route
              path="/exam"
              element={
                questions.length > 0 || isLimited ? (
                  <Exam
                    questions={questions}
                    onAnswer={handleAnswer}
                    userId={user ? user._id : ''}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/user-stats"
              element={
                user && isPackageValid() ? (
                  <UserStats userId={user._id} />
                ) : (
                  <Navigate to="/pricing" />
                )
              }
            />
            {user && <Route path="/profile" element={<Profile user={user} onUserUpdate={handleLogin} />} />}
            <Route path="/pricing" element={<Pricing user={user} onUserUpdate={handleLogin} />} />
            <Route path="/rules" element={<Rules />} />
          </Routes>
          {/*{isLoading && <div className="loading">Ładowanie...</div>}*/}
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
