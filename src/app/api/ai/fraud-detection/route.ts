import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData, userData } = body;

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order data required' },
        { status: 400 }
      );
    }

    const prompt = `You are a fraud detection expert. Analyze this order for fraud risk.

Order Details:
- Total Value: $${orderData.total}
- Items: ${orderData.itemCount} items
- Shipping Address: ${orderData.shippingAddress}
- Billing Address: ${orderData.billingAddress || 'Same as shipping'}
- Payment Method: ${orderData.paymentMethod || 'Card'}

Customer Details:
- Account Age: ${userData?.accountAge || 'Unknown'}
- Previous Orders: ${userData?.previousOrders || 0}
- Account Verified: ${userData?.verified || 'Unknown'}

Analyze for these fraud indicators:
1. Shipping/Billing address mismatch
2. New account + high-value order
3. Unusual purchase patterns
4. Multiple orders with different cards

Return JSON format:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<low|medium|high|critical>",
  "reasons": ["reason1", "reason2"],
  "recommendation": "<approve|review|block>"
}`;

    const responseText = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3 }
    );

    let fraudAnalysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      fraudAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        riskScore: 50,
        riskLevel: 'medium',
        reasons: ['Unable to analyze'],
        recommendation: 'review'
      };
    } catch {
      fraudAnalysis = {
        riskScore: 50,
        riskLevel: 'medium',
        reasons: ['Analysis parsing failed'],
        recommendation: 'review'
      };
    }

    return NextResponse.json(fraudAnalysis);
  } catch (error) {
    console.error('Fraud detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze order' },
      { status: 500 }
    );
  }
}
