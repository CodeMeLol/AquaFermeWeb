import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  Briefcase,
  Loader2,
  Search,
  UsersRound,
  Lock,
  Power,
  PowerOff,
} from "lucide-react";

const ROLES = [
  {
    value: "admin",
    label: "Administrateur",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "manager",
    label: "Responsable",
    icon: Briefcase,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "employee",
    label: "Employé",
    icon: UsersRound,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
];

const EMPTY = {
  username: "",
  fullName: "",
  role: "employee",
  password: "",
};

function roleInfo(role) {
  return ROLES.find((r) => r.value === role) ?? ROLES[2];
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const isAdmin = me?.role === "admin";
  const isResponsable = me?.role === "manager";
  const isEmployee = me?.role === "employee";

  const canAdd = isAdmin || isResponsable;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canChangeStatus = isAdmin;

  const rolesForForm = isResponsable
    ? ROLES.filter((role) => role.value === "employee")
    : ROLES;

  const { data, isLoading } = useQuery({
    queryKey: ["/users"],
    queryFn: () => apiRequest("GET", "/users"),
  });

  const users = Array.isArray(data) ? data : data?.users || [];

  const createMut = useMutation({
    mutationFn: (body) => apiRequest("POST", "/users", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      closeModal();
      toast({ title: "Employé créé avec succès" });
    },
    onError: (e) =>
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }) => apiRequest("PATCH", `/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      closeModal();
      toast({ title: "Employé mis à jour" });
    },
    onError: (e) =>
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive",
      }),
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, isActive }) =>
      apiRequest("PATCH", `/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (e) =>
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive",
      }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      setDeleteTarget(null);
      toast({ title: "Employé supprimé" });
    },
    onError: (e) =>
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive",
      }),
  });

  function openCreate() {
    setForm({
      ...EMPTY,
      role: "employee",
    });
    setModal({ open: true });
  }

  function openEdit(u) {
    if (!isAdmin) return;

    setForm({
      username: u.username,
      fullName: u.fullName || u.name || "",
      role: u.role,
      password: "",
    });

    setModal({ open: true, editing: u });
  }

  function closeModal() {
    setModal({ open: false });
    setForm({ ...EMPTY });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isResponsable && form.role !== "employee") {
      toast({
        title: "Action refusée",
        description: "Un responsable peut créer seulement un employé.",
        variant: "destructive",
      });
      return;
    }

    if (modal.editing) {
      if (!isAdmin) {
        toast({
          title: "Action refusée",
          description: "Seul l'administrateur peut modifier un utilisateur.",
          variant: "destructive",
        });
        return;
      }

      const body = {
        username: form.username,
        fullName: form.fullName,
        role: form.role,
      };

      if (form.password) {
        body.password = form.password;
      }

      updateMut.mutate({
        id: modal.editing.id,
        body,
      });
    } else {
      createMut.mutate({
        username: form.username,
        fullName: form.fullName,
        password: form.password,
        role: isResponsable ? "employee" : form.role,
      });
    }
  }

  const filtered = users.filter((u) => {
    const fullName = u.fullName || u.name || "";
    const username = u.username || "";
    const role = u.role || "";

    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      username.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const isPending =
    createMut.isPending || updateMut.isPending || toggleStatusMut.isPending;

  if (isEmployee) {
    return (
      <div className="rounded-3xl bg-red-50 border border-red-100 p-6 text-red-700">
        <h1 className="text-2xl font-black">Accès refusé</h1>
        <p className="text-sm mt-2">
          Les employés n'ont pas accès à la version web.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-7 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-emerald-100 text-sm font-semibold">
              Administration
            </p>
            <h1 className="text-3xl font-black mt-1">Gestion des employés</h1>
            <p className="text-emerald-50/80 mt-2 max-w-2xl">
              Créer les comptes du personnel et gérer les accès selon les rôles.
            </p>
          </div>

          {canAdd && (
            <Button
              onClick={openCreate}
              className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl h-12 px-5 font-bold gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Nouvel employé
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const count = users.filter((u) => u.role === r.value).length;
          const Icon = r.icon;

          return (
            <Card
              key={r.value}
              className="rounded-3xl border-gray-100 shadow-sm"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${r.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-2xl font-black">{count}</p>
                  <p className="text-sm text-gray-500">{r.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isResponsable && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3 text-orange-800">
          <Lock className="w-5 h-5 mt-0.5" />
          <p className="text-sm">
            Vous êtes connecté comme <strong>Responsable</strong>. Vous pouvez
            créer seulement des employés. Vous ne pouvez pas modifier ni supprimer
            un utilisateur.
          </p>
        </div>
      )}

      <Card className="rounded-3xl border-gray-100 shadow-md overflow-hidden">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Liste des employés</h2>
              <p className="text-sm text-gray-500">
                {filtered.length} utilisateur(s) trouvé(s)
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un employé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun employé trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs">
                      Employé
                    </th>
                    <th className="text-left px-4 py-4 font-bold text-gray-500 uppercase text-xs">
                      Identifiant
                    </th>
                    <th className="text-left px-4 py-4 font-bold text-gray-500 uppercase text-xs">
                      Rôle
                    </th>
                    <th className="text-left px-4 py-4 font-bold text-gray-500 uppercase text-xs">
                      Statut
                    </th>
                    <th className="px-4 py-4 text-right font-bold text-gray-500 uppercase text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filtered.map((u) => {
                    const ri = roleInfo(u.role);
                    const Icon = ri.icon;
                    const fullName = u.fullName || u.name || u.username;
                    const isMe = u.id === me?.id;
                    const isActive = u.isActive ?? u.is_active ?? true;

                    return (
                      <tr key={u.id} className="hover:bg-emerald-50/40 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black">
                              {fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>

                            <div>
                              <p className="font-bold text-gray-900">
                                {fullName}
                              </p>

                              {isMe && (
                                <p className="text-xs text-emerald-700 font-semibold">
                                  Vous
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-xl">
                            {u.username}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            className={`border rounded-xl px-3 py-1 gap-1 ${ri.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {ri.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          {isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 rounded-xl px-3 py-1">
                              ● Actif
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200 rounded-xl px-3 py-1">
                              ● Inactif
                            </Badge>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canChangeStatus && !isMe && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={toggleStatusMut.isPending}
                                className="rounded-xl"
                                onClick={() =>
                                  toggleStatusMut.mutate({
                                    id: u.id,
                                    isActive: !isActive,
                                  })
                                }
                              >
                                {isActive ? (
                                  <>
                                    <PowerOff className="w-3.5 h-3.5 mr-1" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-3.5 h-3.5 mr-1" />
                                    Activer
                                  </>
                                )}
                              </Button>
                            )}

                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => openEdit(u)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}

                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isMe}
                                className="h-9 w-9 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                            {!canEdit && !canDelete && !canChangeStatus && (
                              <span className="text-xs text-gray-400">
                                Lecture seule
                              </span>
                            )}
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

      <Dialog open={modal.open} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {modal.editing ? "Modifier l'employé" : "Nouvel employé"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                placeholder="Jean Dupont"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Identifiant</Label>
              <Input
                placeholder="jean_dupont"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {modal.editing ? "Nouveau mot de passe" : "Mot de passe"}
              </Label>
              <Input
                type="password"
                placeholder={
                  modal.editing
                    ? "Laisser vide pour ne pas changer"
                    : "Mot de passe"
                }
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!modal.editing}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
                disabled={isResponsable}
              >
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {rolesForForm.map((r) => {
                    const Icon = r.icon;

                    return (
                      <SelectItem key={r.value} value={r.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {r.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {isResponsable && (
                <p className="text-xs text-orange-700">
                  Le rôle est fixé à Employé pour ce compte.
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-2xl"
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-emerald-700 hover:bg-emerald-800"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : modal.editing ? (
                  "Enregistrer"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte de{" "}
              <strong>
                {deleteTarget?.fullName || deleteTarget?.username}
              </strong>{" "}
              sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              {deleteMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
