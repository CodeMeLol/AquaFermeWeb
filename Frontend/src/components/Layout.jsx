import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  LayoutDashboard,
  Waves,
  ClipboardList,
  Users,
  Fish,
  ShoppingCart,
  BarChart2,
  BellRing,
  ScrollText,
  Settings,
  FlaskConical,
  Droplets,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Search,
  Sun,
  ShoppingBag,
  CheckCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "ponds", label: "Étangs", icon: Waves },
  { id: "operations", label: "Opérations", icon: FlaskConical },
  { id: "water-quality", label: "Qualité de l'eau", icon: Droplets },
  { id: "tasks", label: "Tâches", icon: ClipboardList },
  { id: "fish-orders", label: "Commandes poissons", icon: Fish },
  { id: "supply-orders", label: "Commandes fournitures", icon: ShoppingCart },
  { id: "sales", label: "Ventes", icon: ShoppingBag },
  { id: "statistics", label: "Statistiques", icon: BarChart2 },
  { id: "alerts", label: "Alertes", icon: BellRing },
  { id: "logs", label: "Journaux", icon: ScrollText },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "settings", label: "Paramètres", icon: Settings },
];

function canViewItem(role, itemId) {
  // Administrateur : accès à tout
  if (role === "admin") {
    return true;
  }

  // Responsable : accès à tout sauf statistiques
  if (role === "manager") {
    return itemId !== "statistics";
  }


  return false;
}

function roleLabel(role) {
  if (role === "admin") return "Administrateur";
  if (role === "manager") return "Responsable";

  return "Utilisateur";
}

export function Layout({ children, route, setRoute }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/notifications"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/notifications");
      return data.notifications || data || [];
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = useMutation({
    mutationFn: () => apiRequest("PATCH", "/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/notifications"] });
    },
  });

  const role = user?.role;
  const visibleItems = NAV_ITEMS.filter((item) => canViewItem(role, item.id));
  const currentItem = NAV_ITEMS.find((n) => n.id === route);

  function navigate(id) {
    setRoute(id);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#072D2B] text-white transition-all duration-300 md:relative md:flex",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 flex items-center justify-center shrink-0 shadow-lg">
              <Fish className="w-6 h-6 text-white" />
            </div>

            {!collapsed && (
              <div>
                <p className="font-black text-xl leading-none">DA</p>
                <p className="text-white/50 text-xs mt-1">Gestion Aquacole</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((value) => !value)}
            className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {visibleItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              title={collapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                route === id
                  ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/20"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div
            className={cn(
              "rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3",
              collapsed && "justify-center p-2"
            )}
          >
            <div className="w-11 h-11 rounded-full bg-emerald-700 flex items-center justify-center font-black">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">
                  {user?.name || "Utilisateur"}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {roleLabel(role)}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn(
              "mt-3 w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/60 hover:bg-red-500/10 hover:text-red-300 transition",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-7">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-black text-[#0F172A]">
                {currentItem?.label ?? "Page inconnue"}
              </h1>
              <p className="text-sm text-gray-500">
                Bienvenue, {user?.name || "utilisateur"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Rechercher..."
                className="w-80 h-12 rounded-2xl border border-gray-100 bg-[#F8FAF7] pl-12 pr-4 outline-none focus:border-emerald-600"
              />
            </div>

            <button className="w-12 h-12 rounded-2xl bg-[#F8FAF7] flex items-center justify-center text-gray-600 hover:text-emerald-700">
              <Sun className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((value) => !value)}
                className="relative w-12 h-12 rounded-2xl bg-[#F8FAF7] flex items-center justify-center text-gray-600 hover:text-emerald-700"
              >
                <BellRing className="w-5 h-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 z-[9999] overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">
                        Notifications
                      </p>
                      <p className="text-xs text-gray-500">
                        {unreadCount} non lue(s)
                      </p>
                    </div>

                    <button
                      onClick={() => markAllAsRead.mutate()}
                      className="text-xs text-emerald-700 font-bold flex items-center gap-1"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Tout lire
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-4 border-b last:border-b-0 text-sm",
                            !notif.is_read
                              ? "bg-emerald-50/70"
                              : "bg-white"
                          )}
                        >
                          <p className="font-semibold text-slate-800">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.created_at
                              ? new Date(notif.created_at).toLocaleString(
                                  "fr-FR"
                                )
                              : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-7">{children}</main>
      </div>
    </div>
  );
}