import { NextResponse } from 'next/server';
import { validatePollInput } from '@/lib/validate';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { CreatePollResponse, ErrorResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json<ErrorResponse>(
        { error: '요청 본문이 비어있거나 유효한 JSON이 아닙니다.' },
        { status: 400 }
      );
    }

    const validation = validatePollInput(body.question, body.options);
    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        { error: validation.error },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: validation.data.question,
        options: validation.data.options,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to create poll:', error);
      return NextResponse.json<ErrorResponse>(
        { error: '투표 생성 중 DB 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json<CreatePollResponse>({ id: data.id }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in POST /api/polls:', err);
    return NextResponse.json<ErrorResponse>(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

