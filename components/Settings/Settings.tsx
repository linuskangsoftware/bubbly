"use client"

import { useState, useRef, useEffect } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
    Avatar,
    AvatarFallback,
    AvatarImage 
} from "@/components/ui/avatar"

import { Upload, ChevronLeft } from "lucide-react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function Settings() {
    const { data: session } = useSession()

    // template states
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [bio, setBio] = useState("")
    const [avatarUrl, setAvatarUrl] = useState(session?.user.image ?? "")

    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()

    // fill ins
    useEffect(() => {
        if (session?.user) {
            setName(session.user.displayName ?? "")
            setUsername(session.user.handle ?? "")
            setBio(session.user.bio ?? "")
            setAvatarUrl(session.user.image ?? "")
        }
    }, [session])

    // photo upload handlers
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setAvatarUrl(reader.result as string)
        }
        reader.readAsDataURL(file)

        console.log("Selected file:", file)
    }

    return (
        <section className="space-y-6">
            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/")}
            >
                <ChevronLeft className="h-4 w-4" />
                Go Back
            </Button>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <h1 className="text-3xl font-bold">Manage your account</h1>
            <div>
                <h2 className="text-xl font-semibold text-foreground">Profile</h2>
                <p className="text-sm text-muted-foreground">Update your profile information</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl} alt={name} />
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent cursor-pointer"
                        onClick={handleUploadClick}
                    >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        rows={4}
                    />
                </div>

                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    Save Changes
                </Button>
            </div>
        </section>
    )
}
