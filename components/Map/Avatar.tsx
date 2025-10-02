"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/lib/theme"
import { useRouter } from "next/navigation"

export function AvatarManager() {
    const { data: session } = useSession()
    const { setTheme } = useTheme()
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
                <Avatar>
                    <AvatarImage src={session?.user.image ?? undefined} />
                    <AvatarFallback>
                        {session?.user.name?.trim()
                            ? session.user.name
                                .split(" ")
                                .filter(Boolean)
                                .map((word) => word[0].toUpperCase())
                                .slice(0, 2)
                                .join("")
                            : "U"
                        }
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="font-bold cursor-default">{session?.user.displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/profile/${session?.user.handle}`)}>Profile</DropdownMenuItem>
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer">App Theme</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}