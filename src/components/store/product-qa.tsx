'use client';

import { useState } from 'react';
import { MessageCircleQuestion, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProductQAProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    tags: string[];
  };
}

interface QAPair {
  question: string;
  answer: string;
  timestamp: Date;
}

export function ProductQA({ product }: ProductQAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);

  const askQuestion = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/product-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          product,
        }),
      });

      const data = await response.json();

      setQaHistory((prev) => [
        { question: question.trim(), answer: data.answer, timestamp: new Date() },
        ...prev,
      ]);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Is this product in stock?',
    'Does it come with a warranty?',
    'What are the key features?',
    'Is this good for beginners?',
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageCircleQuestion className="h-4 w-4 mr-2" />
          Ask AI About This Product
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Product Q&A</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Suggested Questions */}
            {qaHistory.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => setQuestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}

            {/* Q&A History */}
            {qaHistory.length > 0 && (
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {qaHistory.map((qa, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-medium text-primary">Q: {qa.question}</p>
                      <p className="text-sm text-muted-foreground">A: {qa.answer}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askQuestion();
              }}
              className="flex gap-2"
            >
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about this product..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !question.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
