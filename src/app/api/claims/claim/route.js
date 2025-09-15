import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { gameName, tagLine, region, mode, ownerPuuid } = body || {};

    if (!gameName || !tagLine || !region || !mode || !ownerPuuid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalized = {
      gameName: String(gameName).trim(),
      tagLine: String(tagLine).trim(),
      region: String(region).toLowerCase(),
      mode: String(mode).toLowerCase(),
      ownerPuuid: String(ownerPuuid).trim(),
    };

    if (!["league", "tft"].includes(normalized.mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    // Resolve riot_account by name/tag/region
    const { data: account, error: accountErr } = await supabase
      .from("riot_accounts")
      .select("id, puuid, gamename, tagline, region")
      .eq("gamename", normalized.gameName)
      .eq("tagline", normalized.tagLine)
      .eq("region", normalized.region)
      .maybeSingle();

    if (accountErr) {
      return NextResponse.json({ error: accountErr.message }, { status: 500 });
    }
    if (!account) {
      return NextResponse.json({ error: "Riot account not found" }, { status: 404 });
    }

    // Verify ownerPuuid matches account's puuid
    if (account.puuid !== normalized.ownerPuuid) {
      return NextResponse.json({ error: "Forbidden: PUUID does not match account" }, { status: 403 });
    }

    // Insert claim (idempotent on riot_account_id + mode)
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("profile_claims")
      .insert({ riot_account_id: account.id, owner_puuid: normalized.ownerPuuid, mode: normalized.mode })
      .select("id, riot_account_id, owner_puuid, mode, created_at")
      .single();

    // If unique violation, fetch existing
    if (claimErr && (claimErr.code === "23505" || String(claimErr.message || "").toLowerCase().includes("duplicate"))) {
      const { data: existing, error: fetchErr } = await supabase
        .from("profile_claims")
        .select("id, riot_account_id, owner_puuid, mode, created_at")
        .eq("riot_account_id", account.id)
        .eq("mode", normalized.mode)
        .maybeSingle();
      if (fetchErr) {
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }
      return NextResponse.json({ claimed: true, claim: existing }, { status: 200 });
    }

    if (claimErr) {
      return NextResponse.json({ error: claimErr.message || "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ claimed: true, claim }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}
