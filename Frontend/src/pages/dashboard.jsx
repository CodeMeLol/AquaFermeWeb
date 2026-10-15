import { usePonds } from "@/hooks/use-ponds";
import { useTasks } from "@/hooks/use-tasks";
import { useFeedStock } from "@/hooks/use-feed-stock";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  Fish,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Download,
  Package,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const { data: ponds = [], isLoading: loadingPonds } = usePonds();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: stock = [], isLoading: loadingStock } = useFeedStock();

  function exportToExcel() {
    const wb = XLSX.utils.book_new();

    const pondsData = ponds.map((p) => ({
      Nom: p.name,
      Groupe: p.pond_group ?? "",
      "Surface (m²)": p.area_m2,
      "Capacité max": p.max_capacity,
      "Poissons actuels": p.current_fish_count,
      "Taux occupation (%)": Math.round(
        (Number(p.current_fish_count || 0) / Number(p.max_capacity || 1)) * 100
      ),
    }));

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(pondsData),
      "Étangs"
    );

    const tasksData = tasks.map((t) => ({
      Titre: t.title,
      Description: t.description ?? "",
      Date: t.task_date ? new Date(t.task_date).toLocaleDateString("fr-FR") : "",
      Priorité: t.priority ?? "",
      Statut: t.status === "completed" ? "Terminée" : "En attente",
    }));

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(tasksData),
      "Tâches"
    );

    const stockData = stock.map((s) => ({
      Produit: s.product_name,
      "Quantité (kg)": s.quantity_kg,
      "Seuil alerte (kg)": s.alert_threshold_kg,
    }));

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(stockData),
      "Stock aliments"
    );

    XLSX.writeFile(
      wb,
      `aquafeme-dashboard-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }

  const totalFish = ponds.reduce(
    (acc, pond) => acc + Number(pond.current_fish_count || 0),
    0
  );

  const maxCapacity =
    ponds.reduce((acc, pond) => acc + Number(pond.max_capacity || 0), 0) || 1;

  const globalOccupancy = Math.round((totalFish / maxCapacity) * 100);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const highOccupancyPonds = ponds.filter(
    (p) =>
      Number(p.current_fish_count || 0) / Number(p.max_capacity || 1) > 0.9
  );

  const totalStock = stock.reduce(
    (sum, item) => sum + Number(item.quantity_kg || 0),
    0
  );

  const lowStock = stock.filter(
    (item) => Number(item.quantity_kg || 0) <= Number(item.alert_threshold_kg || 0)
  );

  const chartData =
    ponds
      .filter((p) => p.pond_group !== "Barrage")
      .map((p) => {
        const occupancy = Math.round(
          (Number(p.current_fish_count || 0) / Number(p.max_capacity || 1)) *
            100
        );

        return {
          name: p.name,
          "Poissons actuels": Number(p.current_fish_count || 0),
          "Capacité max": Number(p.max_capacity || 0),
          occupancy,
        };
      }) || [];

  const totalAlerts =
    highOccupancyPonds.length + pendingTasks.length + lowStock.length;

  if (loadingPonds || loadingTasks || loadingStock) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Vue d'ensemble</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>

        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Vue d'ensemble
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Indicateurs clés de performance et alertes.
          </p>
        </div>

        <Button
          onClick={exportToExcel}
          variant="outline"
          className="rounded-xl gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          Exporter Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Population totale"
          value={totalFish.toLocaleString("fr-FR")}
          subtitle="Poissons enregistrés"
          icon={Fish}
          color="bg-primary/10 text-primary"
        />

        <DashboardCard
          title="Occupation globale"
          value={`${globalOccupancy}%`}
          subtitle={`${ponds.length} étang(s)`}
          icon={Droplet}
          color="bg-secondary/10 text-secondary"
          progress={globalOccupancy}
          danger={globalOccupancy > 90}
        />

        <DashboardCard
          title="Tâches"
          value={pendingTasks.length}
          subtitle={`${completedTasks.length} terminée(s)`}
          icon={CalendarDays}
          color="bg-orange-50 text-orange-700"
        />

        <DashboardCard
          title="Stock nourriture"
          value={`${totalStock.toLocaleString("fr-FR")} kg`}
          subtitle={`${lowStock.length} stock faible`}
          icon={Package}
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      <Card className="rounded-2xl shadow-md border-border/50">
        <CardHeader>
          <CardTitle>Taux d'occupation par Étang</CardTitle>
          <CardDescription>
            Poissons actuels vs capacité maximale — tous les étangs hors
            Barrage
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-[380px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                barCategoryGap="20%"
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  width={55}
                  tickFormatter={(v) => v.toLocaleString("fr-FR")}
                />

                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString("fr-FR")} poissons`,
                    name,
                  ]}
                />

                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  iconType="square"
                  iconSize={10}
                />

                <Bar
                  dataKey="Poissons actuels"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.occupancy >= 90
                          ? "hsl(var(--destructive))"
                          : entry.occupancy >= 70
                          ? "hsl(40 90% 50%)"
                          : "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>

                <Bar
                  dataKey="Capacité max"
                  fill="hsl(var(--muted-foreground) / 0.25)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-primary" />
              Normal (&lt;70%)
            </span>

            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: "hsl(40 90% 50%)" }}
              />
              Élevé (70–90%)
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block bg-destructive" />
              Saturé (&gt;90%)
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-md border-border/50">
          <CardHeader>
            <CardTitle>Tâches prioritaires</CardTitle>
          </CardHeader>

          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucune tâche en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <h4 className="font-semibold text-sm">{task.title}</h4>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {task.description || "Aucune description"}
                    </p>

                    <div className="text-[10px] font-medium text-primary mt-2 bg-primary/10 inline-block px-2 py-0.5 rounded">
                      {task.task_date
                        ? new Date(task.task_date).toLocaleDateString("fr-FR")
                        : "Date non définie"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-border/50">
          <CardHeader>
            <CardTitle>Alertes rapides</CardTitle>
          </CardHeader>

          <CardContent>
            {totalAlerts === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highOccupancyPonds.map((pond) => (
                  <AlertItem
                    key={`pond-${pond.id}`}
                    title={`Étang ${pond.name} saturé`}
                    text={`${pond.current_fish_count} / ${pond.max_capacity} poissons`}
                  />
                ))}

                {lowStock.map((item) => (
                  <AlertItem
                    key={`stock-${item.id}`}
                    title={`Stock faible : ${item.product_name}`}
                    text={`${item.quantity_kg} kg restant(s)`}
                  />
                ))}

                {pendingTasks.slice(0, 3).map((task) => (
                  <AlertItem
                    key={`task-${task.id}`}
                    title={`Tâche en attente : ${task.title}`}
                    text={
                      task.task_date
                        ? new Date(task.task_date).toLocaleDateString("fr-FR")
                        : "Date non définie"
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  progress,
  danger,
}) {
  return (
    <Card className="rounded-2xl border-none shadow-md shadow-black/5 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={`text-3xl font-bold font-display ${
            danger ? "text-destructive" : ""
          }`}
        >
          {value}
        </div>

        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3 text-secondary" />
          {subtitle}
        </p>

        {progress !== undefined && (
          <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                danger ? "bg-destructive" : "bg-secondary"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertItem({ title, text }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-red-100 bg-red-50 text-red-700">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs mt-0.5">{text}</p>
      </div>
    </div>
  );
}