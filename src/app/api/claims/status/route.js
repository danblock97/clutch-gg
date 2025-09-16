import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gameName = searchParams.get("gameName");
    const tagLine = searchParams.get("tagLine");
    const region = searchParams.get("region");
    const mode = (searchParams.get("mode") || "").toLowerCase();
    const viewerPuuid = searchParams.get("viewerPuuid") || undefined;

    if (!gameName || !tagLine || !region || !mode) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!["league", "tft"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const { data: account, error: accountErr } = await supabase
      .from("riot_accounts")
      .select("id, puuid")
      .ilike("gamename", gameName)
      .ilike("tagline", tagLine)
      .ilike("region", region)
      .maybeSingle();

    if (accountErr) return NextResponse.json({ error: accountErr.message }, { status: 500 });
    if (!account) return NextResponse.json({ claimed: false }, { status: 200 });

    // With claimed flags on riot_accounts, determine claimed based on mode
    const claimedFlag = mode === "league" ? "claimed_league" : "claimed_tft";
    const { data: accountWithFlags, error: flagErr } = await supabase
      .from("riot_accounts")
      .select(`puuid, ${claimedFlag}`)
      .eq("id", account.id)
      .maybeSingle();

    if (flagErr) return NextResponse.json({ error: flagErr.message }, { status: 500 });

    const isClaimed = !!accountWithFlags?.[claimedFlag];
    const isOwn = viewerPuuid ? accountWithFlags?.puuid === viewerPuuid : undefined;

    return NextResponse.json({ claimed: isClaimed, ownClaim: isClaimed ? isOwn : undefined });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}

