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
      .eq("gamename", gameName)
      .eq("tagline", tagLine)
      .eq("region", region.toLowerCase())
      .maybeSingle();

    if (accountErr) return NextResponse.json({ error: accountErr.message }, { status: 500 });
    if (!account) return NextResponse.json({ claimed: false }, { status: 200 });

    const { data: claim, error: claimErr } = await supabase
      .from("profile_claims")
      .select("owner_puuid, mode")
      .eq("riot_account_id", account.id)
      .eq("mode", mode)
      .maybeSingle();

    if (claimErr) return NextResponse.json({ error: claimErr.message }, { status: 500 });

    if (!claim) return NextResponse.json({ claimed: false }, { status: 200 });

    return NextResponse.json({
      claimed: true,
      ownClaim: viewerPuuid ? claim.owner_puuid === viewerPuuid : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}

