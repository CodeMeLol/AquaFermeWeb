import { useState } from "react";
import {
 Package,
 Search,
 AlertTriangle,
 Wheat,
 Pencil,
 Trash2,
 CheckCircle2,
 ShoppingCart,
 Loader2,
} from "lucide-react";
import {
 useFeedStock,
 useCreateFeedStock,
 useUpdateFeedStock,
 useDeleteFeedStock,
} from "@/hooks/use-feed-stock";
function StatCard({ icon: Icon, title, value, subtitle, color }) {
 return (
<div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
<div
       className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}
>
<Icon className="w-5 h-5" />
</div>
<p className="text-[11px] font-bold text-gray-500 uppercase">{title}</p>
<p className="text-2xl font-black mt-1 text-slate-900">{value}</p>
<p className="text-xs text-gray-500 mt-1">{subtitle}</p>
</div>
 );
}
export default function SupplyOrdersPage() {
 const { data: stocks = [], isLoading } = useFeedStock();
 const createStock = useCreateFeedStock();
 const updateStock = useUpdateFeedStock();
 const deleteStock = useDeleteFeedStock();
 const [search, setSearch] = useState("");
 const [editing, setEditing] = useState(null);
 const [form, setForm] = useState({
   product_name: "",
   quantity_kg: "",
   alert_threshold_kg: "",
 });
 const totalStock = stocks.reduce(
   (sum, item) => sum + Number(item.quantity_kg || 0),
   0
 );
 const lowStock = stocks.filter(
   (item) => Number(item.quantity_kg || 0) <= Number(item.alert_threshold_kg || 0)
 );
 const availableStock = stocks.filter(
   (item) => Number(item.quantity_kg || 0) > Number(item.alert_threshold_kg || 0)
 );
 const filteredStocks = stocks.filter((item) =>
   item.product_name?.toLowerCase().includes(search.toLowerCase())
 );
 function resetForm() {
   setEditing(null);
   setForm({
     product_name: "",
     quantity_kg: "",
     alert_threshold_kg: "",
   });
 }
 function handleSubmit(e) {
   e.preventDefault();
   const body = {
     product_name: form.product_name,
     quantity_kg: Number(form.quantity_kg),
     alert_threshold_kg: Number(form.alert_threshold_kg || 50),
   };
   if (editing) {
     updateStock.mutate(
       { id: editing.id, body },
       { onSuccess: resetForm }
     );
   } else {
     createStock.mutate(body, { onSuccess: resetForm });
   }
 }
 function handleEdit(item) {
   setEditing(item);
   setForm({
     product_name: item.product_name || "",
     quantity_kg: item.quantity_kg || "",
     alert_threshold_kg: item.alert_threshold_kg || "",
   });
 }
 function handleDelete(item) {
   const ok = window.confirm(`Voulez-vous supprimer ${item.product_name} ?`);
   if (!ok) return;
   deleteStock.mutate(item.id);
 }
 return (
<div className="space-y-7">
<div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg overflow-hidden relative">
<div className="absolute right-8 top-5 opacity-10">
<Wheat className="w-40 h-40" />
</div>
<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
<div>
<p className="text-emerald-100 text-sm font-black uppercase">
             DA
</p>
<h1 className="text-2xl sm:text-3xl font-black mt-1">
             Stock Aliments
</h1>
<p className="text-emerald-50/80 text-sm mt-2 max-w-2xl">
             Suivi du stock alimentaire, des seuils d’alerte et de la
             disponibilité des produits.
</p>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<StatCard
         icon={Package}
         title="Stock total"
         value={`${totalStock.toLocaleString("fr-FR")} kg`}
         subtitle="Tous les aliments"
         color="bg-emerald-50 text-emerald-700"
       />
<StatCard
         icon={AlertTriangle}
         title="Alertes"
         value={lowStock.length}
         subtitle="Sous le seuil"
         color="bg-red-50 text-red-700"
       />
<StatCard
         icon={Wheat}
         title="Produits"
         value={stocks.length}
         subtitle="Types d’aliments"
         color="bg-orange-50 text-orange-700"
       />
<StatCard
         icon={CheckCircle2}
         title="Disponibles"
         value={availableStock.length}
         subtitle="Stock suffisant"
         color="bg-blue-50 text-blue-700"
       />
</div>
<div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
<h2 className="text-lg font-black text-slate-900">
           {editing ? "Modifier aliment" : "Ajouter aliment"}
</h2>
<form onSubmit={handleSubmit} className="space-y-4 mt-4">
<div>
<label className="text-xs font-bold text-gray-700">
               Nom du produit
</label>
<input
               value={form.product_name}
               onChange={(e) =>
                 setForm({ ...form, product_name: e.target.value })
               }
               placeholder="Ex: Aliment Tilapia"
               required
               className="mt-1 w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-600"
             />
</div>
<div>
<label className="text-xs font-bold text-gray-700">
               Quantité (kg)
</label>
<input
               type="number"
               value={form.quantity_kg}
               onChange={(e) =>
                 setForm({ ...form, quantity_kg: e.target.value })
               }
               required
               className="mt-1 w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-600"
             />
</div>
<div>
<label className="text-xs font-bold text-gray-700">
               Seuil d’alerte (kg)
</label>
<input
               type="number"
               value={form.alert_threshold_kg}
               onChange={(e) =>
                 setForm({ ...form, alert_threshold_kg: e.target.value })
               }
               placeholder="50"
               className="mt-1 w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm outline-none focus:border-emerald-600"
             />
</div>
<button
             disabled={createStock.isPending || updateStock.isPending}
             className="w-full h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2"
>
             {(createStock.isPending || updateStock.isPending) && (
<Loader2 className="w-4 h-4 animate-spin" />
             )}
             {editing ? "Modifier" : "Ajouter"}
</button>
           {editing && (
<button
               type="button"
               onClick={resetForm}
               className="w-full h-10 rounded-2xl border border-gray-200 text-sm font-bold"
>
               Annuler
</button>
           )}
</form>
</div>
<div className="space-y-5">
<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h2 className="text-lg font-black text-slate-900">
                 Liste des aliments
</h2>
<p className="text-xs text-gray-500">
                 {filteredStocks.length} aliment(s) trouvé(s)
</p>
</div>
<div className="relative w-full md:w-[320px]">
<Search
                 size={17}
                 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
               />
<input
                 type="text"
                 placeholder="Rechercher..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-11 rounded-2xl border border-gray-200 pl-11 pr-4 outline-none focus:border-emerald-600 text-sm"
               />
</div>
</div>
</div>
<div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
           {isLoading ? (
<div className="p-8 flex justify-center">
<Loader2 className="animate-spin text-emerald-700" />
</div>
           ) : (
<table className="w-full">
<thead>
<tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-100 bg-gray-50">
<th className="px-5 py-4">Aliment</th>
<th className="px-5 py-4">Quantité</th>
<th className="px-5 py-4">Seuil</th>
<th className="px-5 py-4">Statut</th>
<th className="px-5 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-100">
                 {filteredStocks.map((item) => {
                   const quantity = Number(item.quantity_kg || 0);
                   const threshold = Number(item.alert_threshold_kg || 50);
                   const isLow = quantity <= threshold;
                   const percent = Math.min(
                     (quantity / Math.max(threshold * 2, 1)) * 100,
                     100
                   );
                   return (
<tr
                       key={item.id}
                       className="hover:bg-emerald-50/40 transition"
>
<td className="px-5 py-4">
<div className="flex items-center gap-3">
<div
                             className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                               isLow
                                 ? "bg-red-50 text-red-600"
                                 : "bg-emerald-50 text-emerald-700"
                             }`}
>
<Package size={18} />
</div>
<div>
<p className="font-black text-sm text-slate-900">
                               {item.product_name}
</p>
<p className="text-xs text-gray-500">
                               Produit alimentaire
</p>
</div>
</div>
</td>
<td className="px-5 py-4">
<p className="font-black text-sm text-slate-900">
                           {quantity.toLocaleString("fr-FR")} kg
</p>
<div className="w-32 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
<div
                             className={`h-full rounded-full ${
                               isLow ? "bg-red-500" : "bg-emerald-600"
                             }`}
                             style={{ width: `${percent}%` }}
                           />
</div>
</td>
<td className="px-5 py-4 text-sm text-gray-600">
                         {threshold.toLocaleString("fr-FR")} kg
</td>
<td className="px-5 py-4">
<span
                           className={`px-3 py-1 rounded-full text-xs font-bold ${
                             isLow
                               ? "bg-red-50 text-red-600"
                               : "bg-emerald-50 text-emerald-700"
                           }`}
>
                           {isLow ? "Stock faible" : "Disponible"}
</span>
</td>
<td className="px-5 py-4">
<div className="flex justify-end gap-2">
<button
                             onClick={() => handleEdit(item)}
                             className="w-9 h-9 rounded-xl border border-gray-200 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center"
>
<Pencil size={15} />
</button>
<button
                             onClick={() => handleDelete(item)}
                             className="w-9 h-9 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center"
>
<Trash2 size={15} />
</button>
</div>
</td>
</tr>
                   );
                 })}
                 {filteredStocks.length === 0 && (
<tr>
<td colSpan="5" className="py-16 text-center">
<div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
<ShoppingCart className="w-10 h-10 text-emerald-500" />
</div>
<h3 className="text-lg font-black text-slate-900">
                         Aucun aliment trouvé
</h3>
<p className="text-sm text-gray-500 mt-1">
                         Ajoutez un aliment ou essayez une autre recherche.
</p>
</td>
</tr>
                 )}
</tbody>
</table>
           )}
</div>
         {lowStock.length > 0 && (
<div className="rounded-3xl border border-red-100 bg-red-50 p-4 flex items-start gap-3 text-red-700">
<div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
<AlertTriangle className="w-5 h-5" />
</div>
<div>
<p className="font-black text-sm">Attention stock faible</p>
<p className="text-xs mt-1">
                 {lowStock.length} produit(s) sont sous le seuil minimal.
</p>
</div>
</div>
         )}
</div>
</div>
</div>
 );
}