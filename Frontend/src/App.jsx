import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/lib/theme-context'
import { LanguageProvider } from '@/lib/language-context'
import { ProfileProvider } from '@/lib/profile-context'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'

import { Layout } from '@/components/Layout'

import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import PondsPage from '@/pages/ponds'
import TasksPage from '@/pages/tasks'
import UsersPage from '@/pages/users'
import FishOrdersPage from '@/pages/fish-orders'
import SupplyOrdersPage from '@/pages/supply-orders'
import StatisticsPage from '@/pages/statistics'
import AlertsPage from '@/pages/alerts'
import LogsPage from '@/pages/logs'
import SettingsPage from '@/pages/settings'
import OperationsPage from '@/pages/operations'
import WaterQualityPage from '@/pages/water-quality'
import NotFoundPage from '@/pages/not-found'
import SalesPage from '@/pages/sales'

import { useState } from 'react'

const ROUTES = {
  dashboard: DashboardPage,
  ponds: PondsPage,
  tasks: TasksPage,
  users: UsersPage,
  'fish-orders': FishOrdersPage,
  'supply-orders': SupplyOrdersPage,
  statistics: StatisticsPage,
  alerts: AlertsPage,
  logs: LogsPage,
  settings: SettingsPage,
  operations: OperationsPage,
  'water-quality': WaterQualityPage,
  'sales': SalesPage,
}

function AppRouter() {
  const { user } = useAuth()
  const [route, setRoute] = useState('dashboard')

  if (!user) return <LoginPage />

  const Page = ROUTES[route] ?? NotFoundPage

  return (
    <Layout route={route} setRoute={setRoute}>
      <Page />
      <Toaster />
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ProfileProvider>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </ProfileProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
