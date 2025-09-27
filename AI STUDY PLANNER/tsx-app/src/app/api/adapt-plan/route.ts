import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function POST(request: NextRequest) {
  try {
    const { score, previousPlan } = await request.json();

    if (score === undefined || !previousPlan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const performanceLevel = score >= 90 ? 'excellent' : score >= 80 ? 'good' : 'needs improvement';

    const prompt = `
Adapt the study plan based on quiz performance:

**PERFORMANCE:** ${score}% (${performanceLevel})
**PREVIOUS PLAN:** ${previousPlan.slice(0, 1000)}

Provide specific improvements and focus areas.
`;

    const result = await model.generateContent(prompt);
    const adaptedPlan = result.response.text();

    return NextResponse.json({ adaptedPlan });
  } catch (error) {
    console.error('Error adapting plan:', error);
    return NextResponse.json({ error: 'Failed to adapt plan' }, { status: 500 });
  }
}
