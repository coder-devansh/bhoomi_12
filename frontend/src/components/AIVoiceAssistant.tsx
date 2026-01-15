import { useState, useEffect, useRef } from 'react';

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
}

export default function AIVoiceAssistant({ onTranscript }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN'; // Indian English

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (event.results[current].isFinal) {
        handleVoiceCommand(transcript);
        if (onTranscript) {
          onTranscript(transcript);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: command })
      });

      const data = await res.json();
      const responseText = data.response || 'Sorry, I could not understand that.';
      setResponse(responseText);
      
      // Text-to-speech response
      speakResponse(responseText);
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      setResponse(errorMsg);
      speakResponse(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    // Clean markdown formatting for speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\n/g, '. ')
      .replace(/[•📋📜🏠⚖️💡⏱️💰📍🔧📄🆔🏛️⚠️🔵🟡🟢🔔]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 500); // Limit length for speech

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Voice Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse scale-110'
            : isProcessing
            ? 'bg-yellow-500 text-white'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-110'
        }`}
        title={isListening ? 'Stop Listening' : 'Voice Assistant'}
      >
        {isProcessing ? '⏳' : isListening ? '🔴' : '🎤'}
      </button>

      {/* Voice Feedback Panel */}
      {(isListening || transcript || response) && (
        <div className="absolute bottom-20 left-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className={`p-4 text-white ${
            isListening ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🎤
              </div>
              <div>
                <h3 className="font-bold">Voice Assistant</h3>
                <p className="text-xs text-white/80">
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-60 overflow-y-auto">
            {/* Transcript */}
            {transcript && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-1">You said:</div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-800">
                  "{transcript}"
                </div>
              </div>
            )}

            {/* Processing Animation */}
            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <div className="flex gap-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}

            {/* Response */}
            {response && !isProcessing && (
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>Response:</span>
                  <button
                    onClick={stopSpeaking}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    🔇 Stop
                  </button>
                </div>
                <div 
                  className="bg-green-50 p-3 rounded-xl text-green-800 text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: response
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .substring(0, 300) + (response.length > 300 ? '...' : '')
                  }}
                />
              </div>
            )}

            {/* Listening Animation */}
            {isListening && !transcript && (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-sm">Speak now...</p>
              </div>
            )}
          </div>

          {/* Quick Commands */}
          {!isListening && !isProcessing && !response && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 mb-2">Try saying:</div>
              <div className="flex flex-wrap gap-2">
                {['What documents do I need?', 'How to partition land?', 'Track my case'].map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVoiceCommand(cmd)}
                    className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-100"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
