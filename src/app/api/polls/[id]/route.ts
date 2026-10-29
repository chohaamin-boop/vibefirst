import { NextResponse } from 'next/server';
import { isValidUuid } from '@/lib/validate';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { PollDetail, ErrorResponse } from '@/lib/types';

export async function GET(
  _request: Request,
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

    const supabase = getSupabaseServerClient();

    // 1. 투표 기본 정보 조회
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, question, options')
      .eq('id', id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json<ErrorResponse>(
        { error: '존재하지 않는 투표입니다.' },
        { status: 404 }
      );
    }

    // 2. 투표 득표 내역 조회
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('option_index')
      .eq('poll_id', id);

    if (votesError) {
      console.error('Failed to fetch votes:', votesError);
      return NextResponse.json<ErrorResponse>(
        { error: '투표 결과 조회 중 DB 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const counts = [0, 0, 0];
    const votesList = votes || [];
    for (const vote of votesList) {
      if (typeof vote.option_index === 'number' && vote.option_index >= 0 && vote.option_index < 3) {
        counts[vote.option_index]++;
      }
    }

    const pollDetail: PollDetail = {
      id: poll.id,
      question: poll.question,
      options: poll.options as string[],
      counts,
      totalVotes: votesList.length,
    };

    return NextResponse.json<PollDetail>(pollDetail, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in GET /api/polls/[id]:', err);
    return NextResponse.json<ErrorResponse>(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

