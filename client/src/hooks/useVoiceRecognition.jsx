import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = (commands = {}, options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const restartTimeoutRef = useRef(null);

  const {
    continuous = true,
    interimResults = true, // Changed to true for better responsiveness
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
      recognitionInstance.maxAlternatives = 3; // Consider multiple alternatives

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setError(null);
      };

      recognitionInstance.onresult = (event) => {
        // Process both interim and final results
        const results = Array.from(event.results);
        const transcripts = results
          .map(result => result[0].transcript)
          .join(' ');
        
        const command = transcripts.toLowerCase().trim();
        
        console.log('Voice detected:', command);
        setTranscript(command);
        
        // Check for matching commands with fuzzy matching
        Object.entries(commands).forEach(([key, keywords]) => {
          if (Array.isArray(keywords)) {
            const matched = keywords.some(keyword => {
              const keywordLower = keyword.toLowerCase();
              // Check if command contains keyword or is very similar
              return command.includes(keywordLower) || 
                     command.split(' ').some(word => word === keywordLower);
            });
            
            if (matched) {
              console.log(`Command matched: ${key}`);
              // Call the handler
              const handlerKey = key + 'Handler';
              if (typeof commands[handlerKey] === 'function') {
                commands[handlerKey]();
              }
            }
          } else if (typeof keywords === 'function') {
            keywords(command);
          }
        });
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't set listening to false on "no-speech" error
        if (event.error !== 'no-speech') {
          setError(event.error);
          setIsListening(false);
        }
        
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionInstance) {
              try {
                recognitionInstance.start();
              } catch (err) {
                console.log('Already running or error:', err);
              }
            }
          }, 1000);
        }
        
        if (customErrorHandler) {
          customErrorHandler(event.error);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        
        // Auto-restart if it was supposed to be continuous
        if (continuous) {
          restartTimeoutRef.current = setTimeout(() => {
            try {
              recognitionInstance.start();
              console.log('Auto-restarting voice recognition');
            } catch (err) {
              console.log('Could not restart:', err);
            }
          }, 500);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported');
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        console.log('Starting voice recognition...');
      } catch (err) {
        if (err.message.includes('already started')) {
          console.log('Recognition already running');
          setIsListening(true);
        } else {
          console.error('Error starting recognition:', err);
          setError(err.message);
        }
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      recognition.stop();
      console.log('Stopping voice recognition...');
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