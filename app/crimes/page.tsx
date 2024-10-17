'use client'

import React, { useState, useEffect } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { useCrimes, Crime } from '../../hooks/useCrimes'
import Sidebar from '../../components/Sidebar'
import PlayerInfo from '../../components/PlayerInfo'
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import { Separator } from "../../components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Badge } from "../../components/badge"
import { Skull, AlertTriangle } from "lucide-react"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CrimesPage() {
  const { profile, isLoading: isProfileLoading, commitCrime, calculateSuccessRate, checkJailStatus } = useProfile()
  const { crimes, crimeStats, isLoading: isCrimesLoading, fetchCrimeStats } = useCrimes()
  const [isCommitting, setIsCommitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (profile && checkJailStatus()) {
      router.push('/fengsel')
    }
  }, [profile, router, checkJailStatus])

  if (isProfileLoading || isCrimesLoading) {
    return <div className="flex items-center justify-center h-screen">Laster inn...</div>
  }

  if (!profile) {
    return null
  }

  const handleCommitCrime = async (crime: Crime) => {
    setIsCommitting(true)
    const result = await commitCrime(crime.id)
    setIsCommitting(false)

    if (result) {
      toast(result.message, {
        icon: result.success ? '🎉' : '😢',
        duration: 3000,
      })

      // Fetch updated crime stats after committing a crime
      await fetchCrimeStats()

      if (result.sentToJail) {
        router.push('/fengsel')
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 p-2 space-x-2 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-zinc-900 p-4 overflow-auto rounded-lg border border-zinc-800">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-orange-500 flex items-center">
              <Skull className="mr-2 h-8 w-8" />
              Kriminalitet
            </h1>
            <p className="text-zinc-400 mt-2">Velg din kriminelle aktivitet, straffene kan være alvorlige.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-500">Tilgjengelige kriminaliteter</CardTitle>
                <CardDescription>Velg en kriminalitet å utføre</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kriminalitet</TableHead>
                      <TableHead>Suksessrate</TableHead>
                      <TableHead>Beløp</TableHead>
                      <TableHead>Sannsynlighet</TableHead>
                      <TableHead>Handling</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crimes.map((crime) => (
                      <TableRow key={crime.id}>
                        <TableCell className="font-medium">{crime.name}</TableCell>
                        <TableCell>
                          <Progress value={calculateSuccessRate(crime.success_rate, crime.difficulty)} className="w-[60px]" />
                          <span className="ml-2 text-sm">{calculateSuccessRate(crime.success_rate, crime.difficulty).toFixed(1)}%</span>
                        </TableCell>
                        <TableCell>${crime.min_reward} - ${crime.max_reward}</TableCell>
                        <TableCell>
                          <Badge variant={crime.risk === 'Low' ? 'secondary' : crime.risk === 'Medium' ? 'default' : 'destructive'}>
                            {crime.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCommitCrime(crime)}
                            disabled={isCommitting}
                          >
                            Utfør kriminalitet
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-500">Kriminalitetstatistikk</CardTitle>
                  <CardDescription>Din kriminelle historie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Totale kriminaliteter:</span>
                    <span className="font-bold">{crimeStats.totalCrimes}</span>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span>Suksess:</span>
                    <span className="font-bold text-green-500">{crimeStats.successfulCrimes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mislykket:</span>
                    <span className="font-bold text-red-500">{crimeStats.failedCrimes}</span>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span>Suksessrate:</span>
                    <span className="font-bold text-orange-500">
                      {crimeStats.totalCrimes > 0
                        ? ((crimeStats.successfulCrimes / crimeStats.totalCrimes) * 100).toFixed(1)
                        : '0'}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-500">Profitt
                  </CardTitle>
                  <CardDescription>Din illgjennomførte fortjeneste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total fortjeneste:</span>
                    <span className="font-bold text-green-500">${crimeStats.totalProfit.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span>Gjennomsnittlig fortjeneste:</span>
                    <span className="font-bold text-green-500">${crimeStats.averageProfit.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-950 border-orange-900">
                <CardHeader>
                  <CardTitle className="text-xl text-orange-500 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Kriminalitetvarsel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-200">
                    Politiets aktivitet er høy i sentrum. Vurder å holde deg unna for en stund.
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
