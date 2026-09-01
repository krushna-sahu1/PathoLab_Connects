import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { collectionService } from '@/services/collection.service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const collection = await collectionService.getCollectionById(id);
    return NextResponse.json(collection);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Not found' }, { status: 404 });
  }
}
