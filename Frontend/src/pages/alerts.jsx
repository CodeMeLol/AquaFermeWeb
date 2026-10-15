import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Droplet,
  ClipboardList,
  Package,
} from "lucide-react";

const SEVERITY_STYLE = {
  critical: {
    bar: "bg-destructive",
    badge: "text-destructive border-destructive/30 bg-destructive/8",
    icon: AlertCircle,
  },
  warning: {
    bar: "bg-yellow-400",
    badge: "text-yellow-500 border-yellow-400/30 bg-yellow-400/8",
    icon: AlertTriangle,
  },
  info: {
    bar: "bg-primary",
    badge: "text-primary border-primary/30 bg-primary/8",
    icon: Info,
  },
};

export default function AlertsPage() {
  const { data: ponds = [], isLoading: p } = useQuery({
    queryKey: ["/ponds"],
    queryFn: () => apiRequest("GET", "/ponds"),
  });

  const { data: tasks = [], isLoading: t } = useQuery({
    queryKey: ["/tasks"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/tasks");
      return data.tasks || [];
    },
  });

  const { data: water = [], isLoading: w } = useQuery({
    queryKey: ["/water-quality"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/water-quality");
      return data.measurements || [];
    },
  });

  const { data: stock = [], isLoading: s } = useQuery({
    queryKey: ["/feed-stock"],
    queryFn: () => apiRequest("GET", "/feed-stock"),
  });

  const isLoading = p || t || w || s;
  const alerts = [];
  const now = new Date();

  ponds
    .filter((pond) => pond.name !== "Barrage")
    .forEach((pond) => {
      const currentFish = Number(pond.current_fish_count || 0);
      const capacity = Number(pond.max_capacity || 1);
      const occ = currentFish / capacity;

      if (occ >= 0.95) {
        alerts.push({
          id: `pond-critical-${pond.id}`,
          severity: "critical",
          type: "Étang",
          title: `Étang ${pond.name} — Surcharge critique`,
          description: `${currentFish.toLocaleString("fr-FR")} / ${capacity.toLocaleString(
            "fr-FR"
          )} poissons (${Math.round(occ * 100)}%). Risque élevé.`,
          icon: Droplet,
        });
      } else if (occ >= 0.8) {
        alerts.push({
          id: `pond-warn-${pond.id}`,
          severity: "warning",
          type: "Étang",
          title: `Étang ${pond.name} — Occupation élevée`,
          description: `${currentFish.toLocaleString("fr-FR")} / ${capacity.toLocaleString(
            "fr-FR"
          )} poissons (${Math.round(occ * 100)}%). À surveiller.`,
          icon: Droplet,
        });
      } else if (currentFish === 0) {
        alerts.push({
          id: `pond-empty-${pond.id}`,
          severity: "info",
          type: "Étang",
          title: `Étang ${pond.name} — Vide`,
          description: "Aucun poisson recensé. Prêt pour un empoissonnement.",
          icon: Droplet,
        });
      }
    });

  tasks
    .filter((task) => task.status !== "completed" && task.task_date)
    .forEach((task) => {
      const taskDate = new Date(task.task_date);

      if (taskDate < now) {
        const daysLate = Math.floor(
          (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        alerts.push({
          id: `task-overdue-${task.id}`,
          severity: daysLate > 7 ? "critical" : "warning",
          type: "Tâche",
          title: `Tâche en retard — ${task.title}`,
          description: `Prévue le ${taskDate.toLocaleDateString(
            "fr-FR"
          )} · Retard de ${daysLate} jour(s).`,
          icon: ClipboardList,
        });
      }
    });

  stock.forEach((item) => {
    const quantity = Number(item.quantity_kg || 0);
    const threshold = Number(item.alert_threshold_kg || 0);

    if (quantity <= threshold) {
      alerts.push({
        id: `stock-${item.id}`,
        severity: "warning",
        type: "Stock",
        title: `Stock faible — ${item.product_name}`,
        description: `${quantity.toLocaleString("fr-FR")} kg restant(s). Seuil minimum : ${threshold.toLocaleString(
          "fr-FR"
        )} kg.`,
        icon: Package,
      });
    }
  });

  water.forEach((m) => {
    const oxygen = Number(m.oxygen_level_mg_l || 0);
    const temperature = Number(m.temperature_c || 0);

    if (oxygen > 0 && oxygen < 5) {
      alerts.push({
        id: `water-oxygen-${m.id}`,
        severity: "critical",
        type: "Eau",
        title: "Oxygène faible",
        description: `Étang ${m.pond_id} : ${oxygen} mg/L. Niveau à surveiller rapidement.`,
        icon: Droplet,
      });
    }

    if (temperature > 30) {
      alerts.push({
        id: `water-temp-${m.id}`,
        severity: "warning",
        type: "Eau",
        title: "Température élevée",
        description: `Étang ${m.pond_id} : ${temperature}°C. Température au-dessus du seuil conseillé.`,
        icon: Droplet,
      });
    }
  });

  if (!isLoading && alerts.length === 0) {
    alerts.push({
      id: "all-good",
      severity: "info",
      type: "Système",
      title: "Aucune alerte active",
      description:
        "Tous les indicateurs sont dans les normes. La ferme fonctionne normalement.",
      icon: CheckCircle2,
    });
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="term-label text-primary mb-1">SURVEILLANCE</p>
        <h1 className="text-2xl font-display font-extrabold tracking-tight">
          Alertes & Surveillance
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {isLoading
            ? "Chargement…"
            : `${alerts.length} alerte(s) active(s) — mise à jour automatique`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["critical", "Critiques"],
          ["warning", "Avertissements"],
          ["info", "Informations"],
        ].map(([sev, label]) => {
          const StyleIcon = SEVERITY_STYLE[sev].icon;

          return (
            <Card key={sev} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <StyleIcon
                  className={`w-5 h-5 ${
                    sev === "critical"
                      ? "text-destructive"
                      : sev === "warning"
                      ? "text-yellow-400"
                      : "text-primary"
                  }`}
                />

                <div>
                  <p className="text-2xl font-display font-extrabold">
                    {counts[sev]}
                  </p>
                  <p className="term-label">{label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="font-display text-sm font-bold tracking-wide">
            Alertes actives
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {alerts.map((alert) => {
                const sStyle = SEVERITY_STYLE[alert.severity];
                const Icon = alert.icon;

                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-5 hover:bg-muted/10 transition-colors"
                  >
                    <div
                      className={`w-0.5 self-stretch rounded-full shrink-0 ${sStyle.bar}`}
                    />

                    <div className={`p-2 shrink-0 border ${sStyle.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-1">
                        <p className="font-mono text-sm font-semibold leading-snug">
                          {alert.title}
                        </p>

                        <span
                          className={`shrink-0 text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${sStyle.badge}`}
                        >
                          {alert.type}
                        </span>
                      </div>

                      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}