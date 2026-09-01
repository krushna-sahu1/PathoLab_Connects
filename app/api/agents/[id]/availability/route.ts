import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { agentService } from '@/services/agent.service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
    const isAvailable = await agentService.isAgentAvailableForDate(id, date);
    return NextResponse.json({ agentId: id, date, isAvailable });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
