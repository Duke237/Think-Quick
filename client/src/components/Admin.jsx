import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [questionId, setQuestionId] = useState('');
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState([{ text: '', frequency: '' }]);
  const [msg, setMsg] = useState('');

  const addAnswerField = () => setAnswers([...answers, { text: '', frequency: '' }]);
  const updateAnswer = (i, key, value) => {
    const arr = [...answers];
    arr[i][key] = value;
    setAnswers(arr);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        questionId: Number(questionId),
        text,
        answers: answers.map(a => ({ text: a.text, frequency: Number(a.frequency) })),
      };
      await axios.post('/api/admin/questions', payload);
      setMsg('Question added');
      setQuestionId('');
      setText('');
      setAnswers([{ text: '', frequency: '' }]);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Error');
    }
  }

  return (
    <div className="admin-panel" style={{ padding: 20 }}>
      <h2>Admin — Add Question</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Question ID</label><br />
          <input value={questionId} onChange={e => setQuestionId(e.target.value)} required />
        </div>
        <div>
          <label>Question text</label><br />
          <input value={text} onChange={e => setText(e.target.value)} required style={{ width: '80%' }} />
        </div>

        <h4>Answers</h4>
        {answers.map((a, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <input placeholder="Answer" value={a.text} onChange={e => updateAnswer(i, 'text', e.target.value)} required />
            <input placeholder="Frequency (0-100)" type="number" value={a.frequency} onChange={e => updateAnswer(i, 'frequency', e.target.value)} required style={{ marginLeft: 8, width: 120 }} />
          </div>
        ))}
        <button type="button" onClick={addAnswerField} className="btn">Add answer</button>
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn">Submit question</button>
        </div>
      </form>
      {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
};

export default Admin;