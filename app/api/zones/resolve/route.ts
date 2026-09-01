import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { zoneService } from '@/services/zone.service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/zones/resolve
 * Body: { pincode?, sector?, area? }
 * Returns the matching zone or { zone: null } if no match (ops queue)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const zone = await zoneService.resolveZoneForAddress({
      pincode: body.pincode,
      sector: body.sector,
      area: body.area,
    });
    return NextResponse.json({ zone });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
