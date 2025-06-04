import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 10; // seconds
const MAX_REQUESTS = 10; // requests per window

// Valid API keys (you should store these in environment variables)
const VALID_API_KEYS = new Set([
  process.env.NEXT_PUBLIC_UPDATE_API_KEY,
  process.env.INTERNAL_API_KEY,
]);

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.clutchgg.lol',
  'http://localhost:3000',
];

// Rate limiting using Supabase
async function checkRateLimit(ip) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW * 1000);

  // Get count of requests in the current window
  const { data: requests, error } = await supabase
    .from('rate_limits')
    .select('count')
    .eq('ip', ip)
    .gte('created_at', windowStart.toISOString())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Rate limit check error:', error);
    return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: now.getTime() + RATE_LIMIT_WINDOW * 1000 };
  }

  const count = requests?.count || 0;

  if (count >= MAX_REQUESTS) {
    return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: now.getTime() + RATE_LIMIT_WINDOW * 1000 };
  }

  // Increment the counter
  const { error: upsertError } = await supabase
    .from('rate_limits')
    .upsert({
      ip,
      count: count + 1,
      created_at: now.toISOString()
    });

  if (upsertError) {
    console.error('Rate limit update error:', upsertError);
    return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: now.getTime() + RATE_LIMIT_WINDOW * 1000 };
  }

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - (count + 1),
    reset: now.getTime() + RATE_LIMIT_WINDOW * 1000
  };
}

export async function securityMiddleware(req) {
  try {
    // 1. CORS Protection
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized origin' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(ip);
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          limit,
          reset,
          remaining,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // 3. API Key Validation for POST/PUT/DELETE requests
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const apiKey = req.headers.get('x-api-key');
      if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Input Validation for GET requests
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const gameName = searchParams.get('gameName');
      const tagLine = searchParams.get('tagLine');
      const region = searchParams.get('region');

      // Validate gameName and tagLine if present
      // Riot usernames can contain letters (including international), numbers, spaces, and some special characters
      if (gameName && !/^[\p{L}\p{N}\s\-_\.]{3,16}$/u.test(gameName.trim())) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid gameName format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Tagline can be 3-5 characters, letters and numbers only
      if (tagLine && !/^[a-zA-Z0-9]{3,5}$/.test(tagLine)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid tagLine format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate region if present
      if (region && !/^[a-z]{2,4}[0-9]$/i.test(region)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid region format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 