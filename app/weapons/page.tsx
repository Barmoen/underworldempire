'use client'

import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { useWeapons } from '../../hooks/useWeapons'
import Sidebar from '../../components/Sidebar'
import PlayerInfo from '../../components/PlayerInfo'
import { Button } from "../../components/button"
import { toast } from 'react-hot-toast'

export default function Weapons() {
  const { profile, isLoading: isProfileLoading, buyWeapon } = useProfile()
  const { weapons, isLoading: isWeaponsLoading } = useWeapons()
  const [isBuying, setIsBuying] = useState(false)

  if (isProfileLoading || isWeaponsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!profile) {
    return null
  }

  const handleBuyWeapon = async (weaponId: string) => {
    setIsBuying(true)
    const result = await buyWeapon(weaponId)
    setIsBuying(false)

    if (result) {
      toast(result.message, {
        icon: result.success ? '🎉' : '😢',
        duration: 3000,
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 p-2 space-x-2 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-zinc-900 p-4 overflow-auto rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold mb-6 text-orange-500 border-b border-zinc-800 pb-2">Weapons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weapons.map((weapon) => (
              <Button 
                key={weapon.id} 
                className="h-auto py-4 justify-start text-left flex flex-col items-start" 
                variant="outline"
                disabled={profile.cash < weapon.value || isBuying}
                onClick={() => handleBuyWeapon(weapon.id)}
              >
                <span className="text-lg font-semibold">{weapon.name}</span>
                <span className="text-sm text-zinc-400">{weapon.description}</span>
                <span className="text-sm mt-2">
                  Price: ${weapon.value.toLocaleString()} | 
                  Damage: {weapon.damage}
                </span>
              </Button>
            ))}
          </div>
        </main>
        <PlayerInfo />
      </div>
    </div>
  )
}
