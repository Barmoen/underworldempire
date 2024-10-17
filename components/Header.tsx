'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "./button"
import { LogOut, Skull } from "lucide-react"
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const Header = () => {
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
    })

    // Set up the clock
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }))
    }

    updateClock() // Initial update
    const timer = setInterval(updateClock, 1000)

    return () => {
      authListener.subscription.unsubscribe()
      clearInterval(timer)
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="bg-zinc-900 p-4 text-sm border-b border-zinc-800 sticky top-0 z-10">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Skull className="h-10 w-10 text-orange-500 mr-2 animate-pulse" />
          <span className="font-bold text-orange-500 text-2xl tracking-wider">UNDERWORLD EMPIRE</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-zinc-400">Velkommen, {user.user_metadata.username}</span>
              <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-400" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-1" />
                Logg ut
              </Button>
            </>
          ) : (
            <span className="text-zinc-400">Ikke logget inn</span>
          )}
        </div>
      </div>
      <div className="text-xs flex justify-between items-center">
        <span>Test tekst</span>
        <span className="text-orange-500">{currentTime}</span>
      </div>
    </header>
  )
}

export default React.memo(Header)
