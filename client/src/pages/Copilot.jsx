import { useState, useEffect, useRef } from 'react';
import { HiOutlinePaperAirplane, HiOutlineTrash } from 'react-icons/hi';
import ReactMarkdown from 'react-markdown';
import { copilotAPI } from '../services/api';

export default function Copilot() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { copilotAPI.getSuggestions().then(r => setSuggestions(r.data)).catch(() => {}); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (text = input) => {
    if (!text.trim() || loading) return;
    setMsgs(p => [...p, { role: 'user', content: text }]);
    setInput(''); setLoading(true);
    try {
      const r = await copilotAPI.chat(text, convId);
      setConvId(r.data.conversationId);
      setMsgs(p => [...p, { role: 'ai', content: r.data.answer, sources: r.data.sources, confidence: r.data.confidence }]);
    } catch {
      setMsgs(p => [...p, { role: 'ai', content: 'Error processing request. Please try again.' }]);
    }
    setLoading(false);
  };

  const clear = async () => {
    if (convId) copilotAPI.clearConversation(convId).catch(() => {});
    setMsgs([]); setConvId(null);
  };

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>
      <div className="page-top" style={{ marginBottom: '16px', paddingBottom: '16px' }}>
        <div>
          <div className="page-title">AI Copilot</div>
          <div className="page-desc">Query your unified industrial knowledge base.</div>
        </div>
        <button className="btn btn-sm" onClick={clear} style={{ border: 'none', background: 'transparent' }}><HiOutlineTrash /> Clear Chat</button>
      </div>

      <div className="chat-wrap">
        <div className="chat-msgs">
          {msgs.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--text-primary)' }}>IntelliPlant AI</div>
              <p className="text-secondary" style={{ maxWidth: '420px', textAlign: 'center', marginBottom: '32px', fontSize: '13px', lineHeight: '1.6' }}>
                Ask questions about equipment, maintenance history, safety procedures, compliance, or any operational knowledge.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '500px' }}>
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => send(q)} style={{ padding: '12px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-page)'}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
              {m.role === 'ai' ? (
                <div>
                  <div className="md-content"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  
                  {(m.confidence || (m.sources && m.sources.length > 0)) && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-4 mb-2">
                        {m.confidence && (
                          <div className="flex items-center gap-2">
                            <span className="text-tertiary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confidence</span>
                            <span className={`status-dot status-${m.confidence === 'High' ? 'success' : m.confidence === 'Medium' ? 'warning' : 'error'}`} />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.confidence}</span>
                          </div>
                        )}
                        {m.sources?.length > 0 && (
                           <span className="text-tertiary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sources</span>
                        )}
                      </div>
                      
                      {m.sources?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {m.sources.map((s, j) => (
                            <div key={j} className="flex items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <span className="text-tertiary">[{j+1}]</span>
                              <span className="truncate" style={{ maxWidth: '300px' }}>{s.documentName}</span>
                              <span className="mono text-tertiary" style={{ marginLeft: 'auto' }}>{(s.score * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : m.content}
            </div>
          ))}

          {loading && (
            <div className="msg msg-ai text-secondary" style={{ fontSize: '13px' }}>
              Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chat-bar">
          <input className="input" placeholder="Message Copilot..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={loading} style={{ border: 'none', boxShadow: 'none' }} />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '8px 12px' }}>
            <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
