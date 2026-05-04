import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { PageShell } from "@/components/PageShell";
import { useAppStore } from "@/lib/store";
import { Camera, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CaloSmart" },
      { name: "description", content: "Manage your CaloSmart profile, daily calorie goal, and theme." },
    ],
  }),
  component: ProfilePage,
});

const THEMES: { id: "green" | "blue" | "pink"; label: string; color: string }[] = [
  { id: "green", label: "Fresh", color: "oklch(0.7 0.15 155)" },
  { id: "blue", label: "Calm", color: "oklch(0.78 0.13 220)" },
  { id: "pink", label: "Bloom", color: "oklch(0.75 0.18 350)" },
];

function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ photo: reader.result as string });
      toast.success("Profile photo updated");
    };
    reader.readAsDataURL(f);
  };

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Personalize your experience.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card-soft p-6 flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="h-28 w-28 rounded-full overflow-hidden grid place-items-center text-4xl shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-bold">{profile.name.slice(0, 1)}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-card border border-border grid place-items-center shadow-md hover:bg-muted"
              aria-label="Upload photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <div className="mt-4 font-semibold text-lg">{profile.name}</div>
          <div className="text-sm text-muted-foreground">{profile.email}</div>
          <div className="mt-4 w-full card-soft p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground">Daily goal</div>
            <div className="text-2xl font-extrabold gradient-text">{profile.goal} kcal</div>
          </div>
        </div>

        <div className="card-soft p-6 lg:col-span-2 space-y-6">
          <div>
            <label className="text-sm font-semibold">Full name</label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Daily calorie goal</label>
            <div className="mt-2 flex items-center gap-4">
              <input
                type="range"
                min={1200}
                max={3500}
                step={50}
                value={profile.goal}
                onChange={(e) => updateProfile({ goal: Number(e.target.value) })}
                className="flex-1 accent-[color:var(--primary)]"
              />
              <div className="w-24 text-right font-semibold">{profile.goal} kcal</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Theme accent</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const active = profile.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateProfile({ theme: t.id })}
                    className={`relative card-soft p-4 hover-lift flex items-center gap-3 ${active ? "ring-2 ring-primary" : ""}`}
                  >
                    <span
                      className="h-8 w-8 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="font-medium">{t.label}</span>
                    {active && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => toast.success("Profile saved")}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white gradient-bg-primary shadow-md hover-lift"
          >
            Save changes
          </button>
        </div>
      </div>
    </PageShell>
  );
}
