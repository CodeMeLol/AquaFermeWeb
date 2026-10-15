import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Scale,
  Heart,
  ArrowRightLeft,
  PlusCircle,
  Info,
  Save,
  Clock,
  Fish,
  Trash2,
  Loader2,
  Activity,
  Waves,
} from "lucide-react";

const types = {
  control: { label: "Contrôle", icon: Scale },
  mortality: { label: "Mortalité", icon: Heart },
  transfer: { label: "Transfert", icon: ArrowRightLeft },
  addition: { label: "Ajout", icon: PlusCircle },
};

export default function OperationsPage() {
  const [active, setActive] = useState("control");
  const [form, setForm] = useState({
    pond_id: "",
    target_pond_id: "",
    fish_count: "",
    avg_weight_g: "",
    notes: "",
  });

  const current = types[active];
  const HeaderIcon = current.icon;

  const { data: ponds = [] } = useQuery({
    queryKey: ["/ponds"],
    queryFn: () => apiRequest("GET", "/ponds"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/fish-operations"],
    queryFn: () => apiRequest("GET", "/fish-operations"),
  });

  const operations = data?.operations || [];

  const createOperation = useMutation({
    mutationFn: (body) => apiRequest("POST", "/fish-operations", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/fish-operations"] });
      queryClient.invalidateQueries({ queryKey: ["/ponds"] });
      setForm({
        pond_id: "",
        target_pond_id: "",
        fish_count: "",
        avg_weight_g: "",
        notes: "",
      });
    },
  });

  const deleteOperation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/fish-operations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/fish-operations"] });
      queryClient.invalidateQueries({ queryKey: ["/ponds"] });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    createOperation.mutate({
      pond_id: Number(form.pond_id),
      operation_type: active,
      operation_date: new Date().toISOString().slice(0, 10),
      fish_count: Number(form.fish_count),
      avg_weight_g: form.avg_weight_g ? Number(form.avg_weight_g) : null,
      target_pond_id: active === "transfer" ? Number(form.target_pond_id) : null,
      notes: form.notes || null,
    });
  }

  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg relative overflow-hidden">
        <Fish className="absolute right-8 top-4 w-40 h-40 opacity-10" />

        <div className="relative z-10">
          <p className="text-emerald-100 text-xs font-black uppercase">
            Édjofêh
          </p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Opérations poissons
          </h1>
          <p className="text-emerald-50/80 text-sm mt-2 max-w-2xl">
            Enregistrez les contrôles, mortalités, transferts et ajouts de
            poissons avec les vraies données du backend.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard icon={Activity} title="Opérations" value={operations.length} subtitle="Total enregistré" color="bg-emerald-50 text-emerald-700" />
        <KpiCard icon={PlusCircle} title="Ajouts" value={operations.filter((o) => o.operation_type === "addition").length} subtitle="Entrées poissons" color="bg-green-50 text-green-700" />
        <KpiCard icon={Heart} title="Mortalités" value={operations.filter((o) => o.operation_type === "mortality").length} subtitle="Pertes enregistrées" color="bg-red-50 text-red-700" />
        <KpiCard icon={ArrowRightLeft} title="Transferts" value={operations.filter((o) => o.operation_type === "transfer").length} subtitle="Mouvements" color="bg-blue-50 text-blue-700" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <section className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
          <div className={`${headerClass(active)} px-5 py-4 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <HeaderIcon size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold">{current.label}</p>
                <h2 className="text-lg font-black">Nouvelle opération</h2>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(types).map(([key, item]) => {
                const Icon = item.icon;
                const selected = active === key;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setActive(key)}
                    className={`h-14 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                      selected
                        ? selectedClass(key)
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className={`${noteClass(active)} rounded-2xl border px-3 py-3 flex gap-2 text-xs`}>
              <Info size={15} className="shrink-0 mt-0.5" />
              <p>
                {active === "transfer"
                  ? "Le transfert diminue l’étang source et augmente l’étang destination."
                  : active === "mortality"
                  ? "La mortalité diminue automatiquement le stock de l’étang."
                  : active === "addition"
                  ? "L’ajout augmente automatiquement le stock de l’étang."
                  : "Le contrôle sert au suivi sans modifier le stock."}
              </p>
            </div>

            <FieldSelect
              label={active === "addition" ? "Étang destination" : "Étang concerné"}
              value={form.pond_id}
              onChange={(v) => setForm({ ...form, pond_id: v })}
              ponds={ponds}
            />

            {active === "transfer" && (
              <FieldSelect
                label="Étang destination"
                value={form.target_pond_id}
                onChange={(v) => setForm({ ...form, target_pond_id: v })}
                ponds={ponds}
              />
            )}

            <FieldInput
              label={
                active === "mortality"
                  ? "Nombre de morts"
                  : active === "transfer"
                  ? "Nombre transféré"
                  : active === "addition"
                  ? "Nombre ajouté"
                  : "Nombre de poissons"
              }
              value={form.fish_count}
              onChange={(v) => setForm({ ...form, fish_count: v })}
            />

            <FieldInput
              label="Poids moyen (g)"
              value={form.avg_weight_g}
              onChange={(v) => setForm({ ...form, avg_weight_g: v })}
              optional
            />

            <div>
              <label className="font-bold text-xs text-slate-900">
                Observations
              </label>
              <textarea
                rows="2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes optionnelles..."
                className="mt-1 w-full rounded-2xl border border-gray-200 p-3 text-sm outline-none resize-none focus:border-emerald-600"
              />
            </div>

            <button
              disabled={createOperation.isPending}
              className={`${buttonClass(active)} w-full h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-60`}
            >
              {createOperation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Enregistrer
            </button>
          </form>
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-emerald-700" size={21} />
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Historique des opérations
                </h2>
                <p className="text-xs text-gray-500">
                  {operations.length} opération(s)
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin text-emerald-700" />
            </div>
          ) : operations.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-20 h-20 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <Waves className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                Aucune opération enregistrée
              </p>
              <p className="text-xs mt-1">
                Les opérations ajoutées apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {operations.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  ponds={ponds}
                  onDelete={() => deleteOperation.mutate(item.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase">{title}</p>
      <p className="text-2xl font-black mt-1 text-slate-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function FieldSelect({ label, value, onChange, ponds }) {
  return (
    <div>
      <label className="font-bold text-xs text-slate-900">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full h-10 rounded-2xl border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:border-emerald-600"
      >
        <option value="">Sélectionner un étang</option>
        {ponds.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldInput({ label, value, onChange, optional }) {
  return (
    <div>
      <label className="font-bold text-xs text-slate-900">{label}</label>
      <div className="mt-1 h-10 rounded-2xl border border-gray-200 px-3 flex items-center gap-2 focus-within:border-emerald-600">
        <Fish size={14} className="text-gray-400" />
        <input
          type="number"
          required={!optional}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full outline-none text-sm text-gray-600"
        />
      </div>
    </div>
  );
}

function HistoryItem({ item, ponds, onDelete }) {
  const info = types[item.operation_type] || types.control;
  const Icon = info.icon;

  const pond = ponds.find((p) => p.id === item.pond_id);
  const targetPond = ponds.find((p) => p.id === item.target_pond_id);

  return (
    <div className="flex items-center gap-3 px-5 py-4 hover:bg-emerald-50/40 transition">
      <div className={`${iconBoxClass(item.operation_type)} w-10 h-10 rounded-2xl flex items-center justify-center`}>
        <Icon size={17} />
      </div>

      <div className="flex-1">
        <p className="font-bold text-sm text-slate-900">
          {info.label} • {pond?.name || "Étang inconnu"}
          {targetPond ? ` → ${targetPond.name}` : ""}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(item.operation_date).toLocaleDateString("fr-FR")} ·{" "}
          {item.fish_count} poissons
          {item.avg_weight_g ? ` · ${item.avg_weight_g}g/p` : ""}
        </p>
      </div>

      <span className={`${badgeClass(item.operation_type)} px-3 py-1 rounded-full text-xs font-bold`}>
        {info.label}
      </span>

      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function headerClass(type) {
  if (type === "mortality") return "bg-gradient-to-r from-red-600 to-red-400";
  if (type === "transfer") return "bg-gradient-to-r from-blue-700 to-blue-500";
  if (type === "addition") return "bg-gradient-to-r from-emerald-700 to-green-500";
  return "bg-gradient-to-r from-emerald-900 to-emerald-700";
}

function buttonClass(type) {
  if (type === "mortality") return "bg-red-500 hover:bg-red-600";
  if (type === "transfer") return "bg-blue-600 hover:bg-blue-700";
  return "bg-emerald-700 hover:bg-emerald-800";
}

function selectedClass(type) {
  if (type === "mortality") return "border-red-300 bg-red-50 text-red-600";
  if (type === "transfer") return "border-blue-300 bg-blue-50 text-blue-600";
  return "border-emerald-500 bg-emerald-50 text-emerald-700";
}

function noteClass(type) {
  if (type === "mortality") return "bg-yellow-50 border-yellow-200 text-yellow-800";
  if (type === "transfer") return "bg-blue-50 border-blue-200 text-blue-700";
  return "bg-emerald-50 border-emerald-100 text-emerald-700";
}

function iconBoxClass(type) {
  if (type === "mortality") return "bg-red-50 text-red-600";
  if (type === "transfer") return "bg-blue-50 text-blue-600";
  return "bg-emerald-50 text-emerald-700";
}

function badgeClass(type) {
  if (type === "mortality") return "bg-red-50 text-red-600";
  if (type === "transfer") return "bg-blue-50 text-blue-600";
  return "bg-emerald-50 text-emerald-700";
}