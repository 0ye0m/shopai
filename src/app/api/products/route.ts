import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');

    const offset = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
      price: { gte: minPrice, lte: maxPrice },
      rating: { gte: minRating },
    };

    // Category filter
    if (category) {
      const categoryData = await db.category.findFirst({
        where: {
          OR: [
            { slug: category },
            { name: category },
          ],
        },
      });
      
      if (categoryData) {
        where.categoryId = categoryData.id;
      }
    }

    // Featured filter
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: Record<string, unknown> = { createdAt: 'desc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'bestselling':
        orderBy = { reviewCount: 'desc' };
        break;
    }

    // Get total count
    const total = await db.product.count({ where });

    // Get products with category
    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Transform products
    const transformedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      stock: p.stock,
      sku: p.sku,
      categoryId: p.categoryId,
      images: JSON.parse(p.images || '[]'),
      tags: JSON.parse(p.tags || '[]'),
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      createdAt: p.createdAt,
      category: p.category,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}