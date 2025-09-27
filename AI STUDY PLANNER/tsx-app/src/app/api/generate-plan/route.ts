import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini' });

export async function POST(request: NextRequest) {
  try {
    const { syllabus, days, learningStyle, classStandard, subject } = await request.json();

    if (!syllabus || !days || !learningStyle || !classStandard || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `
You are an expert AI tutor. Create a comprehensive study plan:

**STUDENT PROFILE:**
- Education Level: ${classStandard}
- Subject: ${subject}
- Learning Style: ${learningStyle}
- Available Time: ${days} days

**STUDY MATERIALS:**
${syllabus.slice(0, 2000)}

**CREATE:**
1. Day-by-day breakdown for ${days} days
2. ${learningStyle}-specific techniques
3. Clear learning objectives for each day
4. Self-assessment questions
5. Progress checkpoints
6. Weekly review sessions

Format with clear headings and bullet points. Make it actionable for ${classStandard} students.
`;

    const result = await model.generateContent(prompt);
    const plan = result.response.text();

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
