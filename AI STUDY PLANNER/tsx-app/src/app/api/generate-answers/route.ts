import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function POST(request: NextRequest) {
  try {
    const { questionPaperText, textbookText, subject } = await request.json();

    if (!questionPaperText || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `
Generate comprehensive answers for ${subject} questions:

**TEXTBOOK:** ${textbookText.slice(0, 1500)}
**QUESTIONS:** ${questionPaperText.slice(0, 1500)}

Provide detailed, numbered answers with explanations.
`;

    const result = await model.generateContent(prompt);
    const answers = result.response.text();

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error generating answers:', error);
    return NextResponse.json({ error: 'Failed to generate answers' }, { status: 500 });
  }
}
