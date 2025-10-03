import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { displayName, handle,  bio, image } = body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(displayName && { displayName }),
        ...(handle && {handle}),
        ...(bio && { bio }),
        ...(image && { image }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
