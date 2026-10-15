import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Fish, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUSES = [
  { value: "pending",   label: "En attente",  cls: "badge-pending" },
  { value: "ordered",   label: "Commandé",    cls: "badge-ordered" },
  { value: "received",  label: "Reçu",        cls: "badge-received" },
  { value: "cancelled", label: "Annulé",      cls: "badge-cancelled" },
];

const SPECIES = ["Tilapia", "Silure", "Carpe", "Catfish", "Clarias", "Heterotis", "Autre"];

const EMPTY = { supplier: "", species: "Tilapia", quantity: "", unitPriceFcfa: "", destinationPondId: "", status: "pending", notes: "" };

function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.value === status) ?? STATUSES[0];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border ${s.cls}`}>{s.label}</span>;
}

export default function FishOrdersPage() {
  const { toast } = useToast();
  const [modal, setModal] = useState({ open: false });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["/api/fish-orders"] });
  const { data: ponds = [] } = useQuery({ queryKey: ["/api/ponds"] });

  const createMut = useMutation({
    mutationFn: (body) => apiRequest("POST", "/api/fish-orders", body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fish-orders"] }); closeModal(); toast({ title: "Commande créée" }); },
    onError: (e) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => apiRequest("PATCH", `/api/fish-orders/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fish-orders"] }); closeModal(); toast({ title: "Commande mise à jour" }); },
    onError: (e) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/fish-orders/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fish-orders"] }); setDeleteTarget(null); toast({ title: "Commande supprimée" }); },
    onError: (e) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  function openCreate() { setForm({ ...EMPTY }); setModal({ open: true }); }
  function openEdit(o) {
    setForm({ supplier: o.supplier, species: o.species, quantity: String(o.quantity), unitPriceFcfa: String(o.unitPriceFcfa ?? ""), destinationPondId: String(o.destinationPondId ?? ""), status: o.status, notes: o.notes ?? "" });
    setModal({ open: true, editing: o });
  }
  function closeModal() { setModal({ open: false }); }

  function handleSubmit(e) {
    e.preventDefault();
    const body = { supplier: form.supplier, species: form.species, quantity: Number(form.quantity), unitPriceFcfa: form.unitPriceFcfa ? Number(form.unitPriceFcfa) : null, destinationPondId: form.destinationPondId ? Number(form.destinationPondId) : null, status: form.status, notes: form.notes || null };
    modal.editing ? updateMut.mutate({ id: modal.editing.id, body }) : createMut.mutate(body);
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);
  const totalFcfa = filtered.reduce((s, o) => s + (o.quantity * (o.unitPriceFcfa ?? 0)), 0);
  const byStatus = (v) => orders.filter((o) => o.status === v).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="term-label text-primary mb-1">ADMINISTRATION</p>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Commandes de Poissons</h1>
          <p className="text-muted-foreground text-xs font-mono mt-1">Suivi des achats et approvisionnements en alevins / géniteurs</p>
        </div>
        <Button data-testid="button-add-fish-order" onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "En attente", count: byStatus("pending"), icon: Clock, cls: "text-yellow-400" },
          { label: "Commandé", count: byStatus("ordered"), icon: TrendingUp, cls: "text-blue-400" },
          { label: "Reçu", count: byStatus("received"), icon: CheckCircle2, cls: "text-primary" },
          { label: "Annulé", count: byStatus("cancelled"), icon: XCircle, cls: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 shrink-0 ${s.cls}`} />
              <div>
                <p className="text-xl font-display font-extrabold">{s.count}</p>
                <p className="term-label">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40 flex-row items-center justify-between">
          <CardTitle className="font-display text-sm font-bold tracking-wide">
            {filterStatus === "all" ? `${orders.length} commande(s)` : `${filtered.length} résultat(s)`}
            {totalFcfa > 0 && <span className="ml-3 text-primary font-mono font-normal text-xs">{totalFcfa.toLocaleString("fr-FR")} FCFA</span>}
          </CardTitle>
          <div className="flex gap-1.5">
            {["all", ...STATUSES.map((s) => s.value)].map((v) => (
              <button key={v} onClick={() => setFilterStatus(v)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border transition-colors ${filterStatus === v ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                {v === "all" ? "Tout" : STATUSES.find((s) => s.value === v)?.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Fish className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-mono text-xs">Aucune commande</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    {["Date", "Fournisseur", "Espèce", "Qté", "Prix unit.", "Total FCFA", "Étang dest.", "Statut", ""].map((h) => (
                      <th key={h} className="term-label px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} data-testid={`row-fish-order-${o.id}`} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3 font-mono text-xs font-medium">{o.supplier}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{o.species}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold">{o.quantity.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.unitPriceFcfa ? `${o.unitPriceFcfa.toLocaleString("fr-FR")}` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{o.unitPriceFcfa ? (o.quantity * o.unitPriceFcfa).toLocaleString("fr-FR") : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{o.destinationPondName ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-end">
                          <button data-testid={`button-edit-fish-order-${o.id}`} onClick={() => openEdit(o)} className="p-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3 h-3" /></button>
                          <button data-testid={`button-delete-fish-order-${o.id}`} onClick={() => setDeleteTarget(o)} className="p-1.5 border border-border hover:border-destructive text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modal.open} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{modal.editing ? "Modifier la commande" : "Nouvelle commande de poissons"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="term-label">Fournisseur</Label>
                <Input data-testid="input-supplier" placeholder="Nom du fournisseur" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="term-label">Espèce</Label>
                <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SPECIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="term-label">Quantité (alevins)</Label>
                <Input data-testid="input-quantity" type="number" min="1" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="term-label">Prix unitaire (FCFA)</Label>
                <Input data-testid="input-price" type="number" min="0" placeholder="0" value={form.unitPriceFcfa} onChange={(e) => setForm({ ...form, unitPriceFcfa: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="term-label">Étang destinataire</Label>
                <Select value={form.destinationPondId} onValueChange={(v) => setForm({ ...form, destinationPondId: v })}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {ponds.filter((p) => p.name !== "Barrage").map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="term-label">Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="term-label">Notes</Label>
              <Input placeholder="Observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-fish-order">
                {createMut.isPending || updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : modal.editing ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>Commande de <strong>{deleteTarget?.quantity} {deleteTarget?.species}</strong> chez <strong>{deleteTarget?.supplier}</strong>. Action irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
              {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
