import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, description, image, parentId, createdAt, updatedAt')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Get product counts for each category
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('categoryId');

    // Count products per category
    const countMap = new Map<string, number>();
    (products || []).forEach((p: { categoryId: string | null }) => {
      if (p.categoryId) {
        countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
      }
    });

    const result = (categories || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: countMap.get(c.id as string) || 0,
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
