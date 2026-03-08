'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: getSessionId(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('chatSessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('chatSessionId', sessionId);
      }
      return sessionId;
    }
    return '';
  };

  const quickQuestions = [
    "What's on sale today?",
    'Show me electronics',
    'Recommend something for me',
    'Help me find a gift',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  // Minimized state
  if (isOpen && isMinimized) {
    return (
      <Card
        className="fixed bottom-6 right-6 z-50 shadow-xl border cursor-pointer transition-all duration-300 hover:shadow-2xl"
        onClick={() => setIsMinimized(false)}
      >
        <CardContent className="p-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">AI Shopping Assistant</span>
          <span className="h-2 w-2 bg-green-500 rounded-full ml-auto animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300',
          isOpen && 'scale-0'
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          'fixed z-50 flex flex-col shadow-xl border transition-all duration-300',
          'bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6',
          'w-auto sm:w-96 max-w-[calc(100vw-32px)] sm:max-w-96',
          'h-[85vh] sm:h-[32rem]',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <CardHeader className="pb-3 border-b flex-shrink-0 bg-card rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              AI Shopping Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
          {/* Custom Scrollable Messages Container */}
          <div
            ref={scrollContainerRef}
            className="ai-chat-scroll flex-1 overflow-y-auto overflow-x-hidden p-4"
          >
            {messages.length === 0 ? (
              <div className="text-center py-8 px-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Hi! I&apos;m your AI shopping assistant. I can help you find products from our store.
                </p>
                <div className="space-y-2">
                  {quickQuestions.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-primary/5"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 max-w-[85%] overflow-hidden',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-3 border-t flex-shrink-0 bg-card rounded-b-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 h-9 text-sm"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-9 w-9" 
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
