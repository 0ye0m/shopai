import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddress),
        items: order.items.map((item) => ({
          ...item,
          snapshot: JSON.parse(item.snapshot),
          product: {
            ...item.product,
            images: JSON.parse(item.product.images || '[]'),
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
