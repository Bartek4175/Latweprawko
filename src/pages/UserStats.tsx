import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TestResult } from '../types'; 
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../styles/UserStats.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface UserStatsProps {
  userId: string;
}

const UserStats: React.FC<UserStatsProps> = ({ userId }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTests, setTotalTests] = useState(0);
  const [positiveTests, setPositiveTests] = useState(0);
  const [negativeTests, setNegativeTests] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [averageTimePerQuestion, setAverageTimePerQuestion] = useState<number>(0);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/test-results/stats/${userId}`);
        const results: TestResult[] = response.data;
        setTestResults(results);
        setTotalTests(results.length);
        const positive = results.filter((result) => result.score >= 68).length;
        const negative = results.filter((result) => result.score < 68).length;
        const average = results.reduce((sum, result) => sum + result.score, 0) / results.length;
        setPositiveTests(positive);
        setNegativeTests(negative);
        setAverageScore(parseFloat(average.toFixed(2)));
        calculateAverageTime(results);
        setIsLoading(false);
      } catch (error) {
        console.error('Błąd podczas pobierania statystyk użytkownika:', error);
        setIsLoading(false);
      }
    };

    fetchTestResults();
  }, [userId]);

  const calculateAverageTime = (results: TestResult[]) => {
    const totalQuestions = results.reduce((sum, result) => sum + result.answers.length, 0);
    const totalTime = results.reduce(
      (sum, result) => sum + result.answers.reduce((acc, answer) => acc + (answer.timeSpent || 0), 0),
      0
    );

    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    setAverageTimePerQuestion(Math.round(averageTime * 100) / 100);
  };

  const calculateExamResult = (score: number) => {
    const isPass = score >= 68;
    return {
      resultText: isPass ? 'Pozytywny' : 'Negatywny',
      resultClass: isPass ? 'success' : 'danger',
    };
  };

  const doughnutData = {
    labels: ['Pozytywne', 'Negatywne'],
    datasets: [
      {
        data: [positiveTests, negativeTests],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
      },
    ],
  };

  const monthlyTestCounts = testResults.reduce((acc: { [key: string]: number }, result) => {
    const month = new Date(result.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month]++;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(monthlyTestCounts),
    datasets: [
      {
        label: 'Liczba testów',
        data: Object.values(monthlyTestCounts),
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: testResults.map((result) => new Date(result.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Średni czas odpowiedzi (s)',
        data: testResults.map((result) =>
          result.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0) / result.answers.length
        ),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.5)',
        fill: true,
      },
    ],
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-4 user-stats-container">
      <h1 className="mb-4 text-center">Twoje statystyki</h1>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Ogólne statystyki</Card.Title>
              <Card.Text>
                <strong>Liczba testów:</strong> {totalTests}
                <br />
                <strong>Pozytywne wyniki:</strong> {positiveTests}
                <br />
                <strong>Negatywne wyniki:</strong> {negativeTests}
                <br />
                <strong>Średni wynik:</strong> {averageScore} / 74
                <br />
                <strong>Średni czas odpowiedzi:</strong> {averageTimePerQuestion} sekund
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-center">Pozytywne vs Negatywne</Card.Title>
              <div className="chart-container doughnut-chart-container">
                <Doughnut data={doughnutData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-center">Testy miesięczne</Card.Title>
              <div className="chart-container bar-chart-container">
                <Bar data={barData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        {testResults.map((result) => {
          const { resultText, resultClass } = calculateExamResult(result.score);
          return (
            <Col md={6} lg={4} key={result._id} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Data: {new Date(result.date).toLocaleDateString()}</Card.Title>
                  <Card.Text>
                    <strong>Wynik:</strong> <Badge bg={resultClass}>{resultText}</Badge>
                    <br />
                    <strong>Punkty:</strong> {result.score} / 74
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-center">Średni czas odpowiedzi w czasie</Card.Title>
              <div className="chart-container">
                <Line data={lineData} options={{ responsive: true }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserStats;
