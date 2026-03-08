import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(ip, 10, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { products } = body;

    if (!products || products.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 products required for comparison' },
        { status: 400 }
      );
    }

    const productInfo = products.map((p: { name: string; price: number; comparePrice?: number; rating: number; reviewCount: number; stock: number; category?: string; tags?: string[] }) => ({
      name: p.name,
      price: p.price,
      comparePrice: p.comparePrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      category: p.category,
      tags: p.tags,
    }));

    const prompt = `You are a shopping advisor. Compare these products and give a helpful 3-sentence verdict on which one to buy and why. Be specific about trade-offs.

Products to compare:
${JSON.stringify(productInfo, null, 2)}

Provide exactly 3 sentences that:
1. Highlight the best overall value
2. Mention key trade-offs between options
3. Give a clear recommendation based on typical use cases

Keep it concise and actionable. No markdown, just plain text.`;

    const response = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7 }
    );

    return NextResponse.json({
      verdict: response || 'Unable to generate comparison.',
    });
  } catch (error) {
    console.error('Compare verdict error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison verdict.' },
      { status: 500 }
    );
  }
}
