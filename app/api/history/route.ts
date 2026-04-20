import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Analysis from '@/models/Analysis';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Database se top 5 latest records fetch kar rahe hain
    const history = await Analysis.find().sort({ createdAt: -1 }).limit(5);
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}