import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total revenue
    const orders = await db.order.findMany({
      where: {
        status: {
          not: 'cancelled'
        }
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get order counts
    const totalOrders = await db.order.count();
    const pendingOrders = await db.order.count({
      where: { status: 'pending' }
    });
    const completedOrders = await db.order.count({
      where: { status: 'delivered' }
    });

    // Get product counts
    const totalProducts = await db.product.count();
    const activeProducts = await db.product.count({
      where: { isActive: true }
    });
    const lowStockProducts = await db.product.count({
      where: { stock: { lt: 10 } }
    });

    // Get customer count
    const totalCustomers = await db.user.count({
      where: { role: 'customer' }
    });

    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          select: {
            quantity: true,
            price: true
          }
        }
      }
    });

    // Calculate daily revenue for the last 7 days
    const today = new Date();
    const dailyRevenue: { date: string; revenue: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => 
        order.createdAt >= date && order.createdAt < nextDate
      );
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue
      });
    }

    // Get top selling products
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            price: true,
            images: true
          }
        });
        return {
          ...product,
          quantity: item._sum.quantity
        };
      })
    );

    // Get category breakdown
    const categoryBreakdown = await db.$queryRaw<Array<{ name: string; count: number }>>`
      SELECT c.name, COUNT(p.id) as count
      FROM Category c
      LEFT JOIN Product p ON c.id = p.categoryId
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 5
    `;

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalCustomers
      },
      recentOrders,
      dailyRevenue,
      topProducts: topProductsWithDetails,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
