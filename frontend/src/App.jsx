import { useState, useEffect } from 'react';
import './App.css';

const TOTAL_QUESTIONS = 10;
const API_URL = '/api/questions';

function App() {
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'admin'
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

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    subject: 'math',
    difficulty: 'medium',
    question: '',
    opt1: '', opt2: '', opt3: '', opt4: '',
    answer: ''
  });
  const [adminStatus, setAdminStatus] = useState('');

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

  const currentQuestionObj = currentQuestions && currentQuestions[difficulty] ? currentQuestions[difficulty][questionIndex % Math.max(1, currentQuestions[difficulty].length)] : null;

  const handleAnswer = (option) => {
    if (selectedOption || !currentQuestionObj) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestionObj.answer;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        setIsQuizFinished(true);
      } else {
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
    }, 1500);
  };

  const getDifficultyLabel = () => {
    if (difficulty === 'easy') return 'Easy Level';
    if (difficulty === 'medium') return 'Medium Level';
    return 'Hard Level';
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminStatus('Saving...');
    
    const newQuestion = {
      subject: adminForm.subject,
      difficulty: adminForm.difficulty,
      question: adminForm.question,
      options: [adminForm.opt1, adminForm.opt2, adminForm.opt3, adminForm.opt4],
      answer: adminForm.answer
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      setAdminStatus('✨ Question added successfully!');
      setAdminForm({ ...adminForm, question: '', opt1: '', opt2: '', opt3: '', opt4: '', answer: '' });
      
      setTimeout(() => setAdminStatus(''), 3000);
    } catch (err) {
      setAdminStatus('❌ Error saving question.');
    }
  };

  if (viewMode === 'admin') {
    return (
      <div className="app-container">
        <button className="mode-toggle" onClick={() => setViewMode('student')}>
          🎓 Switch to Student Mode
        </button>

        <div className="admin-dashboard glass">
          <h2>Teacher Dashboard</h2>
          <form onSubmit={handleAdminSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select className="form-select" value={adminForm.subject} onChange={e => setAdminForm({...adminForm, subject: e.target.value})}>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select className="form-select" value={adminForm.difficulty} onChange={e => setAdminForm({...adminForm, difficulty: e.target.value})}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Question Text</label>
              <input required type="text" className="form-input" placeholder="e.g. What is 5 + 5?" value={adminForm.question} onChange={e => setAdminForm({...adminForm, question: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Option 1</label>
                <input required type="text" className="form-input" value={adminForm.opt1} onChange={e => setAdminForm({...adminForm, opt1: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Option 2</label>
                <input required type="text" className="form-input" value={adminForm.opt2} onChange={e => setAdminForm({...adminForm, opt2: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Option 3</label>
                <input required type="text" className="form-input" value={adminForm.opt3} onChange={e => setAdminForm({...adminForm, opt3: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Option 4</label>
                <input required type="text" className="form-input" value={adminForm.opt4} onChange={e => setAdminForm({...adminForm, opt4: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Correct Answer (must match one option exactly)</label>
              <select required className="form-select" value={adminForm.answer} onChange={e => setAdminForm({...adminForm, answer: e.target.value})}>
                <option value="" disabled>Select correct option...</option>
                {adminForm.opt1 && <option value={adminForm.opt1}>{adminForm.opt1}</option>}
                {adminForm.opt2 && <option value={adminForm.opt2}>{adminForm.opt2}</option>}
                {adminForm.opt3 && <option value={adminForm.opt3}>{adminForm.opt3}</option>}
                {adminForm.opt4 && <option value={adminForm.opt4}>{adminForm.opt4}</option>}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={!adminForm.answer || adminStatus === 'Saving...'}>
              Add Question to Database
            </button>
            
            {adminStatus && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: adminStatus.includes('Error') ? '#ef4444' : '#10b981' }}>
                {adminStatus}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button className="mode-toggle" onClick={() => { setSubject(null); setViewMode('admin'); }}>
        ⚙️ Admin
      </button>

      {!subject && !loading && (
        <div className="header glass" style={{ padding: '3rem', borderRadius: '24px' }}>
          <h1>Adaptive Revision</h1>
          <p>Test your knowledge. The questions adapt to your skill level!</p>
          
          {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
          
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
