import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Server,
  Fish,
  ClipboardList,
  Box,
  AlertTriangle,
  Monitor,
  Code2,
  Cloud,
  Clock,
  Waves,
  Activity,
  Search,
} from "lucide-react";

async function safeGet(url) {
  try {
    return await apiRequest("GET", url);
  } catch {
    return [];
  }
}

function KpiCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <Card className="rounded-3xl border-gray-100 shadow-sm">
      <CardContent className="p-5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-black mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function LogsPage() {
  const { data: operations = [], isLoading: op } = useQuery({
    queryKey: ["/fish-operations"],
    queryFn: async () => {
      const data = await safeGet("/fish-operations");
      return data.operations || [];
    },
  });

  const { data: stock = [], isLoading: s } = useQuery({
    queryKey: ["/feed-stock"],
    queryFn: () => safeGet("/feed-stock"),
  });

  const { data: water = [], isLoading: w } = useQuery({
    queryKey: ["/water-quality"],
    queryFn: async () => {
      const data = await safeGet("/water-quality");
      return data.measurements || [];
    },
  });

  const { data: tasks = [], isLoading: t } = useQuery({
    queryKey: ["/tasks"],
    queryFn: async () => {
      const data = await safeGet("/tasks");
      return data.tasks || [];
    },
  });

  const { data: ponds = [], isLoading: p } = useQuery({
    queryKey: ["/ponds"],
    queryFn: () => safeGet("/ponds"),
  });

  const isLoading = op || s || w || t || p;

  const fallbackDate = new Date();

  const normalPonds = ponds.filter((pond) => pond.name !== "Barrage");

  const activePonds = normalPonds.filter(
    (pond) => Number(pond.current_fish_count || 0) > 0
  );

  const totalFish = normalPonds.reduce(
    (sum, pond) => sum + Number(pond.current_fish_count || 0),
    0
  );

  const lowStock = stock.filter(
    (item) => Number(item.quantity_kg || 0) <= Number(item.alert_threshold_kg || 0)
  );

  const pendingTasks = tasks.filter((task) => task.status === "pending");


  const logs = [];

  operations.forEach((opItem) => {
    logs.push({
      id: `op-${opItem.id}`,
      time: opItem.operation_date
        ? new Date(opItem.operation_date)
        : fallbackDate,
      icon: Fish,
      color: "bg-blue-50 text-blue-700",
      title: "Opération poissons",
      message: `${formatOperationType(opItem.operation_type)} • ${
        opItem.fish_count ?? 0
      } poisson(s) • Étang ${opItem.pond_id}`,
    });
  });

  water.forEach((m) => {
    logs.push({
      id: `water-${m.id}`,
      time: m.measurement_date ? new Date(m.measurement_date) : fallbackDate,
      icon: Waves,
      color: "bg-cyan-50 text-cyan-700",
      title: "Qualité de l'eau",
      message: `Étang ${m.pond_id} • O₂ ${
        m.oxygen_level_mg_l ?? "-"
      } mg/L • Temp. ${m.temperature_c ?? "-"}°C`,
    });
  });

  stock.forEach((item) => {
    logs.push({
      id: `stock-${item.id}`,
      time: item.updated_at ? new Date(item.updated_at) : fallbackDate,
      icon: Box,
      color: "bg-orange-50 text-orange-700",
      title: "Stock nourriture",
      message: `${item.product_name} • ${item.quantity_kg} kg • seuil ${item.alert_threshold_kg} kg`,
    });
  });

  tasks.forEach((task) => {
    logs.push({
      id: `task-${task.id}`,
      time: task.task_date ? new Date(task.task_date) : fallbackDate,
      icon: ClipboardList,
      color: "bg-emerald-50 text-emerald-700",
      title: "Tâche",
      message: `${task.title ?? "Nouvelle tâche"} • statut : ${
        task.status === "completed" ? "terminée" : "en attente"
      }`,
    });
  });

  logs.sort((a, b) => b.time - a.time);

  const today = new Date();

  const sessionDate = today.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const systemRows = [
    { icon: Monitor, key: "Application", value: "DA Web" },
    { icon: Code2, key: "Version", value: "1.0.0" },
    { icon: Cloud, key: "Environnement", value: "production" },
    { icon: Clock, key: "Date du jour", value: sessionDate },
    {
      icon: Waves,
      key: "Étangs actifs",
      value: `${activePonds.length} / ${normalPonds.length}`,
    },
    {
      icon: Fish,
      key: "Total poissons",
      value: totalFish.toLocaleString("fr-FR"),
    },
    {
      icon: Box,
      key: "Produits stock",
      value: `${stock.length} produit(s)`,
    },
    {
      icon: ClipboardList,
      key: "Tâches en attente",
      value: `${pendingTasks.length} tâche(s)`,
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-emerald-700 text-sm font-black uppercase">
          Système
        </p>
        <h1 className="text-3xl font-black mt-1">Journal d'Activité</h1>
        <p className="text-gray-500 mt-1">
          Historique des événements et opérations du système
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard
          title="Étangs actifs"
          value={`${activePonds.length} / ${normalPonds.length}`}
          subtitle="Étangs utilisés"
          icon={Server}
          color="bg-emerald-50 text-emerald-700"
        />

        <KpiCard
          title="Total poissons"
          value={totalFish.toLocaleString("fr-FR")}
          subtitle="Poissons en stock"
          icon={Fish}
          color="bg-blue-50 text-blue-700"
        />

        <KpiCard
          title="Opérations"
          value={operations.length}
          subtitle="Mouvements poissons"
          icon={Activity}
          color="bg-purple-50 text-purple-700"
        />

        <KpiCard
          title="Produits stock"
          value={stock.length}
          subtitle="Aliments disponibles"
          icon={Box}
          color="bg-orange-50 text-orange-700"
        />

        <KpiCard
          title="Alertes"
          value={lowStock.length}
          subtitle="Stock faible"
          icon={AlertTriangle}
          color="bg-red-50 text-red-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-gray-100 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <Server className="w-5 h-5 text-emerald-700" />
              Informations Système
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {systemRows.map((row) => {
              const Icon = row.icon;

              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between px-6 py-4 border-b last:border-b-0 hover:bg-emerald-50/40"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <p className="font-semibold">{row.key}</p>
                  </div>

                  <p className="font-mono text-sm text-gray-700">
                    {row.value}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <Activity className="w-5 h-5 text-emerald-700" />
              Activité Récente
              <span className="ml-auto text-sm font-normal text-gray-500">
                {logs.length} entrée(s)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="font-bold text-gray-800">
                  Aucune activité récente
                </p>
                <p className="text-sm mt-1">
                  Les événements et opérations apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto divide-y">
                {logs.map((entry) => {
                  const Icon = entry.icon;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-emerald-50/40 transition"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${entry.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{entry.title}</p>
                          <span className="text-xs text-gray-400 font-mono">
                            {entry.time.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {entry.message}
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

      <Card className="rounded-3xl border-emerald-100 bg-emerald-50/60 shadow-sm overflow-hidden">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-700">
            <Server className="w-6 h-6" />
          </div>

          <div>
            <p className="font-black">À propos du système</p>
            <p className="text-sm text-gray-600 mt-1">
              Édjofêh Web permet de surveiller les étangs, gérer les stocks,
              suivre les opérations, contrôler la qualité de l’eau et organiser
              les tâches aquacoles.
              DA Web permet de surveiller les étangs, gérer les stocks,
              suivre les commandes et contrôler les opérations aquacoles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatOperationType(type) {
  if (type === "addition") return "Ajout";
  if (type === "mortality") return "Mortalité";
  if (type === "transfer") return "Transfert";
  if (type === "control") return "Contrôle";
  return type || "Opération";
}