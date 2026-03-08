import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ orders: [] });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        userId,
        status,
        total,
        shippingAddress,
        paymentMethod,
        paymentStatus,
        trackingNumber,
        notes,
        createdAt,
        items:order_items(
          id,
          orderId,
          productId,
          quantity,
          price,
          product:products(id, name, images, price)
        )
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: (orders || []).map((order: Record<string, unknown>) => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : (order.shippingAddress || {}),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: order.createdAt,
        items: ((order.items as Array<Record<string, unknown>>) || []).map((item: Record<string, unknown>) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: item.product ? {
            id: (item.product as Record<string, unknown>).id,
            name: (item.product as Record<string, unknown>).name,
            images: typeof (item.product as Record<string, unknown>).images === 'string' 
              ? JSON.parse((item.product as Record<string, unknown>).images as string) 
              : ((item.product as Record<string, unknown>).images || []),
            price: (item.product as Record<string, unknown>).price,
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

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        userId: userId || 'guest',
        status: 'pending',
        total,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify(shippingAddress),
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: { productId: string; quantity: number; price: number }) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      snapshot: JSON.stringify({}),
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
    }

    // Update product stock
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single();
      
      if (product) {
        await supabaseAdmin
          .from('products')
          .update({ stock: Math.max(0, (product.stock || 0) - item.quantity) })
          .eq('id', item.productId);
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: orderItems.map((item: { productId: string; quantity: number; price: number }) => ({
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
