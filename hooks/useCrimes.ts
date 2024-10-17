import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Crime {
  id: string
  name: string
  description: string
  min_reward: number
  max_reward: number
  experience_reward: number
  success_rate: number
  difficulty: number
  risk: 'Low' | 'Medium' | 'High'
}

export interface CrimeStatistics {
  totalCrimes: number
  successfulCrimes: number
  failedCrimes: number
  totalProfit: number
  averageProfit: number
}

export function useCrimes() {
  const { user } = useAuth()
  const [crimes, setCrimes] = useState<Crime[]>([])
  const [crimeStats, setCrimeStats] = useState<CrimeStatistics>({
    totalCrimes: 0,
    successfulCrimes: 0,
    failedCrimes: 0,
    totalProfit: 0,
    averageProfit: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchCrimeStats = useCallback(async () => {
    if (!user) return

    const { data: statsData, error: statsError } = await supabase.rpc('get_crime_statistics', { p_user_id: user.id })
    if (statsError) {
      console.error('Error fetching crime statistics:', statsError)
    } else if (statsData && statsData.length > 0) {
      setCrimeStats({
        totalCrimes: Number(statsData[0].total_crimes) || 0,
        successfulCrimes: Number(statsData[0].successful_crimes) || 0,
        failedCrimes: Number(statsData[0].failed_crimes) || 0,
        totalProfit: Number(statsData[0].total_profit) || 0,
        averageProfit: Number(statsData[0].average_profit) || 0,
      })
    }
  }, [user])

  useEffect(() => {
    async function fetchCrimesAndStats() {
      if (!user) return

      const { data: crimesData, error: crimesError } = await supabase
        .from('crimes')
        .select('*')
        .order('difficulty', { ascending: true })

      if (crimesError) {
        console.error('Error fetching crimes:', crimesError)
      } else {
        setCrimes(crimesData.map(crime => ({
          ...crime,
          risk: crime.difficulty <= 3 ? 'Low' : crime.difficulty <= 6 ? 'Medium' : 'High'
        })))
      }

      await fetchCrimeStats()

      setIsLoading(false)
    }

    fetchCrimesAndStats()
  }, [user, fetchCrimeStats])

  return { crimes, crimeStats, isLoading, fetchCrimeStats }
}
