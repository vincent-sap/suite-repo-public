import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextValue {
  isLoggedIn: boolean
  workspaceSelected: boolean
  signedOut: boolean
  login: () => void
  selectWorkspace: () => void
  logout: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('auth_loggedIn') === 'true')
  const [workspaceSelected, setWorkspaceSelected] = useState(() => localStorage.getItem('auth_workspaceSelected') === 'true')
  const [signedOut, setSignedOut] = useState(false)

  function login() {
    localStorage.setItem('auth_loggedIn', 'true')
    setIsLoggedIn(true)
    setWorkspaceSelected(false)
    setSignedOut(false)
    localStorage.removeItem('auth_workspaceSelected')
  }

  function selectWorkspace() {
    localStorage.setItem('auth_workspaceSelected', 'true')
    setWorkspaceSelected(true)
  }

  function logout() {
    localStorage.removeItem('auth_loggedIn')
    localStorage.removeItem('auth_workspaceSelected')
    setIsLoggedIn(false)
    setWorkspaceSelected(false)
    setSignedOut(false)
  }

  function signOut() {
    localStorage.removeItem('auth_loggedIn')
    localStorage.removeItem('auth_workspaceSelected')
    setIsLoggedIn(false)
    setWorkspaceSelected(false)
    setSignedOut(true)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, workspaceSelected, signedOut, login, selectWorkspace, logout, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
