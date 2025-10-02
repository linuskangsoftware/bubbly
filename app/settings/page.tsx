import { Settings } from "@/components/Settings/Settings"

export const metadata = {
  title: "Settings | Bubbly Maps",
  description: "Explore, and contribute to water bubblers around the world with our interactive map.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        <Settings />
      </div>
    </div>
  )
}