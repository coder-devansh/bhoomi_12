import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  confidence?: number;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🙏 **Namaste! I'm your BhoomiSetu AI Assistant.**

I can help you with:
• Land partition procedures
• Boundary demarcation queries
• Required documents information
• Legal process guidance
• Dispute status explanations

How can I assist you today?`,
      timestamp: new Date(),
      suggestions: [
        'What documents do I need?',
        'How does partition work?',
        'Boundary dispute help'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process your request.',
        timestamp: new Date(),
        suggestions: data.suggestions,
        confidence: data.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-all z-50 animate-pulse"
        title="AI Legal Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold">BhoomiSetu AI Assistant</h3>
                <p className="text-xs text-white/80">Legal guidance at your fingertips</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Online • Powered by AI</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-md rounded-bl-md border border-gray-100'
                  }`}
                >
                  <div 
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>') 
                    }}
                  />
                  {msg.confidence && (
                    <div className="mt-2 text-xs opacity-60">
                      Confidence: {Math.round(msg.confidence * 100)}%
                    </div>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md p-3 shadow-md border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about land disputes..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
              >
                ➤
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI responses are for guidance only. Consult a lawyer for legal advice.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
