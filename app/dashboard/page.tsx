'use client'

import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import PlayerInfo from '../../components/PlayerInfo'
import QuickActions from '../../components/QuickActions'
import RecentActivity from '../../components/RecentActivity'
import Notifications from '../../components/Notifications'
import Footer from '../../components/Footer'

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { profile, isLoading: isProfileLoading, checkJailStatus } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth')
    }
  }, [isAuthLoading, user, router])

  useEffect(() => {
    if (!isProfileLoading && profile) {
      const jailStatus = checkJailStatus()
      if (jailStatus) {
        router.push('/fengsel')
      }
    }
  }, [isProfileLoading, profile, checkJailStatus, router])

  if (isAuthLoading || isProfileLoading) {
    return <div>Loading...</div>
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 p-2 space-x-2 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-zinc-900 p-4 overflow-auto rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold mb-6 text-orange-500 border-b border-zinc-800 pb-2">Dashboard</h2>
          <QuickActions />
          <RecentActivity />
          <Notifications />
        </main>
        <PlayerInfo />
      </div>
      <Footer />
    </div>
  )
}
