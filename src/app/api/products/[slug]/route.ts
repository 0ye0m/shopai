import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products from the same category
    const relatedProducts = product.categoryId 
      ? await db.product.findMany({
          where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            isActive: true,
          },
          take: 8,
          orderBy: { rating: 'desc' },
        })
      : [];

    // Get reviews for the product
    const reviews = await db.review.findMany({
      where: { productId: product.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate rating distribution
    const allReviews = await db.review.findMany({
      where: { productId: product.id },
      select: { rating: true },
    });

    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      },
      relatedProducts: relatedProducts.map(p => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        tags: JSON.parse(p.tags || '[]'),
      })),
      reviews,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
