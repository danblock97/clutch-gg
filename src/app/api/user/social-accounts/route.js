import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  try {
    // Parse the request body
    const { puuid, twitchUsername, twitterUsername } = await req.json();

    if (!puuid) {
      return NextResponse.json(
        { error: "Missing required parameter: puuid" },
        { status: 400 }
      );
    }

    // Verify that the user exists and is claimed
    const { data: user, error: userError } = await supabaseAdmin
      .from("riot_accounts")
      .select("*")
      .eq("puuid", puuid)
      .eq("is_claimed", true)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Error fetching user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found or profile not claimed" },
        { status: 404 }
      );
    }

    // Update the user's social accounts
    const { error: updateError } = await supabaseAdmin
      .from("riot_accounts")
      .update({
        twitch_username: twitchUsername || null,
        twitter_username: twitterUsername || null,
      })
      .eq("puuid", puuid);

    if (updateError) {
      console.error("Error updating social accounts:", updateError);
      return NextResponse.json(
        { error: "Error updating social accounts" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Social accounts updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating social accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}