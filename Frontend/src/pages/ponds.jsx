import { useState } from "react";

import {

  usePonds,

  useCreatePond,

  useUpdatePond,

  useDeletePond,

} from "@/hooks/use-ponds";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Skeleton } from "@/components/ui/skeleton";

import {

  Plus,

  Maximize,

  Fish,

  LayoutGrid,

  Droplet,

  Waves,

  Activity,

  AlertTriangle,

  BarChart3,

  Pencil,

  Trash2,

} from "lucide-react";

import {

  Dialog,

  DialogContent,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

const pondFormSchema = z.object({

  name: z.string().min(1, "Le nom est requis"),

  pondGroup: z.string().min(1, "Le groupe est requis"),

  areaM2: z.coerce.number().min(1, "La surface doit être > 0"),

  maxCapacity: z.coerce.number().min(1, "La capacité doit être > 0"),

  currentFishCount: z.coerce.number().default(0),

});

function KpiCard({ title, value, subtitle, icon: Icon, color }) {

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

function PondCard({ pond, onEdit, onDelete }) {

  const currentFish = Number(

    pond.current_fish_count ?? pond.currentFishCount ?? 0

  );

  const maxCapacity = Number(pond.max_capacity ?? pond.maxCapacity ?? 1);

  const area = pond.area_m2 ?? pond.areaM2 ?? 0;

  const occupancy = Math.round((currentFish / maxCapacity) * 100);

  const safeOccupancy = Math.min(occupancy, 100);

  const isDanger = occupancy >= 90;

  const isWarning = occupancy >= 70 && occupancy < 90;

  const ringColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#38bdf8";

  const statusStyle = isDanger

    ? "bg-red-50 text-red-700 border-red-200"

    : isWarning

    ? "bg-orange-50 text-orange-700 border-orange-200"

    : "bg-sky-50 text-sky-700 border-sky-200";

  const progressStyle = isDanger

    ? "bg-red-500"

    : isWarning

    ? "bg-orange-500"

    : "bg-sky-500";

  return (
<Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden">
<CardHeader className="pb-2">
<div className="flex items-start justify-between gap-3">
<div>
<p className="text-[11px] font-bold text-gray-400 uppercase">

              Étang
</p>
<h3 className="text-xl font-black text-gray-900 mt-1">

              {pond.name}
</h3>
</div>
<div

            className={`px-3 py-1 rounded-full border text-[11px] font-bold ${statusStyle}`}
>

            {occupancy}% plein
</div>
</div>
</CardHeader>
<CardContent className="space-y-4">
<div className="flex items-center justify-center">
<div

            className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-sm"

            style={{

              background: `conic-gradient(${ringColor} ${

                safeOccupancy * 3.6

              }deg, #f1f5f9 0deg)`,

            }}
>
<div className="absolute w-[70px] h-[70px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
<p

                className={`text-xl font-black ${

                  isDanger

                    ? "text-red-500"

                    : isWarning

                    ? "text-amber-500"

                    : "text-sky-500"

                }`}
>

                {occupancy}%
</p>
<p className="text-[10px] text-gray-500">occupation</p>
</div>
</div>
</div>
<div>
<div className="flex items-center justify-between text-xs mb-2">
<span className="text-gray-500 flex items-center gap-1">
<Fish className="w-3.5 h-3.5" />

              Population
</span>
<span className="font-bold">

              {currentFish.toLocaleString("fr-FR")}
</span>
</div>
<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
<div

              className={`h-full rounded-full ${progressStyle}`}

              style={{ width: `${safeOccupancy}%` }}

            />
</div>
</div>
<div className="grid grid-cols-2 gap-3 pt-3 border-t">
<div className="rounded-2xl bg-gray-50 p-3">
<p className="text-[11px] text-gray-500 flex items-center gap-1">
<Maximize className="w-3 h-3" />

              Surface
</p>
<p className="font-black text-sm mt-1">{area} m²</p>
</div>
<div className="rounded-2xl bg-gray-50 p-3">
<p className="text-[11px] text-gray-500 flex items-center gap-1">
<BarChart3 className="w-3 h-3" />

              Capacité
</p>
<p className="font-black text-sm mt-1">

              {maxCapacity.toLocaleString("fr-FR")}
</p>
</div>
</div>
<div className="flex gap-2 pt-1">
<Button

            type="button"

            variant="outline"

            onClick={() => onEdit(pond)}

            className="flex-1 rounded-2xl gap-2 text-xs"
>
<Pencil className="w-3.5 h-3.5" />

            Modifier
</Button>
<Button

            type="button"

            variant="outline"

            onClick={() => onDelete(pond)}

            className="flex-1 rounded-2xl gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
>
<Trash2 className="w-3.5 h-3.5" />

            Supprimer
</Button>
</div>
</CardContent>
</Card>

  );

}

export default function Ponds() {

  const { data: ponds = [], isLoading } = usePonds();

  const createPond = useCreatePond();

  const updatePond = useUpdatePond();

  const deletePond = useDeletePond();

  const [open, setOpen] = useState(false);

  const [editingPond, setEditingPond] = useState(null);

  const form = useForm({

    resolver: zodResolver(pondFormSchema),

    defaultValues: {

      name: "",

      pondGroup: "",

      areaM2: 0,

      maxCapacity: 0,

      currentFishCount: 0,

    },

  });

  function openCreateModal() {

    setEditingPond(null);

    form.reset({

      name: "",

      pondGroup: "",

      areaM2: 0,

      maxCapacity: 0,

      currentFishCount: 0,

    });

    setOpen(true);

  }

  function openEditModal(pond) {

    setEditingPond(pond);

    form.reset({

      name: pond.name || "",

      pondGroup: pond.pond_group || pond.pondGroup || "",

      areaM2: Number(pond.area_m2 ?? pond.areaM2 ?? 0),

      maxCapacity: Number(pond.max_capacity ?? pond.maxCapacity ?? 0),

      currentFishCount: Number(

        pond.current_fish_count ?? pond.currentFishCount ?? 0

      ),

    });

    setOpen(true);

  }

  function onDelete(pond) {

    const ok = window.confirm(`Voulez-vous supprimer l'étang ${pond.name} ?`);

    if (!ok) return;

    deletePond.mutate(pond.id);

  }

  function onSubmit(data) {

    if (editingPond) {

      updatePond.mutate(

        {

          id: editingPond.id,

          body: data,

        },

        {

          onSuccess: () => {

            setOpen(false);

            setEditingPond(null);

            form.reset();

          },

        }

      );

    } else {

      createPond.mutate(data, {

        onSuccess: () => {

          setOpen(false);

          form.reset();

        },

      });

    }

  }

  if (isLoading) {

    return (
<div className="space-y-7">
<div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-7 text-white shadow-lg">
<p className="text-emerald-100 text-sm font-black uppercase">DA</p>
<h1 className="text-2xl font-black mt-1">Gestion des Étangs</h1>
<p className="text-emerald-50/80 text-sm mt-2">

            Chargement des étangs...
</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {[...Array(8)].map((_, i) => (
<Skeleton key={i} className="h-60 rounded-3xl" />

          ))}
</div>
</div>

    );

  }

  const normalPonds = ponds.filter((pond) => pond.name !== "Barrage");

  const totalFish = normalPonds.reduce(

    (sum, pond) =>

      sum + Number(pond.current_fish_count ?? pond.currentFishCount ?? 0),

    0

  );

  const totalCapacity = normalPonds.reduce(

    (sum, pond) => sum + Number(pond.max_capacity ?? pond.maxCapacity ?? 0),

    0

  );

  const averageOccupancy =

    totalCapacity > 0 ? Math.round((totalFish / totalCapacity) * 100) : 0;

  const alertCount = normalPonds.filter((pond) => {

    const current = Number(pond.current_fish_count ?? pond.currentFishCount ?? 0);

    const max = Number(pond.max_capacity ?? pond.maxCapacity ?? 1);

    return Math.round((current / max) * 100) >= 90;

  }).length;

  const groups =

    ponds.reduce((acc, pond) => {

      const group = pond.pond_group || pond.pondGroup || "Autres";

      if (!acc[group]) acc[group] = [];

      acc[group].push(pond);

      return acc;

    }, {}) || {};

  const orderedGroups = ["A", "B", "C", "D", "Barrage", "Autres"];

  return (
<div className="space-y-8 animate-in fade-in duration-500">
<div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg overflow-hidden relative">
<div className="absolute right-8 top-4 opacity-10">
<Waves className="w-40 h-40" />
</div>
<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
<div>
<p className="text-emerald-100 text-sm font-black uppercase">DA</p>
<h1 className="text-2xl sm:text-3xl font-black mt-1">

              Gestion des Étangs
</h1>
<p className="text-emerald-50/80 text-sm mt-2 max-w-2xl">

              Supervision des étangs, de la capacité et de la population de

              poissons.
</p>
</div>
<Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild>
<Button

                onClick={openCreateModal}

                className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl h-11 px-5 font-bold gap-2 text-sm"
>
<Plus className="w-4 h-4" />

                Nouvel Étang
</Button>
</DialogTrigger>
<DialogContent className="sm:max-w-[460px] rounded-3xl">
<DialogHeader>
<DialogTitle className="text-xl font-black">

                  {editingPond ? "Modifier l'étang" : "Ajouter un étang"}
</DialogTitle>
</DialogHeader>
<form

                onSubmit={form.handleSubmit(onSubmit)}

                className="space-y-4 mt-4"
>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
<Label htmlFor="name">Nom</Label>
<Input

                      id="name"

                      {...form.register("name")}

                      placeholder="Ex: A1"

                      className="rounded-2xl h-11"

                    />

                    {form.formState.errors.name && (
<p className="text-xs text-red-600">

                        {form.formState.errors.name.message}
</p>

                    )}
</div>
<div className="space-y-2">
<Label htmlFor="pondGroup">Groupe</Label>
<select

                      id="pondGroup"

                      {...form.register("pondGroup")}

                      className="w-full rounded-2xl h-11 border border-gray-200 px-3 bg-white text-sm"
>
<option value="">Choisir un groupe</option>
<option value="A">Secteur A</option>
<option value="B">Secteur B</option>
<option value="C">Secteur C</option>
<option value="D">Secteur D</option>
<option value="Barrage">Barrage</option>
</select>

                    {form.formState.errors.pondGroup && (
<p className="text-xs text-red-600">

                        {form.formState.errors.pondGroup.message}
</p>

                    )}
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-2">
<Label htmlFor="areaM2">Surface (m²)</Label>
<Input

                      id="areaM2"

                      type="number"

                      {...form.register("areaM2")}

                      className="rounded-2xl h-11"

                    />
</div>
<div className="space-y-2">
<Label htmlFor="maxCapacity">Capacité max</Label>
<Input

                      id="maxCapacity"

                      type="number"

                      {...form.register("maxCapacity")}

                      className="rounded-2xl h-11"

                    />
</div>
</div>
<div className="space-y-2">
<Label htmlFor="currentFishCount">Nombre de poissons</Label>
<Input

                    id="currentFishCount"

                    type="number"

                    {...form.register("currentFishCount")}

                    className="rounded-2xl h-11"

                  />
</div>
<Button

                  type="submit"

                  disabled={createPond.isPending || updatePond.isPending}

                  className="w-full rounded-2xl h-11 bg-emerald-700 hover:bg-emerald-800 mt-4"
>

                  {editingPond

                    ? updatePond.isPending

                      ? "Modification..."

                      : "Modifier l'étang"

                    : createPond.isPending

                    ? "Enregistrement..."

                    : "Créer l'étang"}
</Button>
</form>
</DialogContent>
</Dialog>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<KpiCard

          title="Étangs"

          value={ponds.length}

          subtitle="Total enregistré"

          icon={Waves}

          color="bg-emerald-50 text-emerald-700"

        />
<KpiCard

          title="Poissons"

          value={totalFish.toLocaleString("fr-FR")}

          subtitle="Population totale"

          icon={Fish}

          color="bg-blue-50 text-blue-700"

        />
<KpiCard

          title="Occupation"

          value={`${averageOccupancy}%`}

          subtitle="Moyenne globale"

          icon={Activity}

          color="bg-purple-50 text-purple-700"

        />
<KpiCard

          title="Alertes"

          value={alertCount}

          subtitle="Étangs presque pleins"

          icon={AlertTriangle}

          color="bg-red-50 text-red-700"

        />
</div>
<div className="space-y-10">

        {orderedGroups

          .filter((groupName) => groups[groupName]?.length > 0)

          .map((groupName) => {

            const groupPonds = groups[groupName];

            return (
<div key={groupName} className="space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-lg font-black flex items-center gap-2 text-emerald-800">
<LayoutGrid className="w-4 h-4" />

                    {groupName === "Barrage"

                      ? "Barrage"

                      : groupName === "Autres"

                      ? "Secteur Autres"

                      : `Secteur ${groupName}`}
</h2>
<span className="text-xs text-gray-500">

                    {groupPonds.length} étang(s)
</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                  {groupPonds.map((pond) => (
<PondCard

                      key={pond.id}

                      pond={pond}

                      onEdit={openEditModal}

                      onDelete={onDelete}

                    />

                  ))}
</div>
</div>

            );

          })}

        {ponds.length === 0 && (
<div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
<div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
<Droplet className="w-12 h-12 text-emerald-500" />
</div>
<h3 className="text-lg font-black">Aucun étang trouvé</h3>
<p className="text-sm text-gray-500 mt-2">

              Commencez par ajouter votre premier étang.
</p>
</div>

        )}
</div>
</div>

  );

}
 