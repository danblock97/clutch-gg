import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const { data, error } = await supabase
			.from("banners")
			.select("*")
			.eq("is_active", true)
			.order("created_at", { ascending: false });

		if (error) throw error;

		// Get the most recent active banner of each type
		const outageMessage = data?.find((b) => b.type === "outage")?.message || "";
		const featureMessage = data?.find((b) => b.type === "feature")?.message || "";

		return NextResponse.json({
			outageMessage,
			featureMessage,
		});
	} catch (error) {
		console.error("Error fetching banners:", error);
		// Return empty banners on error to gracefully degrade
		return NextResponse.json(
			{ outageMessage: "", featureMessage: "" },
			{ status: 200 }
		);
	}
}

