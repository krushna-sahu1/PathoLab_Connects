import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { collectionService } from '@/services/collection.service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const result = await collectionService.getCollections({
      status: searchParams.get('status') ?? undefined,
      agentId: searchParams.get('agentId') ?? undefined,
      zoneId: searchParams.get('zoneId') ?? undefined,
      date: searchParams.get('date') ?? undefined,
      patientId: searchParams.get('patientId') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1', 10),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
