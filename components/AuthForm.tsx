'use client'

import React, { useState } from 'react'
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Skull, AlertTriangle } from "lucide-react"
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription, AlertTitle } from "./alert"

interface FormData {
  email: string
  password: string
  username?: string
}

export default function AuthForm() {
  const { signUp, signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleAuth = async (type: 'login' | 'signup') => {
    setIsLoading(true)
    setAuthError(null)

    if (!formData.email || !formData.password || (type === 'signup' && !formData.username)) {
      setAuthError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      if (type === 'signup') {
        await signUp(formData.email, formData.password, formData.username!)
      } else {
        await signIn(formData.email, formData.password)
      }
    } catch (error) {
      setAuthError((error as Error).message || 'An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center mb-8">
        <Skull className="h-12 w-12 text-orange-500 mr-2" />
        <h1 className="text-3xl font-bold text-orange-500">UNDERWORLD EMPIRE</h1>
      </div>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Logg inn</TabsTrigger>
          <TabsTrigger value="signup">Registrer deg</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="Skriv din e-post"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Skriv passord"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <Button className="w-full" onClick={() => handleAuth('login')} disabled={isLoading}>
              {isLoading ? 'Logg inn...' : 'Logg inn'}
            </Button>
          </div>    
        </TabsContent>
        <TabsContent value="signup">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Brukernavn</Label>
              <Input
                id="username"
                type="text"
                placeholder="Velg et brukernavn"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="Skriv din e-post"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Velg et passord"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <Button className="w-full" onClick={() => handleAuth('signup')} disabled={isLoading}>
              {isLoading ? 'Registrerer deg...' : 'Registrer deg'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      {authError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feil</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
