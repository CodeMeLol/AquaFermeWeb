import { useState } from "react";
import { usePonds } from "@/hooks/use-ponds";
import {
  useWaterQuality,
  useCreateWaterQuality,
  useUpdateWaterQuality,
  useDeleteWaterQuality,
} from "@/hooks/use-water-quality";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Droplet,
  Thermometer,
  Wind,
  FlaskConical,
  AlertTriangle,
  Activity,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const wqSchema = z.object({
  pondId: z.coerce.number().min(1, "L'étang est requis"),
  oxygenRate: z.string().optional(),
  temperature: z.string().optional(),
  waterColor: z.string().optional(),
});

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <Card className="rounded-3xl border-gray-100 shadow-sm">
      <CardContent className="p-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-bold text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-black mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function WaterQualityPage() {
  const { data: ponds = [] } = usePonds();
  const { data: records = [], isLoading } = useWaterQuality();

  const createRecord = useCreateWaterQuality();
  const updateRecord = useUpdateWaterQuality();
  const deleteRecord = useDeleteWaterQuality();

  const [editingRecord, setEditingRecord] = useState(null);

  const form = useForm({
    resolver: zodResolver(wqSchema),
    defaultValues: {
      pondId: "",
      oxygenRate: "",
      temperature: "",
      waterColor: "",
    },
  });

  const onSubmit = (data) => {
    if (editingRecord) {
      updateRecord.mutate(
        {
          id: editingRecord.id,
          body: data,
        },
        {
          onSuccess: () => {
            setEditingRecord(null);
            form.reset({
              pondId: "",
              oxygenRate: "",
              temperature: "",
              waterColor: "",
            });
          },
        }
      );
    } else {
      createRecord.mutate(data, {
        onSuccess: () =>
          form.reset({
            pondId: "",
            oxygenRate: "",
            temperature: "",
            waterColor: "",
          }),
      });
    }
  };

  function handleEdit(rec) {
    setEditingRecord(rec);

    form.reset({
      pondId: rec.pond_id || rec.pondId || "",
      oxygenRate: rec.oxygen_level_mg_l || rec.oxygenRate || "",
      temperature: rec.temperature_c || rec.temperature || "",
      waterColor: rec.water_color || rec.waterColor || "",
    });
  }

  function handleDelete(rec) {
    const ok = window.confirm("Voulez-vous supprimer ce relevé ?");
    if (!ok) return;

    deleteRecord.mutate(rec.id);
  }

  function cancelEdit() {
    setEditingRecord(null);
    form.reset({
      pondId: "",
      oxygenRate: "",
      temperature: "",
      waterColor: "",
    });
  }

  const oxygenValues = records
    .map((r) => Number(r.oxygenRate ?? r.oxygen_level_mg_l))
    .filter((v) => !Number.isNaN(v));

  const tempValues = records
    .map((r) => Number(r.temperature ?? r.temperature_c))
    .filter((v) => !Number.isNaN(v));

  const avgOxygen =
    oxygenValues.length > 0
      ? (oxygenValues.reduce((a, b) => a + b, 0) / oxygenValues.length).toFixed(1)
      : "0.0";

  const avgTemp =
    tempValues.length > 0
      ? (tempValues.reduce((a, b) => a + b, 0) / tempValues.length).toFixed(1)
      : "0.0";

  const alerts = records.filter((r) => {
    const oxygen = Number(r.oxygenRate ?? r.oxygen_level_mg_l);
    const temp = Number(r.temperature ?? r.temperature_c);
    return oxygen < 4 || temp > 30;
  });

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950 via-sky-900 to-cyan-600 p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-8 top-4 opacity-10">
          <Droplet className="w-40 h-40" />
        </div>

        <div className="relative z-10">
          <p className="text-cyan-100 text-xs font-black uppercase">Édjofêh</p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Qualité de l'eau
          </h1>
          <p className="text-cyan-50/80 text-sm mt-2 max-w-2xl">
            Suivi des paramètres physico-chimiques des étangs : oxygène,
            température et couleur de l’eau.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Wind}
          title="Oxygène moyen"
          value={`${avgOxygen} mg/L`}
          subtitle="Valeur moyenne"
          color="bg-cyan-50 text-cyan-700"
        />

        <StatCard
          icon={Thermometer}
          title="Température"
          value={`${avgTemp}°C`}
          subtitle="Moyenne"
          color="bg-red-50 text-red-700"
        />

        <StatCard
          icon={FlaskConical}
          title="Relevés"
          value={records.length}
          subtitle="Mesures enregistrées"
          color="bg-emerald-50 text-emerald-700"
        />

        <StatCard
          icon={AlertTriangle}
          title="Alertes"
          value={alerts.length}
          subtitle="À surveiller"
          color="bg-orange-50 text-orange-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-1">
          <Card className="rounded-3xl shadow-md border-gray-100 sticky top-24 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
              <CardTitle className="flex items-center gap-2 text-cyan-800 text-lg font-black">
                <Activity className="w-5 h-5" />
                {editingRecord ? "Modifier le relevé" : "Nouveau relevé"}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Étang</Label>
                  <Select
                    value={String(form.watch("pondId") || "")}
                    onValueChange={(val) => form.setValue("pondId", Number(val))}
                  >
                    <SelectTrigger className="rounded-2xl h-11">
                      <SelectValue placeholder="Sélectionner un étang" />
                    </SelectTrigger>

                    <SelectContent>
                      {ponds.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {form.formState.errors.pondId && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.pondId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-700" />
                    Oxygène (mg/L)
                  </Label>
                  <Input
                    {...form.register("oxygenRate")}
                    placeholder="Ex: 5.2"
                    className="rounded-2xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-600" />
                    Température (°C)
                  </Label>
                  <Input
                    {...form.register("temperature")}
                    placeholder="Ex: 24.5"
                    className="rounded-2xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-sky-600" />
                    Couleur de l'eau
                  </Label>

                  <Select
                    value={form.watch("waterColor") || ""}
                    onValueChange={(val) => form.setValue("waterColor", val)}
                  >
                    <SelectTrigger className="rounded-2xl h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Verte">Verte</SelectItem>
                      <SelectItem value="Vert foncé">Vert foncé</SelectItem>
                      <SelectItem value="Brune">Brune</SelectItem>
                      <SelectItem value="Claire">Claire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={createRecord.isPending || updateRecord.isPending}
                  className="w-full rounded-2xl h-11 bg-cyan-700 hover:bg-cyan-800 mt-3"
                >
                  {createRecord.isPending || updateRecord.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : editingRecord ? (
                    "Modifier"
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>

                {editingRecord && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    className="w-full rounded-2xl h-10"
                  >
                    Annuler la modification
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-gray-100 shadow-md overflow-hidden">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <FlaskConical className="w-5 h-5 text-cyan-700" />
                Derniers relevés
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-gray-100 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 mx-auto rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                    <Droplet className="w-10 h-10 text-cyan-500" />
                  </div>
                  <p className="text-lg font-black text-gray-900">
                    Aucun relevé enregistré
                  </p>
                  <p className="text-sm mt-1">
                    Les mesures de qualité de l’eau apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-4 py-4">Étang</th>
                        <th className="px-4 py-4">Oxygène</th>
                        <th className="px-4 py-4">Temp.</th>
                        <th className="px-4 py-4">Couleur</th>
                        <th className="px-4 py-4">État</th>
                        <th className="px-4 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {records.map((rec) => {
                        const pondId = rec.pondId ?? rec.pond_id;
                        const pond = ponds.find((p) => p.id === pondId);

                        const oxygen = rec.oxygenRate ?? rec.oxygen_level_mg_l;
                        const temperature = rec.temperature ?? rec.temperature_c;
                        const waterColor = rec.waterColor ?? rec.water_color;
                        const date = rec.date ?? rec.measurement_date;

                        const isAlert =
                          Number(oxygen) < 4 || Number(temperature) > 30;

                        return (
                          <tr
                            key={rec.id}
                            className="hover:bg-cyan-50/40 transition"
                          >
                            <td className="px-5 py-4 font-medium whitespace-nowrap">
                              {date
                                ? format(new Date(date), "dd MMM yyyy", {
                                    locale: fr,
                                  })
                                : "—"}
                            </td>

                            <td className="px-4 py-4 font-bold text-cyan-700">
                              {pond?.name || "Inconnu"}
                            </td>

                            <td className="px-4 py-4">
                              {oxygen ? `${oxygen} mg/L` : "—"}
                            </td>

                            <td className="px-4 py-4">
                              {temperature ? `${temperature}°C` : "—"}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  waterColor?.includes("Vert")
                                    ? "bg-emerald-50 text-emerald-700"
                                    : waterColor?.includes("Brune")
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {waterColor || "—"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              {isAlert ? (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700">
                                  À surveiller
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                  Normal
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(rec)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 flex items-center gap-1"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Modifier
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(rec)}
                                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}