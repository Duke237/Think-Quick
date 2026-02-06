import { useState, useEffect, useCallback } from 'react';

export const useVoiceRecognition = (commands = {}, options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const {
    continuous = true,
    interimResults = false,
    lang = 'en-US',
    onError: customErrorHandler
  } = options;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = interimResults;
      recognitionInstance.lang = lang;

      recognitionInstance.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        const command = text.toLowerCase().trim();
        
        setTranscript(text);
        console.log('Voice input:', command);
        
        // Check for matching commands
        Object.entries(commands).forEach(([key, keywords]) => {
          if (Array.isArray(keywords)) {
            if (keywords.some(keyword => command.includes(keyword.toLowerCase()))) {
              console.log(`Command matched: ${key}`);
              if (typeof commands[key + 'Handler'] === 'function') {
                commands[key + 'Handler']();
              }
            }
          } else if (typeof keywords === 'function') {
            keywords(command);
          }
        });
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        
        if (customErrorHandler) {
          customErrorHandler(event.error);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported');
    }
  }, [continuous, interimResults, lang]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
        console.log('Voice recognition started');
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError(err.message);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      console.log('Voice recognition stopped');
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening
  };
};