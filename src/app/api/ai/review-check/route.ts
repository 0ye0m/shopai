import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

interface Review {
  rating: number;
  title: string;
  body: string;
}

interface Product {
  name: string;
  category?: string;
}

interface UserHistory {
  hasPurchased?: boolean;
  accountAge?: string;
  previousReviews?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { review, product, userHistory } = body as {
      review: Review;
      product: Product;
      userHistory?: UserHistory;
    };

    if (!review || !product) {
      return NextResponse.json(
        { error: 'Review and product required' },
        { status: 400 }
      );
    }

    const prompt = `You are a review authenticity checker. Determine if this review is likely genuine or fake/spam.

Review:
- Rating: ${review.rating}/5
- Title: "${review.title}"
- Body: "${review.body}"

Product: ${product.name}
Category: ${product.category || 'General'}

User History:
- Has purchased this product: ${userHistory?.hasPurchased ? 'Yes' : 'No'}
- Account age: ${userHistory?.accountAge || 'Unknown'}
- Previous reviews: ${userHistory?.previousReviews || 0}

Check for:
1. Does review content match the product?
2. Is language suspiciously generic (could apply to any product)?
3. Did user actually buy the product?
4. Are there signs of incentivized/spam review?

Return JSON:
{
  "isAuthentic": <boolean>,
  "confidence": <0-100>,
  "flags": ["flag1", "flag2"],
  "recommendation": "<approve|flag|reject>"
}`;

    const responseText = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3 }
    );

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        isAuthentic: true,
        confidence: 70,
        flags: ['Could not analyze'],
        recommendation: 'approve'
      };
    } catch {
      analysis = {
        isAuthentic: true,
        confidence: 70,
        flags: [],
        recommendation: 'approve'
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Review check error:', error);
    return NextResponse.json(
      { error: 'Failed to check review' },
      { status: 500 }
    );
  }
}
