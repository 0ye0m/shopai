import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language required' },
        { status: 400 }
      );
    }

    const prompt = `Translate the following text to ${targetLanguage}. Preserve any HTML tags, product names, and formatting. Only return the translated text, nothing else.

Text to translate:
${text}`;

    const translatedText = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3 }
    );

    return NextResponse.json({
      originalText: text,
      translatedText: translatedText || text,
      targetLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate' },
      { status: 500 }
    );
  }
}

// Supported languages
export async function GET() {
  return NextResponse.json({
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ru', name: 'Russian' },
    ]
  });
}
