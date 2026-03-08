import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all categories using Prisma
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });

    // Get product counts for each category
    const productCounts = await db.product.groupBy({
      by: ['categoryId'],
      where: { isActive: true },
      _count: { id: true },
    });

    // Create a map of categoryId -> count
    const countMap = new Map<string, number>();
    productCounts.forEach((pc) => {
      if (pc.categoryId) {
        countMap.set(pc.categoryId, pc._count.id);
      }
    });

    // Transform the result
    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: countMap.get(c.id) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}