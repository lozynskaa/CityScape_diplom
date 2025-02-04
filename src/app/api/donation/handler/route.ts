import { NextResponse, type NextRequest } from "next/server";
import { api } from "~/trpc/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.redirect(
      "http://localhost:3000/donation/failure?message=Session ID not found",
    );
  }

  const session_id_string = session_id.toString();

  try {
    const session = await api.donation.getSession({
      id: session_id_string,
    });

    if (!session || !session.metadata) {
      return NextResponse.redirect(
        "http://localhost:3000/donation/failure?message=Session not found",
      );
    }

    if (session.payment_status === "paid") {
      return NextResponse.redirect(
        `http://localhost:3000/donation/success?eventId=${session.metadata.eventId}`,
      );
    } else {
      return NextResponse.redirect(
        `http://localhost:3000/donation/failure?eventId=${session.metadata.eventId}`,
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching session:", error.message);
    }
    return NextResponse.redirect(
      "http://localhost:3000/donation/error?message=Failed to retrieve session",
    );
  }
}
