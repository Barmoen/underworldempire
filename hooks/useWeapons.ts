import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Weapon {
  id: string
  name: string
  description: string
  value: number
  damage: number
}

export function useWeapons() {
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWeapons() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'weapon')
        .order('value', { ascending: true })

      if (error) {
        console.error('Error fetching weapons:', error)
      } else {
        setWeapons(data)
      }

      setIsLoading(false)
    }

    fetchWeapons()
  }, [])

  return { weapons, isLoading }
}
