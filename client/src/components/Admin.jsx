import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [questionId, setQuestionId] = useState('');
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState([{ text: '', frequency: '' }]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/api/admin/questions');
      setQuestions(res.data);
    } catch (err) {
      setMsg('Failed to load questions');
    }
  };

  const addAnswerField = () => setAnswers([...answers, { text: '', frequency: '' }]);
  const updateAnswer = (i, key, value) => {
    const arr = [...answers];
    arr[i][key] = value;
    setAnswers(arr);
  };

  const loadForEdit = (q) => {
    setEditing(q._id);
    setQuestionId(q.questionId);
    setText(q.text);
    setAnswers(q.answers.map(a => ({ text: a.text, frequency: a.frequency })));
    setMsg('Editing question');
  };

  const resetForm = () => {
    setEditing(null);
    setQuestionId('');
    setText('');
    setAnswers([{ text: '', frequency: '' }]);
    setMsg('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        questionId: Number(questionId) || undefined,
        text,
        answers: answers.map(a => ({ text: a.text, frequency: Number(a.frequency) })),
      };
      if (editing) {
        await axios.put(`/api/admin/questions/${editing}`, payload);
        setMsg('Question updated');
      } else {
        await axios.post('/api/admin/questions', payload);
        setMsg('Question added');
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`/api/admin/questions/${id}`);
      setMsg('Deleted');
      fetchQuestions();
    } catch (err) {
      setMsg('Delete failed');
    }
  }

  return (
    <div className="admin-panel p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl mb-4">Admin — Questions</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Create / Edit Question</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm">Question ID (optional)</label><br />
              <input value={questionId} onChange={e => setQuestionId(e.target.value)} className="p-2 rounded bg-surface/60" />
            </div>
            <div>
              <label className="text-sm">Question text</label><br />
              <input value={text} onChange={e => setText(e.target.value)} required className="w-full p-2 rounded bg-surface/60" />
            </div>

            <div>
              <label className="text-sm">Answers</label>
              {answers.map((a, i) => (
                <div key={i} className="flex gap-2 items-center mt-2">
                  <input placeholder="Answer" value={a.text} onChange={e => updateAnswer(i, 'text', e.target.value)} required className="p-2 rounded bg-surface/60" />
                  <input placeholder="Frequency" type="number" value={a.frequency} onChange={e => updateAnswer(i, 'frequency', e.target.value)} required className="p-2 rounded w-28 bg-surface/60" />
                  <div className="text-sm text-[rgba(255,255,255,0.7)]">Points: <strong>{Number(a.frequency) || 0}</strong></div>
                </div>
              ))}
              <div className="mt-2">
                <button type="button" onClick={addAnswerField} className="glass-btn">Add answer</button>
              </div>
            </div>

            <div>
              <button type="submit" className="glass-btn mr-3">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="glass-btn">Reset</button>
            </div>
            {msg && <div className="mt-2 text-sm">{msg}</div>}
          </form>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Existing Questions</h3>
          <ul className="space-y-2">
            {questions.map(q => (
              <li key={q._id} className="p-3 bg-[rgba(255,255,255,0.03)] rounded flex items-start justify-between">
                <div>
                  <div className="text-sm text-[rgba(255,255,255,0.7)]">#{q.questionId}</div>
                  <div className="font-semibold">{q.text}</div>
                  <div className="text-sm mt-1">{q.answers.map(a => `${a.text} (${a.frequency})`).join(' • ')}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => loadForEdit(q)} className="glass-btn px-3 py-1">Edit</button>
                  <button onClick={() => handleDelete(q._id)} className="glass-btn px-3 py-1">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;