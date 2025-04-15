import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// For server-side operations (API routes)
export const supabaseAdmin = createClient(
	supabaseUrl,
	process.env.SUPABASE_SERVICE_KEY || supabaseKey, // Use service role key if available (server-side only)
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

// For client-side operations
export const supabase = createClient(supabaseUrl, supabaseKey);
