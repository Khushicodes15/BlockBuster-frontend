import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background">
      <div className="w-14 h-14 rounded-2xl bg-olive-50 text-accent-olive flex items-center justify-center">
        <Compass className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-sm text-text-muted max-w-md">
        This view doesn&apos;t exist in the BTMC console.
      </p>
      <Button asChild>
        <Link href="/dashboard/overview">Back to Overview</Link>
      </Button>
    </div>
  );
}
