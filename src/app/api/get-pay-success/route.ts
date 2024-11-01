import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
  }

  try {
    const sql = `
      SELECT 
        \`Order_id\` AS order_id,
        \`Order_date\` AS dateOrdered
      FROM \`Orders\`
      WHERE \`Order_id\` = ?
    `;

    const results = await query<RowDataPacket[]>(sql, [orderId]);

    if (results.length === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const order = results[0];

    return NextResponse.json({
      orderId: order.order_id,
      dateOrdered: order.dateOrdered,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching order data:', error.message, error.stack);
      return NextResponse.json(
        { error: 'Failed to fetch order details', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
