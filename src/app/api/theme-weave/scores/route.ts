import { NextResponse } from "next/server";

/**
 * Deliberately closed until completion is verified from a server-owned game
 * session. The former endpoint accepted an arbitrary `completed: true` POST.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Theme Weave score submission is unavailable until verified sessions are implemented.",
    },
    { status: 410 },
  );
}
