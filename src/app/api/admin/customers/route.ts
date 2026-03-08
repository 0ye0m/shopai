import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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

    const skip = (page - 1) * limit;

    const where: any = {
      role: 'customer'
    };

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ];
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      db.user.count({ where })
    ]);

    // Get total spent for each customer
    const customersWithSpent = await Promise.all(
      customers.map(async (customer) => {
        const orders = await db.order.findMany({
          where: {
            userId: customer.id,
            status: { not: 'cancelled' }
          },
          select: { total: true }
        });

        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

        return {
          ...customer,
          _sum: {
            orders: {
              total: totalSpent
            }
          }
        };
      })
    );

    return NextResponse.json({
      customers: customersWithSpent,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
