import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(NextRequest: Request, { params }: { params: { handle: string } }) {
    const { handle } = params;

    const user = await prisma.user.findUnique({
        where: { handle: handle },
        select: {
            id: true,
            displayName: true,
            handle: true,
            bio: true,
            image: true,
            verified: true,
            moderator: true,
            xp: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
}