import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Progress } from "./progress"
import { useProfile } from '../hooks/useProfile'

export default function PlayerInfo() {
  const { profile, ranks, isLoading, calculateCurrentRank } = useProfile()
  const [localJailStatus, setLocalJailStatus] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      const updateJailStatus = () => {
        setLocalJailStatus(profile.jail_time ? 'I fengsel' : null)
      }

      updateJailStatus()
      const intervalId = setInterval(updateJailStatus, 1000)

      return () => clearInterval(intervalId)
    }
  }, [profile])

  if (isLoading || !profile || !ranks) {
    return <div>Laster...</div>
  }

  const currentRank = calculateCurrentRank(profile.experience)
  const nextRank = ranks.find(rank => rank.required_experience > profile.experience)
  
  const experienceToNextRank = nextRank 
    ? nextRank.required_experience - (currentRank?.required_experience || 0)
    : 100
  
  const experienceProgress = profile.experience - (currentRank?.required_experience || 0)

  return (
    <div className="w-64 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
      <div className="flex items-center mb-4">
        <Image
          src={profile.avatar_url || '/default-avatar.png'}
          alt={profile.username}
          width={50}
          height={50}
          className="rounded-full mr-3"
        />
        <div>
          <h3 className="text-xl font-bold text-orange-500">{profile.username}</h3>
          <p className="text-sm text-zinc-400">{currentRank?.name || 'Ingen rang'}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm mb-1">
            <span className="font-medium text-zinc-400">Experience: </span>
            <span className="text-yellow-500">
              {profile.experience} / {nextRank ? nextRank.required_experience : 'Max'}
            </span>
          </p>
          <Progress value={(experienceProgress / experienceToNextRank) * 100} className="h-2" />
        </div>
        <p className="text-sm">
          <span className="font-medium text-zinc-400">Liv: </span>
          <span className="text-red-500">{profile.health}%</span>
        </p>
        <p className="text-sm">
          <span className="font-medium text-zinc-400">Penger: </span>
          <span className="text-green-500">${profile.cash.toLocaleString()}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium text-zinc-400">Våpen: </span>
          <span className="text-zinc-300">{profile.equipped_weapon}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium text-zinc-400">Beskyttelse: </span>
          <span className="text-zinc-300">{profile.equipped_armor}</span>
        </p>
        {localJailStatus && (
          <p className="text-sm text-red-500 mt-2">
            {localJailStatus}
          </p>
        )}
        {profile.jail_time && (
          <p className="text-sm">
            <span className="font-medium text-zinc-400">Utbrytningssjanse: </span>
            <span className="text-blue-500">{profile.breakout_chance}%</span>
          </p>
        )}
      </div>
    </div>
  )
}
