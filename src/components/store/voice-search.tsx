'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
}

export function VoiceSearch({ onResult }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || 
                           (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    // Use setTimeout to avoid synchronous setState warning
    const timer = setTimeout(() => {
      setIsSupported(true);
    }, 0);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        setIsListening(false);
        onResult(transcript);
        toast.success(`Searching for: "${transcript}"`);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in your browser settings.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else {
        toast.error('Voice recognition failed. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info('🎤 Listening... Say a product name or category');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  }, [isSupported, isListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`relative ${isListening ? 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-800' : ''}`}
      onClick={toggleListening}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4 mr-2 text-red-500 animate-pulse" />
          <span className="text-red-600 dark:text-red-400">Listening...</span>
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping" />
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          <span>Voice Search</span>
        </>
      )}
    </Button>
  );
}
