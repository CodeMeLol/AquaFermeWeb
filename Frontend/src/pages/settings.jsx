import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sun, Moon, Monitor, Globe, User, Check, Shield,
  LogOut, Palette, Info, Pencil, X, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Section({ title, description, icon: Icon, children }) {
  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-wide">{title}</CardTitle>
            {description && <CardDescription className="font-mono text-xs mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

function ThemeButton({ value, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-2.5 py-5 rounded-xl border-2 transition-all duration-200 font-mono text-xs font-semibold",
        active
          ? "border-primary text-primary bg-primary/10 shadow-sm shadow-primary/20"
          : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <Icon className="w-6 h-6" />
      {label}
      {active && (
        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </span>
      )}
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { profile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name ?? "", role: profile?.role ?? "" });
  const [saved, setSaved] = useState(false);

  function handleSaveProfile(e) {
    e.preventDefault();
    updateProfile({ name: form.name, role: form.role });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const THEMES = [
    { value: "light",  label: "Clair",   icon: Sun },
    { value: "dark",   label: "Sombre",  icon: Moon },
    { value: "system", label: "Système", icon: Monitor },
  ];

  const LANGUAGES = [
    { value: "fr", label: "🇫🇷  Français" },
    { value: "en", label: "🇬🇧  English" },
  ];

  const roleLabel = user?.role === "admin" ? "Administrateur" : user?.role === "manager" ? "Gestionnaire" : "Utilisateur";
  const initials = (profile?.name || user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl pb-10">
      <div>
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Configuration</p>
        <h1 className="text-2xl font-black tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Personnalisez votre expérience et gérez votre compte</p>
      </div>

      {/* Profil */}
      <Section title="Profil Utilisateur" description="Votre identité dans l'application" icon={User}>
        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom complet</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom affiché" className="rounded-xl" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poste / Rôle affiché</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex. Responsable de ferme" className="rounded-xl" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" className="gap-2 rounded-xl"><Save className="w-4 h-4" /> Enregistrer</Button>
              <Button type="button" variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => setEditing(false)}><X className="w-4 h-4" /> Annuler</Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-black text-xl shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{profile?.name || user?.username || "—"}</p>
              <p className="text-sm text-muted-foreground truncate">{profile?.role || roleLabel}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" />{roleLabel}
                </span>
                <span className="text-xs text-muted-foreground font-mono">@{user?.username}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl shrink-0"
              onClick={() => { setForm({ name: profile?.name ?? "", role: profile?.role ?? "" }); setEditing(true); }}>
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </Button>
          </div>
        )}
        {saved && <div className="mt-3 flex items-center gap-2 text-primary text-sm font-semibold"><Check className="w-4 h-4" /> Profil mis à jour</div>}
      </Section>

      <Separator className="border-border/40" />

      {/* Thème */}
      <Section title="Apparence" description="Choisissez le thème de l'interface" icon={Palette}>
        <div className="space-y-4">
          <div className="flex gap-3">
            {THEMES.map((t) => (
              <ThemeButton key={t.value} {...t} active={theme === t.value} onClick={() => setTheme(t.value)} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {theme === "system" ? "Suit automatiquement les préférences de votre OS." : theme === "dark" ? "Interface sombre activée." : "Interface claire activée."}
          </p>
        </div>
      </Section>

      <Separator className="border-border/40" />

      {/* Langue */}
      <Section title="Langue" description="Langue de l'interface" icon={Globe}>
        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map((lang) => {
            const active = language === lang.value;
            return (
              <button key={lang.value} onClick={() => setLanguage(lang.value)}
                className={cn(
                  "px-5 py-3 rounded-xl border-2 transition-all text-sm font-semibold flex items-center gap-2",
                  active ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                )}>
                {lang.label}
                {active && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-3">La traduction anglaise est en cours de développement.</p>
      </Section>

      <Separator className="border-border/40" />

      {/* À propos */}
      <Section title="À propos de l'application" description="Informations système" icon={Info}>
        <div className="divide-y divide-border/50">
          {[
            { label: "Application",   value: "Divine Alimentation Web" },
            { label: "Version",       value: "1.0.0" },
            { label: "Technologie",   value: "React + Node.js + PostgreSQL" },
            { label: "Développé par", value: "Équipe Édjofêh — 2026" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold font-mono">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Separator className="border-border/40" />

      {/* Déconnexion */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
        <div>
          <p className="font-semibold text-sm text-destructive">Déconnexion</p>
          <p className="text-xs text-muted-foreground mt-0.5">Vous serez redirigé vers la page de connexion</p>
        </div>
        <Button variant="destructive" size="sm" className="gap-2 rounded-xl" onClick={logout}>
          <LogOut className="w-4 h-4" /> Se déconnecter
        </Button>
      </div>
    </div>
  );
}
