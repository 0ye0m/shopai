import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

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

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select('*, category:categories(id, name, slug)', { count: 'exact' })
      .eq('isActive', true)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .gte('rating', minRating);

    // Category filter
    if (category) {
      const { data: categoryData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .or(`slug.eq.${category},name.eq.${category}`)
        .single();
      
      if (categoryData) {
        query = query.eq('categoryId', categoryData.id);
      }
    }

    // Featured filter
    if (featured === 'true') {
      query = query.eq('isFeatured', true);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'bestselling':
        query = query.order('reviewCount', { ascending: false });
        break;
      default:
        query = query.order('createdAt', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform products
    const transformedProducts = (products || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice,
      stock: p.stock,
      sku: p.sku,
      categoryId: p.categoryId,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      createdAt: p.createdAt,
      category: p.category ? {
        id: (p.category as Record<string, unknown>).id,
        name: (p.category as Record<string, unknown>).name,
        slug: (p.category as Record<string, unknown>).slug,
      } : null,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
