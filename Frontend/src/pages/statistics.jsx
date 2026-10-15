import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Fish,
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Loader2,
} from "lucide-react";

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444"];

export default function StatisticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/statistics"],
    queryFn: () => apiRequest("GET", "/statistics"),
  });

  const { data: ponds = [], isLoading: pondsLoading } = useQuery({
    queryKey: ["/ponds"],
    queryFn: () => apiRequest("GET", "/ponds"),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/tasks"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/tasks");
      return data.tasks || [];
    },
  });

  const isLoading = statsLoading || pondsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalFish = Number(stats?.ponds?.total_fish || 0);
  const totalCapacity = Number(stats?.ponds?.total_capacity || 0);
  const totalPonds = Number(stats?.ponds?.total_ponds || 0);

  const pendingTasks = Number(stats?.tasks?.pending_tasks || 0);
  const completedTasks = Number(stats?.tasks?.completed_tasks || 0);

  const totalStock = Number(stats?.stock?.total_stock || 0);

  const globalOccupancy =
    totalCapacity > 0 ? Math.round((totalFish / totalCapacity) * 100) : 0;

  const nonBarrage = ponds.filter((p) => p.name !== "Barrage");

  const saturated = nonBarrage.filter((p) => {
    const fish = Number(p.current_fish_count || 0);
    const capacity = Number(p.max_capacity || 1);
    return fish / capacity >= 0.9;
  }).length;

  const pondByGroup = ["A", "B", "C", "D"].map((g) => {
    const groupPonds = ponds.filter((p) => p.pond_group === g);

    const fish = groupPonds.reduce(
      (s, p) => s + Number(p.current_fish_count || 0),
      0
    );

    const capacity = groupPonds.reduce(
      (s, p) => s + Number(p.max_capacity || 0),
      0
    );

    return {
      name: `Groupe ${g}`,
      fish,
      capacity,
    };
  });

  const taskByStatus = [
    { name: "En attente", value: pendingTasks },
    { name: "Terminé", value: completedTasks },
  ].filter((s) => s.value > 0);

  const overdueTasks = tasks.filter((t) => {
    return t.status !== "completed" && new Date(t.task_date) < new Date();
  }).length;

  const orderStatusData = [
    { name: "En attente", fish: 0, supply: 0 },
    { name: "Commandé", fish: 0, supply: 0 },
    { name: "Reçu", fish: 0, supply: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="term-label text-primary mb-1">DIRECTION GÉNÉRALE</p>
        <h1 className="text-2xl font-display font-extrabold tracking-tight">
          Statistiques & Rapports
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Vue consolidée de la production et des activités
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          icon={Fish}
          label="Poissons en stock"
          value={totalFish.toLocaleString("fr-FR")}
          sub={`sur ${totalCapacity.toLocaleString("fr-FR")} max`}
        />

        <KPI
          icon={TrendingUp}
          label="Taux d'occupation"
          value={`${globalOccupancy}%`}
          sub={`${saturated} étang(s) saturé(s)`}
          color={globalOccupancy > 80 ? "text-destructive" : "text-primary"}
        />

        <KPI
          icon={ClipboardList}
          label="Tâches en attente"
          value={pendingTasks}
          sub={overdueTasks > 0 ? `⚠ ${overdueTasks} en retard` : "Aucun retard"}
          color={overdueTasks > 0 ? "text-yellow-400" : "text-primary"}
        />

        <KPI
          icon={ShoppingCart}
          label="Stock nourriture"
          value={`${totalStock.toLocaleString("fr-FR")} kg`}
          sub={`${totalPonds} étang(s) suivis`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="font-display text-sm font-bold tracking-wide">
              Occupation par Groupe d'Étangs
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={pondByGroup}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="fish"
                  name="Poissons actuels"
                  fill="#10b981"
                  maxBarSize={32}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="capacity"
                  name="Capacité max"
                  fill="#d1d5db"
                  maxBarSize={32}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="font-display text-sm font-bold tracking-wide">
              État des Tâches
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 flex items-center justify-center">
            {taskByStatus.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="font-mono text-xs">Aucune tâche</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={taskByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {taskByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="font-display text-sm font-bold tracking-wide">
              Suivi des Commandes
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={orderStatusData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="fish"
                  name="Poissons"
                  fill="#10b981"
                  maxBarSize={24}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="supply"
                  name="Produits"
                  fill="#0ea5e9"
                  maxBarSize={24}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="font-display text-sm font-bold tracking-wide">
              Résumé Financier
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {[
              { label: "Commandes poissons (reçues)", value: 0, color: "text-primary" },
              { label: "Commandes poissons (en attente)", value: 0, color: "text-yellow-400" },
              { label: "Commandes produits (reçues)", value: 0, color: "text-secondary" },
              { label: "Commandes produits (en attente)", value: 0, color: "text-yellow-400" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <p className="font-mono text-xs text-muted-foreground">
                  {row.label}
                </p>
                <p className={`font-display font-bold text-sm ${row.color}`}>
                  {row.value.toLocaleString("fr-FR")}{" "}
                  <span className="text-[10px] font-mono font-normal text-muted-foreground">
                    FCFA
                  </span>
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <p className="font-mono text-xs font-bold text-foreground">
                TOTAL GÉNÉRAL
              </p>
              <p className="font-display font-extrabold text-base text-primary">
                0{" "}
                <span className="text-[10px] font-mono font-normal">FCFA</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="term-label mb-2">{label}</p>
            <p className={`text-3xl font-display font-extrabold ${color}`}>
              {value}
            </p>
            {sub && (
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {sub}
              </p>
            )}
          </div>

          <div className="p-2 border border-primary/20 bg-primary/5">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}