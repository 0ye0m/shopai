import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(ip, 10, 60000); // 10 requests per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch available products from Supabase
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, comparePrice, description, stock, tags, rating, isFeatured, category:categories(name)')
      .eq('isActive', true)
      .order('isFeatured', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching products:', error);
    }

    // Format products for the AI context
    const productsContext = (products || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      comparePrice: p.comparePrice,
      category: (p.category as Record<string, unknown>)?.name || 'Uncategorized',
      description: typeof p.description === 'string' ? p.description.slice(0, 150) + '...' : '',
      stock: p.stock,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
      rating: p.rating,
      isFeatured: p.isFeatured,
    }));

    // Get categories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('name');
    
    const categoriesList = (categories || []).map((c: { name: string }) => c.name).join(', ');

    // Create the system prompt with actual product data
    const systemPrompt = `You are a helpful AI shopping assistant for ShopAI, an e-commerce store. Your role is to:

1. Help customers find products that match their needs from our ACTUAL inventory
2. Answer questions about products, prices, and availability based on real data
3. Provide personalized recommendations from our product catalog
4. Help with gift ideas based on available products
5. Answer questions about shipping, returns, and store policies

IMPORTANT: You can ONLY recommend and discuss products that are in our actual inventory listed below. Do not make up or suggest products that are not in our catalog.

Store Information:
- Free shipping on orders over $50
- 30-day return policy
- Support email: support@shopai.com
- Support phone: 1-800-SHOPAI
- We accept Cash on Delivery (COD) with a $4.99 fee

Available Categories: ${categoriesList}

Our Current Product Inventory (${productsContext.length} products available):
${JSON.stringify(productsContext, null, 2)}

Guidelines:
- Only recommend products from the inventory above
- If asked about a product not in inventory, say "Sorry, we don't currently have that product. Let me show you what we do have in that category..."
- When recommending products, mention the actual price and category
- If stock is low (under 10), mention limited availability
- Be friendly, helpful, and concise
- When users search by category (like "electronics"), show relevant products from that category
- Always try to help customers find the best product for their needs from our actual inventory`;

    // Use the AI helper to generate a response
    const response = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], {
      temperature: 0.7,
    });

    return NextResponse.json({
      response: response || 'I apologize, I could not process your request. Please try again.',
      sessionId,
      productsCount: productsContext.length,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
