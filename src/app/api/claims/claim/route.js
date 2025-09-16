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
      .ilike("gamename", normalized.gameName)
      .ilike("tagline", normalized.tagLine)
      .ilike("region", normalized.region)
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

    // Update claimed flag on riot_accounts
    const flagColumn = normalized.mode === "league" ? "claimed_league" : "claimed_tft";
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("riot_accounts")
      .update({ [flagColumn]: true })
      .eq("id", account.id)
      .select("id, puuid, gamename, tagline, region, claimed_league, claimed_tft")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message || "Update failed" }, { status: 500 });
    }

    return NextResponse.json({
      claimed: true,
      account: updated,
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}
