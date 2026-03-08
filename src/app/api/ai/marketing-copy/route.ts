import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

interface Product {
  name: string;
  description?: string;
  price: number;
  category?: string;
  tags?: string[];
}

function getDefaultCopy(product: Product) {
  return {
    instagram: `✨ Check out ${product.name}! Shop now at ShopAI 🛒 #ShopAI #Shopping #Deals #MustHave #Trending`,
    whatsapp: `🎉 Great news! ${product.name} is now available at just $${product.price}! Shop now: link`,
    googleAdsHeadline: `${product.name} - Shop Now`,
    googleAdsDescription: `Get ${product.name} at the best price. Free shipping on orders over $50.`,
    emailSubjects: [
      `🎉 ${product.name} is here!`,
      `Don't miss: ${product.name}`,
      `New arrival: ${product.name}`,
      `${product.name} - Limited stock!`,
      `Shop ${product.name} today`
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body as { product: Product };

    if (!product) {
      return NextResponse.json(
        { error: 'Product required' },
        { status: 400 }
      );
    }

    const prompt = `You are a marketing copy expert. Generate marketing content for this product.

Product: ${product.name}
Description: ${product.description || 'N/A'}
Price: $${product.price}
Category: ${product.category || 'General'}
Tags: ${product.tags?.join(', ') || 'N/A'}

Generate:
1. Instagram caption (with 5 relevant hashtags, under 200 chars)
2. WhatsApp broadcast message (under 300 chars, friendly tone)
3. Google Ads headline (30 chars max)
4. Google Ads description (90 chars max)
5. Email subject lines (5 variants for A/B testing)

Return JSON:
{
  "instagram": "caption here",
  "whatsapp": "message here",
  "googleAdsHeadline": "headline here",
  "googleAdsDescription": "description here",
  "emailSubjects": ["subject1", "subject2", "subject3", "subject4", "subject5"]
}`;

    const responseText = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.8 }
    );

    let copy;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      copy = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultCopy(product);
    } catch {
      copy = getDefaultCopy(product);
    }

    return NextResponse.json(copy);
  } catch (error) {
    console.error('Marketing copy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing copy' },
      { status: 500 }
    );
  }
}
