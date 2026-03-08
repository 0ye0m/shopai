import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(ip, 10, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use AI to interpret the search query
    const interpretPrompt = `You are a search query interpreter for an e-commerce store. Parse the user's natural language search query and extract structured search parameters.

User query: "${query}"

Respond with a JSON object containing:
- keywords: array of key search terms
- categories: array of potential category names (Electronics, Fashion, Home & Living, Sports & Outdoors, Beauty & Health, Books & Media)
- minPrice: minimum price (number or null)
- maxPrice: maximum price (number or null)
- minRating: minimum rating 1-5 (number or null)
- tags: array of relevant product tags

Only include fields that can be reasonably inferred from the query. Return ONLY the JSON object, no other text.

Example:
Query: "waterproof hiking boots under $100"
Response: {"keywords":["waterproof","hiking","boots"],"categories":["Sports & Outdoors","Fashion"],"maxPrice":100,"tags":["waterproof","hiking","outdoor"]}`;

    const interpretationText = await chatCompletion(
      [{ role: 'user', content: interpretPrompt }],
      { temperature: 0.3 }
    );

    let searchParams;
    try {
      // Extract JSON from the response
      const jsonMatch = interpretationText.match(/\{[\s\S]*\}/);
      searchParams = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      searchParams = { keywords: query.split(' ') };
    }

    // Build database query based on interpreted parameters
    const where: Record<string, unknown> = { isActive: true };

    if (searchParams.categories?.length > 0) {
      const categoryRecords = await db.category.findMany({
        where: {
          name: { in: searchParams.categories },
        },
      });
      if (categoryRecords.length > 0) {
        where.categoryId = { in: categoryRecords.map((c) => c.id) };
      }
    }

    if (searchParams.maxPrice) {
      where.price = { ...where.price as object, lte: searchParams.maxPrice };
    }
    if (searchParams.minPrice) {
      where.price = { ...where.price as object, gte: searchParams.minPrice };
    }

    if (searchParams.minRating) {
      where.rating = { gte: searchParams.minRating };
    }

    // Search by keywords
    if (searchParams.keywords?.length > 0) {
      where.OR = searchParams.keywords.map((keyword: string) => [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ]).flat();
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      take: 20,
    });

    return NextResponse.json({
      interpretation: searchParams,
      products: products.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        tags: JSON.parse(p.tags || '[]'),
      })),
      originalQuery: query,
    });
  } catch (error) {
    console.error('Smart search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
