# AquaFerme Web — Interface d'Administration

Application web d'administration pour la gestion d'une ferme aquacole (projet **Édjofêh / Ferme Divine Alimentation**).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, JavaScript (JSX), Vite 8 |
| Gestion d'état / requêtes | @tanstack/react-query 5 |
| Formulaires | react-hook-form + zod + @hookform/resolvers |
| UI | Radix UI (primitives) + Tailwind CSS 3 |
| Graphiques | recharts 2 |
| Icônes | lucide-react |
| Dates | date-fns 4 (locale fr) |
| Utilitaires CSS | clsx + tailwind-merge + class-variance-authority |
| Package manager | **pnpm** |

---

## Structure du projet

```
AquaFerme_Web/
├── Frontend/
│   └── src/
│       ├── main.jsx                  # Point d'entrée React
│       ├── App.jsx                   # Providers + routeur
│       ├── index.css                 # Tailwind + variables CSS (dark mode)
│       ├── components/
│       │   └── ui/                   # Composants shadcn/ui (Button, Card, Dialog…)
│       ├── hooks/
│       │   ├── use-ponds.js          # CRUD étangs
│       │   ├── use-tasks.js          # CRUD tâches
│       │   ├── use-operations.js     # Opérations terrain
│       │   ├── use-water-quality.js  # Relevés eau
│       │   └── use-geolocation.js    # Vérification présence GPS sur site
│       ├── lib/
│       │   ├── queryClient.js        # QueryClient + apiRequest()
│       │   ├── auth-context.jsx      # Authentification
│       │   ├── theme-context.jsx     # Thème light/dark/system
│       │   ├── language-context.jsx  # Langue fr/en
│       │   ├── profile-context.jsx   # Profil utilisateur
│       │   └── utils.js              # cn() — fusion de classes Tailwind
│       └── pages/                    # Pages de l'application (voir ci-dessous)
├── server/                           # Backend Express (à développer)
├── shared/                           # Schémas partagés client/serveur (à développer)
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env                              # Variables d'environnement (ne pas committer)
```

### Pages disponibles

| Fichier | Description |
|---|---|
| `login.jsx` | Authentification avec comptes démo |
| `dashboard.jsx` | Tableau de bord — KPIs et graphiques d'occupation |
| `ponds.jsx` | Gestion des étangs (par groupe A/B/C) |
| `fish-orders.jsx` | Commandes d'alevins / géniteurs |
| `supply-orders.jsx` | Commandes de produits (aliment, traitement, matériel…) |
| `tasks.jsx` | Planification des tâches |
| `users.jsx` | Gestion des employés |
| `operations.jsx` | Opérations terrain (contrôle, mortalité, transfert, ajout) |
| `water-quality.jsx` | Relevés de qualité de l'eau |
| `statistics.jsx` | Statistiques et rapports financiers |
| `alerts.jsx` | Alertes automatiques (surcharge, retards, commandes) |
| `logs.jsx` | Journal d'activité et informations système |
| `settings.jsx` | Paramètres (thème, langue, profil) |
| `not-found.jsx` | Page 404 |

---

## Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Build de production
pnpm build

# Prévisualiser le build
pnpm preview
```

> L'application tourne par défaut sur **http://localhost:5173**

---

## Variables d'environnement

Copier `.env` et le renommer `.env.local` pour les surcharges locales (ignoré par git).

| Variable | Valeur par défaut | Rôle |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | URL du backend Express |
| `VITE_APP_NAME` | `AquaFerme Web` | Nom affiché dans l'interface |
| `NODE_ENV` | `development` | Mode d'exécution |

> Les variables Vite **doivent** commencer par `VITE_` pour être accessibles côté client via `import.meta.env`.

---

## Alias de chemin

L'alias `@/` pointe vers `Frontend/src/`. Exemple :

```js
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/queryClient"
```

---

## Conventions

- Tout le code est en **JavaScript** (pas TypeScript).
- Les fichiers de pages et composants React sont en `.jsx`.
- Les appels API passent par `@/lib/queryClient` (`apiRequest` + `queryClient`).
- Les contextes globaux (`auth`, `theme`, `language`, `profile`) sont dans `@/lib/`.
- Le dark mode est géré via la classe `.dark` sur `<html>` (Tailwind `darkMode: 'class'`).
- Les variables CSS Tailwind (`--primary`, `--background`…) sont définies dans `index.css`.

