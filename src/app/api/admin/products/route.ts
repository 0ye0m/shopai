import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all products with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { name: true, slug: true }
          }
        }
      }),
      db.product.count({ where })
    ]);

    return NextResponse.json({
      products: products.map(p => ({
        ...p,
        images: JSON.parse(p.images),
        tags: JSON.parse(p.tags)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, comparePrice, stock, sku, categoryId, images, tags, isFeatured, isActive } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if SKU already exists
    const existingSku = await db.product.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await db.product.findUnique({
      where: { slug }
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const product = await db.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock) || 0,
        sku,
        categoryId: categoryId || null,
        images: JSON.stringify(images || []),
        tags: JSON.stringify(tags || []),
        isFeatured: isFeatured || false,
        isActive: isActive !== false
      },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images),
      tags: JSON.parse(product.tags)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingSlug = await db.product.findFirst({
        where: { slug, NOT: { id } }
      });
      updateData.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice ? parseFloat(data.comparePrice) : null;
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images),
      tags: JSON.parse(product.tags)
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
