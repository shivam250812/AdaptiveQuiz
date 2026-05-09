import { useState, useEffect } from 'react';
import './App.css';

const TOTAL_QUESTIONS = 10;
const API_URL = '/api/questions';

function App() {
  const [subject, setSubject] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Quiz State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  
  // UI State
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'

  const fetchQuestions = async (sub) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}?subject=${sub}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setCurrentQuestions(data);
      setSubject(sub);
      setQuestionIndex(0);
      setDifficulty('medium');
      setScore(0);
      setIsQuizFinished(false);
      setSelectedOption(null);
      setFeedback(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (sub) => {
    fetchQuestions(sub);
  };

  const currentQuestionObj = currentQuestions ? currentQuestions[difficulty][questionIndex % 5] : null;

  const handleAnswer = (option) => {
    if (selectedOption) return; // Prevent multiple clicks
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestionObj.answer;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      // Move to next question
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        setIsQuizFinished(true);
      } else {
        // Adapt difficulty
        if (isCorrect) {
          if (difficulty === 'easy') setDifficulty('medium');
          else if (difficulty === 'medium') setDifficulty('hard');
        } else {
          if (difficulty === 'hard') setDifficulty('medium');
          else if (difficulty === 'medium') setDifficulty('easy');
        }
        
        setQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      }
    }, 1500); // Wait 1.5s to show feedback
  };

  const getDifficultyLabel = () => {
    if (difficulty === 'easy') return 'Easy Level';
    if (difficulty === 'medium') return 'Medium Level';
    return 'Hard Level';
  };

  return (
    <div className="app-container">
      {!subject && !loading && (
        <div className="header glass" style={{ padding: '3rem', borderRadius: '24px' }}>
          <h1>Adaptive Revision</h1>
          <p>Test your knowledge. The questions adapt to your skill level!</p>
          
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          
          <div className="subject-selector">
            <button className="subject-btn" onClick={() => handleSubjectSelect('math')}>
              🔢 Mathematics
            </button>
            <button className="subject-btn" onClick={() => handleSubjectSelect('science')}>
              🧬 Science
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="header glass" style={{ padding: '3rem', borderRadius: '24px' }}>
          <h2>Loading Questions...</h2>
        </div>
      )}

      {subject && !isQuizFinished && currentQuestionObj && (
        <div className="quiz-container">
          <div className="quiz-header">
            <span className={`difficulty-badge ${difficulty}`}>
              {getDifficultyLabel()}
            </span>
            <span className="score">Score: {score} / {questionIndex}</span>
          </div>

          <div className="progress-container">
            <div 
              className="progress-fill" 
              style={{ width: `${(questionIndex / TOTAL_QUESTIONS) * 100}%` }}
            ></div>
          </div>

          <div className="question-card glass" key={currentQuestionObj.id}>
            <h2 className="question-text">{currentQuestionObj.question}</h2>
            
            <div className="options-grid">
              {currentQuestionObj.options.map((option, idx) => {
                let btnClass = "option-btn";
                if (selectedOption !== null) {
                  if (option === currentQuestionObj.answer) btnClass += " correct";
                  else if (option === selectedOption) btnClass += " incorrect";
                }

                return (
                  <button 
                    key={idx} 
                    className={btnClass}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedOption !== null}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            
            <div className={`feedback-msg ${feedback || ''}`}>
              {feedback === 'correct' && '✨ Correct! Moving to a harder question...'}
              {feedback === 'incorrect' && '❌ Incorrect. Let\'s try an easier one...'}
            </div>
          </div>
        </div>
      )}

      {isQuizFinished && (
        <div className="results-screen glass">
          <h2>Quiz Complete! 🎉</h2>
          <div className="final-score">{Math.round((score / TOTAL_QUESTIONS) * 100)}%</div>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            You scored {score} out of {TOTAL_QUESTIONS}.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            {score > 7 ? 'Excellent work! You have mastered this.' : 
             score > 4 ? 'Good job! Keep practicing to improve.' : 
             'Don\'t worry, keep studying and you\'ll get it next time!'}
          </p>
          <button className="restart-btn" onClick={() => setSubject(null)}>
            Try Another Subject
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
