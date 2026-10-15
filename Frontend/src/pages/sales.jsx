import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShoppingBag,
  Plus,
  TrendingUp,
  Package,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Fish,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const saleSchema = z.object({
  clientName: z.string().min(1, "Le nom du client est requis"),
  pondId: z.string().min(1, "L'étang est requis"),
  quantityKg: z.coerce.number().min(0.1, "La quantité doit être > 0"),
  unitPriceFcfa: z.coerce.number().min(1, "Le prix doit être > 0"),
  date: z.string().min(1, "La date est requise"),
});

function StatCard({ icon: Icon, label, value, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
          <p className={`text-2xl font-black mt-0.5 ${color}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);
  const unread = notifications?.filter((n) => !n.read) ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm hover:bg-muted transition"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-black flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 bg-white border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-bold text-sm">
            Notifications ({unread.length} non lues)
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications?.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">Aucune notification</p>
            )}
            {notifications?.map((n) => (
              <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${!n.read ? "bg-primary/5" : ""}`}>
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.type === "success" ? "bg-secondary/10" : "bg-destructive/10"}`}>
                  {n.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.createdAt ? format(new Date(n.createdAt), "d MMM yyyy HH:mm", { locale: fr }) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: sales = [], isLoading: loadingSales } = useQuery({ queryKey: ["/api/sales"] });
  const { data: notifications = [] } = useQuery({ queryKey: ["/api/notifications"] });
  const { data: ponds = [] } = useQuery({ queryKey: ["/api/ponds"] });

  const createSale = useMutation({
    mutationFn: (body) => apiRequest("POST", "/api/sales", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Vente enregistrée", description: "La vente a été ajoutée avec succès." });
      setOpen(false);
      form.reset();
    },
    onError: (err) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const form = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientName: "",
      pondId: "",
      quantityKg: 0,
      unitPriceFcfa: 0,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = (data) => {
    createSale.mutate(data);
  };

  const totalRevenue = sales.reduce((s, v) => s + (v.quantityKg * v.unitPriceFcfa), 0);
  const totalKg = sales.reduce((s, v) => s + Number(v.quantityKg || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Ventes
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Suivi des ventes de poissons et notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell notifications={notifications} />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Vente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Enregistrer une vente</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input {...form.register("clientName")} placeholder="Nom du client" className="rounded-xl" />
                  {form.formState.errors.clientName && (
                    <p className="text-xs text-destructive">{form.formState.errors.clientName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Étang source</Label>
                  <Controller
                    name="pondId"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Choisir un étang..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ponds.filter(p => p.name !== "Barrage").map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.pondId && (
                    <p className="text-xs text-destructive">{form.formState.errors.pondId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantité (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register("quantityKg")}
                      className="rounded-xl"
                    />
                    {form.formState.errors.quantityKg && (
                      <p className="text-xs text-destructive">{form.formState.errors.quantityKg.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Prix unitaire (FCFA/kg)</Label>
                    <Input
                      type="number"
                      {...form.register("unitPriceFcfa")}
                      className="rounded-xl"
                    />
                    {form.formState.errors.unitPriceFcfa && (
                      <p className="text-xs text-destructive">{form.formState.errors.unitPriceFcfa.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date de vente</Label>
                  <Input type="date" {...form.register("date")} className="rounded-xl" />
                </div>

                <Button
                  type="submit"
                  disabled={createSale.isPending}
                  className="w-full rounded-xl mt-2"
                >
                  {createSale.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</>
                  ) : (
                    "Enregistrer la vente"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Revenu total"
          value={`${totalRevenue.toLocaleString("fr-FR")} FCFA`}
          color="text-secondary"
          bg="bg-secondary/10"
        />
        <StatCard
          icon={Package}
          label="Total vendu"
          value={`${totalKg.toFixed(1)} kg`}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={Bell}
          label="Notifications"
          value={`${unreadNotifications} non lues`}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Sales Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5 text-primary" />
            Historique des ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune vente enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase font-semibold">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Client</th>
                    <th className="text-left py-3 px-2">Étang</th>
                    <th className="text-right py-3 px-2">Quantité (kg)</th>
                    <th className="text-right py-3 px-2">Prix/kg (FCFA)</th>
                    <th className="text-right py-3 px-2">Total (FCFA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 text-muted-foreground">
                        {sale.date ? format(new Date(sale.date), "dd/MM/yyyy", { locale: fr }) : "—"}
                      </td>
                      <td className="py-3 px-2 font-medium">{sale.clientName}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {ponds.find(p => String(p.id) === String(sale.pondId))?.name ?? sale.pondId}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono">{Number(sale.quantityKg).toFixed(1)}</td>
                      <td className="py-3 px-2 text-right font-mono">{Number(sale.unitPriceFcfa).toLocaleString("fr-FR")}</td>
                      <td className="py-3 px-2 text-right font-bold text-primary">
                        {(sale.quantityKg * sale.unitPriceFcfa).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
