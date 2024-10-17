'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Lock, Unlock, AlertTriangle, Clock, Users, Dumbbell, Book } from "lucide-react"
import { useProfile } from '../../hooks/useProfile'
import Sidebar from '../../components/Sidebar'
import PlayerInfo from '../../components/PlayerInfo'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const iconMap = {
  Dumbbell: Dumbbell,
  Book: Book,
  Users: Users,
}

export default function JailPage() {
  const { 
    profile, 
    isLoading, 
    checkJailStatus, 
    attemptBreakout, 
    jailActivities, 
    performJailActivity,
    updateProfile
  } = useProfile()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isBreakingOut, setIsBreakingOut] = useState(false)
  const [breakoutResult, setBreakoutResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activityResults, setActivityResults] = useState<{[key: string]: { success: boolean; message: string } | null}>({})
  const [activityCooldowns, setActivityCooldowns] = useState<{[key: string]: number}>({})
  const router = useRouter()

  const jailStatus = checkJailStatus()

  useEffect(() => {
    if (!profile) return

    const updateTimeLeft = () => {
      if (profile.jail_time) {
        const releaseTime = new Date(profile.jail_time).getTime()
        const now = new Date().getTime()
        const difference = Math.max(0, releaseTime - now)
        setTimeLeft(Math.floor(difference / 1000))
        
        if (difference <= 0) {
          checkJailStatus()
        }
      }
    }

    updateTimeLeft() // Initial update
    const timer = setInterval(updateTimeLeft, 1000)

    // Set up real-time subscription
    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
        (payload) => {
          console.log('Profile update received:', payload)
          // Update the profile data
          updateProfile(payload.new)
          // Recalculate time left
          updateTimeLeft()
        }
      )
      .subscribe()

    return () => {
      clearInterval(timer)
      supabase.removeChannel(subscription)
    }
  }, [profile, checkJailStatus, updateProfile])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAttemptBreakout = async () => {
    setIsBreakingOut(true)
    setBreakoutResult(null)
    const result = await attemptBreakout()
    setIsBreakingOut(false)
    
    if (result) {
      setBreakoutResult({ success: result.success, message: result.message })
      if (result.success) {
        // Redirect to dashboard after successful breakout
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        // Force reload the page after failed attempt
        setTimeout(() => window.location.reload(), 2000)
      }
      // Remove the notification after 5 seconds
      setTimeout(() => setBreakoutResult(null), 5000)
    }
  }

  const handleJailActivity = async (activityId: string) => {
    const result = await performJailActivity(activityId);
    if (result) {
      setActivityResults(prev => ({
        ...prev,
        [activityId]: { success: result.success, message: result.message }
      }));
      if (result.success) {
        const activity = jailActivities.find(a => a.id === activityId);
        if (activity) {
          setActivityCooldowns(prevCooldowns => ({
            ...prevCooldowns,
            [activityId]: activity.cooldown_seconds
          }));
        }
      }
      // Remove the notification after 5 seconds
      setTimeout(() => {
        setActivityResults(prev => ({
          ...prev,
          [activityId]: null
        }));
      }, 1000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActivityCooldowns(prevCooldowns => {
        const newCooldowns = { ...prevCooldowns };
        Object.keys(newCooldowns).forEach(key => {
          if (newCooldowns[key] > 0) {
            newCooldowns[key] -= 1;
          }
        });
        return newCooldowns;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Laster inn...</div>
  }

  if (!profile) {
    return null
  }

  if (!jailStatus) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 p-2 space-x-2 overflow-hidden">
          <Sidebar />
          <main className="flex-1 bg-zinc-900 p-4 overflow-auto rounded-lg border border-zinc-800">
            <h2 className="text-3xl font-bold mb-6 text-orange-500 border-b border-zinc-800 pb-2">Fengsel</h2>
            <p className="text-xl text-green-500">Du er for øyeblikket ikke i fengsel. Nyt friheten!</p>
          </main>
          <PlayerInfo />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 p-2 space-x-2 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-zinc-900 p-4 overflow-auto rounded-lg border border-zinc-800">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-orange-500 flex items-center">
              <Lock className="mr-2 h-8 w-8" />
              I fengsel
            </h1>
            <p className="text-zinc-400 mt-2">Sitt tiden din, eller risiker alt med en vågal flukt.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-500">Tid igjen</CardTitle>
                <CardDescription>Tid til frihet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-6xl font-bold text-center">{formatTime(timeLeft)}</div>
                <Progress value={(timeLeft / (profile.jail_sentence || 3600)) * 100} className="w-full h-4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-zinc-500" />
                  <span className="text-sm text-zinc-500">Du sitter inne til: {new Date(profile.jail_time || '').toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-500">Utbrytningsforsøk</CardTitle>
                  <CardDescription>Risiker alt for frihet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Suksessrate:</span>
                    <span className="font-bold text-orange-500">{profile.breakout_chance}%</span>
                  </div>
                  <Progress value={profile.breakout_chance} className="w-full" />
                  <Button 
                    className={`w-full ${breakoutResult && !breakoutResult.success ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={handleAttemptBreakout} 
                    disabled={isBreakingOut || timeLeft === 0}
                  >
                    {isBreakingOut ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4 animate-spin" />
                        Bryter ut...
                      </>
                    ) : breakoutResult ? (
                      breakoutResult.message
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Bryt ut
                      </>
                    )}
                  </Button>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-zinc-500">
                    Varsel: Feilede forsøk vil minske suksessraten og øke fengselstiden.
                  </p>
                </CardFooter>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-orange-500">Fengselaktiviteter</CardTitle>
                  <CardDescription>Forbedre dine ferdigheter mens du sitter i fengsel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {jailActivities.map((activity) => (
                    <Button 
                      key={activity.id}
                      className="w-full justify-start" 
                      variant="outline" 
                      onClick={() => handleJailActivity(activity.id)}
                      disabled={activityCooldowns[activity.id] > 0}
                    >
                      {activityResults[activity.id] ? (
                        activityResults[activity.id]!.message
                      ) : (
                        <>
                          {iconMap[activity.icon_name as keyof typeof iconMap] && 
                            React.createElement(iconMap[activity.icon_name as keyof typeof iconMap], { className: "mr-2 h-4 w-4" })}
                          {activity.name} (+{activity.chance_increase}% Breakout Chance)
                          {activityCooldowns[activity.id] > 0 && (
                            <span className="ml-2 text-xs">
                              ({Math.ceil(activityCooldowns[activity.id] / 60)}m cooldown)
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-orange-950 border-orange-900">
                <CardHeader>
                  <CardTitle className="text-xl text-orange-500 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Fengselvarsel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-200">
                    Vaktene er på høy varselstatus på grunn av siste utbrytningsforsøk. Vær forsiktig.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <PlayerInfo />
      </div>
    </div>
  )
}
