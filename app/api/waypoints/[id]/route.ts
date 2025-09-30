import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVER_API_TOKEN = process.env.BUBBLY_API_TOKEN;

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
  ) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid waypoint ID" }, { status: 400 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${SERVER_API_TOKEN}`) {
      return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
    }

    const waypoint = await prisma.bubbler.findUnique({ where: { id: numericId } });
    if (!waypoint) {
      return NextResponse.json({ error: "Waypoint not found" }, { status: 404 });
    }

    await prisma.bubbler.delete({ where: { id: numericId } });

    return NextResponse.json({ message: "Waypoint deleted successfully" });
  } catch (error) {
    console.error("[WAYPOINTS_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete waypoint" }, { status: 500 });
  }
}
