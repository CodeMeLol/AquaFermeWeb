import { useState } from "react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/use-tasks";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalIcon,
  User,
  ListTodo,
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/auth-context";

const taskSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  task_date: z.string().min(1, "La date est requise"),
  priority: z.string().min(1, "La priorité est requise"),
  assigned_to: z.string().optional(),
  pond_id: z.string().optional(),
});

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { user: me } = useAuth();

  const isResponsable = me?.role === "manager";

  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { data: usersData } = useQuery({
    queryKey: ["/users"],
    queryFn: () => apiRequest("GET", "/users"),
  });

  const { data: ponds = [] } = useQuery({
    queryKey: ["/ponds"],
    queryFn: () => apiRequest("GET", "/ponds"),
  });

  const users = Array.isArray(usersData)
  ? usersData
  : usersData?.users || [];

const assignableUsers = isResponsable
  ? users.filter(
      (u) =>
        u.role === "employee" ||
        u.id === me?.id
    )
  : users;

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      task_date: new Date().toISOString().slice(0, 10),
      priority: "moyenne",
      assigned_to: "",
      pond_id: "",
    },
  });

  function openCreateModal() {
    setEditingTask(null);
    form.reset({
      title: "",
      description: "",
      task_date: new Date().toISOString().slice(0, 10),
      priority: "moyenne",
      assigned_to: "",
      pond_id: "",
    });
    setOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    form.reset({
      title: task.title || "",
      description: task.description || "",
      task_date: task.task_date
        ? new Date(task.task_date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      priority: task.priority || "moyenne",
      assigned_to: task.assigned_to ? String(task.assigned_to) : "",
      pond_id: task.pond_id ? String(task.pond_id) : "",
    });
    setOpen(true);
  }

  function onSubmit(data) {
    const body = {
      title: data.title,
      description: data.description || null,
      task_date: data.task_date,
      priority: data.priority,
      assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
      pond_id: data.pond_id ? Number(data.pond_id) : null,
    };

    if (editingTask) {
      updateTask.mutate(
        {
          id: editingTask.id,
          body,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setEditingTask(null);
            form.reset();
          },
        }
      );
    } else {
      createTask.mutate(
        {
          ...body,
          status: "pending",
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
          },
        }
      );
    }
  }

  function toggleStatus(id, currentStatus) {
    updateTask.mutate({
      id,
      status: currentStatus === "completed" ? "pending" : "completed",
    });
  }

  function handleDelete(task) {
    const ok = window.confirm(`Voulez-vous supprimer la tâche "${task.title}" ?`);
    if (!ok) return;
    deleteTask.mutate(task.id);
  }

  const pendingTasks = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.task_date) - new Date(b.task_date));

  const completedTasks = tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.task_date) - new Date(a.task_date));

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg relative overflow-hidden">
        <ListTodo className="absolute right-8 top-4 w-40 h-40 opacity-10" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-xs font-black uppercase">
              Édjofêh
            </p>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Planning & Tâches
            </h1>
            <p className="text-emerald-50/80 text-sm mt-2">
              Créer, attribuer et suivre les tâches de la ferme.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateModal}
                className="rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 h-11 px-5 font-bold text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[460px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">
                  {editingTask ? "Modifier la tâche" : "Ajouter une tâche"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    {...form.register("title")}
                    placeholder="Ex: Nourrir l'étang A1"
                    className="rounded-2xl h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date prévue</Label>
                    <Input
                      type="date"
                      {...form.register("task_date")}
                      className="rounded-2xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priorité</Label>
                    <select
                      {...form.register("priority")}
                      className="w-full h-11 rounded-2xl border px-3 text-sm"
                    >
                      <option value="haute">Haute</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="basse">Basse</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Attribuer à</Label>
                    <select
                      {...form.register("assigned_to")}
                      className="w-full h-11 rounded-2xl border px-3 text-sm"
                    >
                      <option value="">Non assignée</option>
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.name || u.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Étang</Label>
                    <select
                      {...form.register("pond_id")}
                      className="w-full h-11 rounded-2xl border px-3 text-sm"
                    >
                      <option value="">Aucun</option>
                      {ponds.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    {...form.register("description")}
                    className="rounded-2xl resize-none text-sm"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createTask.isPending || updateTask.isPending}
                  className="w-full rounded-2xl h-11 bg-emerald-700 hover:bg-emerald-800"
                >
                  {editingTask
                    ? updateTask.isPending
                      ? "Modification..."
                      : "Modifier la tâche"
                    : createTask.isPending
                    ? "Création..."
                    : "Créer la tâche"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="À faire" value={pendingTasks.length} icon={Clock} color="bg-orange-50 text-orange-700" />
        <StatCard title="Terminées" value={completedTasks.length} icon={CheckCircle2} color="bg-emerald-50 text-emerald-700" />
        <StatCard title="Total" value={tasks.length} icon={ListTodo} color="bg-blue-50 text-blue-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskColumn
          title="À faire"
          icon={Clock}
          tasks={pendingTasks}
          users={users}
          ponds={ponds}
          loading={isLoading}
          onToggle={toggleStatus}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />

        <TaskColumn
          title="Terminées"
          icon={CheckCircle2}
          tasks={completedTasks}
          users={users}
          ponds={ponds}
          loading={isLoading}
          onToggle={toggleStatus}
          onEdit={openEditModal}
          onDelete={handleDelete}
          completed
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase">{title}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function TaskColumn({
  title,
  icon: Icon,
  tasks,
  users,
  ponds,
  loading,
  onToggle,
  onEdit,
  onDelete,
  completed,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-2">
        <Icon className="w-5 h-5 text-emerald-700" />
        <h2 className="text-lg font-black">{title}</h2>
        <span className="ml-auto text-xs text-gray-500">{tasks.length}</span>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Aucune tâche.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              users={users}
              ponds={ponds}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              completed={completed}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, users, ponds, onToggle, onEdit, onDelete, completed }) {
  const assignedUser = users.find((u) => u.id === task.assigned_to);
  const pond = ponds.find((p) => p.id === task.pond_id);

  return (
    <div className={`flex gap-3 p-4 rounded-2xl border shadow-sm ${completed ? "bg-gray-50 opacity-75" : "bg-white"}`}>
      <button
        onClick={() => onToggle(task.id, task.status)}
        className={completed ? "text-emerald-600" : "text-gray-400 hover:text-emerald-700"}
        title={completed ? "Remettre en attente" : "Marquer comme terminée"}
      >
        {completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1">
        <h4 className={`font-bold text-sm ${completed ? "line-through text-gray-500" : "text-gray-900"}`}>
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge icon={CalIcon}>
            {format(new Date(task.task_date), "dd MMM yyyy", { locale: fr })}
          </Badge>

          {assignedUser && (
            <Badge icon={User}>
              {assignedUser.fullName || assignedUser.name || assignedUser.username}
            </Badge>
          )}

          {pond && <Badge>{pond.name}</Badge>}

          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${priorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Modifier
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-gray-100 text-gray-600">
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

function priorityClass(priority) {
  if (priority === "haute") return "bg-red-50 text-red-700";
  if (priority === "moyenne") return "bg-orange-50 text-orange-700";
  return "bg-emerald-50 text-emerald-700";
}