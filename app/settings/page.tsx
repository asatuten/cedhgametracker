import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateProfile } from "./actions";

const SettingsPage = async () => {
  const userId = await getActiveUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, theme, and data backups.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update the name used on dashboards and exports.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" name="name" defaultValue={user?.name ?? "Guest"} placeholder="Your name" />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Use the sun/moon icon to toggle dark mode. Preference syncs per browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>The app defaults to a high-contrast dark theme tailored for mobile entry. Toggle the header icon to switch modes.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data backup</CardTitle>
          <CardDescription>Export CSV snapshots or import from spreadsheets.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Link href="/import-export" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Go to import / export
          </Link>
          <p className="text-sm text-muted-foreground">
            CSV exports include players, decks, and games so you can archive results or share with teammates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
