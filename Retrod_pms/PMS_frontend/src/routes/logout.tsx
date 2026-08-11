import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEffect } from 'react'

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
})

function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return <Navigate to="/login" replace />
}
