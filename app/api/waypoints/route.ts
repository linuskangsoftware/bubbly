import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"

// /api/waypoints → all waypoints (ordered by createdAt DESC)
// /api/waypoints?userId=linuskang → all waypoints by specific user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const waypoints = await prisma.bubbler.findMany(
      {
        where: userId ? { addedByUserId: userId } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          addedBy: {
            select: { id: true, image: true, displayName: true, handle: true },
          },
          favorites: true,
          reviews: true,
        },
      }
    )
    return NextResponse.json(waypoints)
  } catch (error) {
    console.error("[WAYPOINTS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch waypoints" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      name,
      latitude,
      longitude,
      description,
      amenities = [],
      image,
      maintainer,
      addedByUserId: overrideUserId,
    } = body;

    const authHeader = req.headers.get("Authorization");
    const apiTokenValid = authHeader === `Bearer ${process.env.BUBBLY_API_TOKEN}`;
    const userId =
      overrideUserId ??
      session?.user?.id ??
      (apiTokenValid ? overrideUserId : null);

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in or provide an API token." },
        { status: 401 }
      );
    }

    const newBubbler = await prisma.bubbler.create({
      data: {
        name,
        latitude,
        longitude,
        description,
        amenities,
        image,
        maintainer,
        addedByUserId: userId,
      },
    });

    return NextResponse.json(newBubbler, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error occured." },
      { status: 500 }
    );
  }
}