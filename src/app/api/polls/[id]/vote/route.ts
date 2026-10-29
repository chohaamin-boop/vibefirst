import { NextResponse } from 'next/server';
import { isValidUuid, validateVoteInput } from '@/lib/validate';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { VoteResponse, ErrorResponse } from '@/lib/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;

    if (!id || !isValidUuid(id)) {
      return NextResponse.json<ErrorResponse>(
        { error: '존재하지 않는 투표입니다.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json<ErrorResponse>(
        { error: '요청 본문이 비어있거나 유효한 JSON이 아닙니다.' },
        { status: 400 }
      );
    }

    const validation = validateVoteInput(body.optionIndex);
    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        { error: validation.error },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. 투표 존재 여부 확인
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id')
      .eq('id', id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json<ErrorResponse>(
        { error: '존재하지 않는 투표입니다.' },
        { status: 404 }
      );
    }

    // 2. 투표 제출 (votes 행 추가)
    const { error: insertError } = await supabase.from('votes').insert({
      poll_id: id,
      option_index: validation.data.optionIndex,
    });

    if (insertError) {
      console.error('Failed to submit vote:', insertError);
      return NextResponse.json<ErrorResponse>(
        { error: '투표 제출 중 DB 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json<VoteResponse>({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in POST /api/polls/[id]/vote:', err);
    return NextResponse.json<ErrorResponse>(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

