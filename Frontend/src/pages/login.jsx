import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Fish,
  Grid2X2,
  Radio,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const user = await login(username, password);

        if (user?.role === "employee") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          setError("Les employés n'ont pas accès à la version web.");
          return;
        }

        if (user?.role !== "admin" && user?.role !== "manager") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          setError("Accès non autorisé.");
          return;
        }
      } catch (err) {
        setError(err.message || "Identifiants incorrects");
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAF7] overflow-hidden">
      {/* Partie gauche */}
      <section className="relative h-screen bg-[#062D2B] px-10 py-8 overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(27,122,76,0.35),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.16),transparent_28%)]" />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-40">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#021817] to-transparent" />
          <Fish className="absolute left-[30%] bottom-20 w-20 h-20 text-black/35" />
          <Fish className="absolute left-[55%] bottom-10 w-16 h-16 text-black/30" />
          <Fish className="absolute left-[70%] bottom-24 w-14 h-14 text-black/25" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-black">DA</span>
            </div>

            <div>
              <h1 className="text-white text-3xl font-black leading-none">
                DA
              </h1>
              <p className="text-white/70 text-lg mt-1">Gestion Aquacole</p>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white/75 text-base backdrop-blur-sm">
            <ShieldCheck className="text-emerald-500" size={22} />
            Plateforme sécurisée
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-5xl xl:text-6xl font-black leading-none">
            Ferme Divine
            <br />
            <span className="text-emerald-500">Alimentation</span>
          </h2>

          <p className="mt-6 text-white/75 text-lg leading-relaxed max-w-md">
            Plateforme de gestion et de suivi des étangs piscicoles. Réservée aux administrateur et gestionnaires autorisés.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Fish className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-white text-2xl font-black leading-none">
                    17
                  </p>
                  <p className="text-white/65 text-sm mt-1">Étangs</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Grid2X2 className="text-white" size={21} />
                </div>
                <div>
                  <p className="text-white text-2xl font-black leading-none">
                    A·B·C
                  </p>
                  <p className="text-white/65 text-sm mt-1">Secteurs</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Radio className="text-white" size={21} />
                </div>
                <div>
                  <p className="text-white text-2xl font-black leading-none">
                    live
                  </p>
                  <p className="text-white/65 text-sm mt-1">Temps réel</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          © 2026 Divine Alimentation — Gestion Aquacole
        </div>
      </section>

      {/* Partie droite */}
      <section className="relative h-screen bg-[#FAFBF8] flex items-center justify-center px-10 py-8 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-80">
          <div className="absolute bottom-0 left-0 w-44 h-40 rounded-tr-full bg-emerald-100/70" />
          <div className="absolute bottom-0 right-0 w-52 h-44 rounded-tl-full bg-emerald-100/70" />
          <Fish className="absolute bottom-8 left-[52%] w-12 h-12 text-emerald-300/70" />
          <Fish className="absolute bottom-12 left-[58%] w-10 h-10 text-emerald-300/70" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="text-center mb-7">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <span className="text-4xl">🔒</span>
            </div>

            <h2 className="text-4xl font-black text-gray-950">Connexion</h2>
            <p className="text-base text-gray-500 mt-2">
              Accès réservé aux administrateurs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Identifiant
              </label>

              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="nom_utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full h-14 rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-lg text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-14 rounded-xl border border-gray-300 bg-white pl-11 pr-12 text-lg text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700"
                >
                  {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700"
                />
                Se souvenir de moi
              </label>

              <button
                type="button"
                className="text-emerald-800 font-semibold hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-900/10 hover:from-emerald-900 hover:to-emerald-800 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <ArrowRight size={23} />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}