// === App.jsx ===
import { useState } from 'react';
import './App.css';

const models = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'hf', label: 'Hugging Face' },
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(models[0].value);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }

      const data = await res.json();
      setResponse(data.text || 'No response from model.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">Chat with AI</header>
      <main className="app__main">
        <form className="chat-form" onSubmit={handleSubmit}>
          <label className="chat-form__label">
            Model
            <select
              className="chat-form__select"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              {models.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="chat-form__label">
            Prompt
            <textarea
              className="chat-form__textarea"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask something..."
              rows={6}
            />
          </label>

          <button className="chat-form__button" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>

        <section className="chat-response">
          <h2 className="chat-response__title">Response</h2>
          {error && <p className="chat-response__error">{error}</p>}
          {response && <p className="chat-response__text">{response}</p>}
          {!error && !response && !loading && (
            <p className="chat-response__placeholder">Send a prompt to see the answer.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
