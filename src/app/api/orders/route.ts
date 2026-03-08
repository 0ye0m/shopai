import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        shippingAddress: typeof order.shippingAddress === 'string' 
          ? JSON.parse(order.shippingAddress) 
          : order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            images: JSON.parse(item.product.images || '[]'),
            price: item.product.price,
          } : null,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, total, userId, notes } = body;

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: userId || 'guest',
          status: 'pending',
          total,
          paymentMethod: paymentMethod || 'cod',
          paymentStatus: 'pending',
          shippingAddress: JSON.stringify(shippingAddress),
          notes: notes || null,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: items.map((item: { productId: string; quantity: number; price: number }) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          snapshot: JSON.stringify({}),
        })),
      });

      // Update product stock
      for (const item of items as Array<{ productId: string; quantity: number }>) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: Math.max(0, product.stock - item.quantity) },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json({
      order: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        shippingAddress: typeof order.shippingAddress === 'string' 
          ? JSON.parse(order.shippingAddress) 
          : order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: (items as Array<{ productId: string; quantity: number; price: number }>).map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}