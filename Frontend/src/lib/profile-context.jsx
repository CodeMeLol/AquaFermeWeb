import { createContext, useContext, useState } from 'react'

const ProfileContext = createContext(null)

const DEFAULT_PROFILE = {
  name: 'Administrateur',
  role: 'Responsable de ferme',
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('profile')
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE
    } catch {
      return DEFAULT_PROFILE
    }
  })

  function updateProfile(data) {
    const next = { ...profile, ...data }
    setProfile(next)
    localStorage.setItem('profile', JSON.stringify(next))
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile doit être utilisé dans <ProfileProvider>')
  return ctx
}
