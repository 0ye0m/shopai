import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(ip, 15, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { question, product } = body;

    if (!question || !product) {
      return NextResponse.json(
        { error: 'Question and product info required' },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful product expert. Answer the customer's question about this product accurately and helpfully.

Product Information:
Name: ${product.name}
Description: ${product.description || 'N/A'}
Price: $${product.price}
Category: ${product.category || 'General'}
Tags: ${product.tags?.join(', ') || 'N/A'}

Customer Question: "${question}"

Provide a helpful, accurate answer. If the question cannot be answered from the product info, say so honestly and suggest what information might help. Keep response under 100 words.`;

    const response = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5 }
    );

    return NextResponse.json({
      answer: response || 'Unable to answer at this time.',
    });
  } catch (error) {
    console.error('Product Q&A error:', error);
    return NextResponse.json(
      { error: 'Failed to process question.' },
      { status: 500 }
    );
  }
}
