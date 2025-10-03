import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserByUsername } from "@/lib/main";

interface ProfilePageParams {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageParams) {
  const { handle } = await params;
  const user = await getUserByUsername(handle);

  if (!user) {
    return <p>User not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{user.displayName || user.handle}</h1>

            {user.verified && <Badge variant="secondary">Verified</Badge>}
            {user.moderator && <Badge variant="outline">Moderator</Badge>}
          </div>

          <p className="text-muted-foreground">@{user.handle}</p>

          {user.bio && <p className="text-center text-sm text-muted-foreground">{user.bio}</p>}
        </CardHeader>

        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>XP:</strong> {user.xp}</p>
          <p><strong>Created:</strong> {user.createdAt.toLocaleString()}</p>
          <p><strong>Updated:</strong> {user.updatedAt.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
