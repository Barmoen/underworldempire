import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { PostgrestResponse } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  rank: string
  experience: number
  health: number
  cash: number
  stamina: number
  avatar_url: string
  weapon: string
  armor: string
  vehicle: string
  equipped_weapon: string
  equipped_armor: string
  is_in_jail: boolean
  jail_time: string | null
  breakout_chance: number
  jail_sentence: number
  last_activity_time: string | null
}

interface Rank {
  id: string
  name: string
  required_experience: number
  rank_bonus: number
}

interface JailActivity {
  id: string;
  name: string;
  description: string;
  chance_increase: number;
  cooldown_seconds: number;
  icon_name: string; // Add this line
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ranks, setRanks] = useState<Rank[]>([])
  const [jailActivities, setJailActivities] = useState<JailActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let profileSubscription: any

    async function fetchProfileData() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const [profileResponse, ranksResponse, jailActivitiesResponse] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('ranks').select('*').order('required_experience', { ascending: true }),
          supabase.from('jail_activities').select('*')
        ])

        if (profileResponse.error) throw profileResponse.error
        if (ranksResponse.error) throw ranksResponse.error
        if (jailActivitiesResponse.error) throw jailActivitiesResponse.error

        setProfile(profileResponse.data)
        setRanks(ranksResponse.data)
        setJailActivities(jailActivitiesResponse.data)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()

    if (user) {
      profileSubscription = supabase
        .channel('profile-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('Profile update received:', payload)
            setProfile(prevProfile => ({
              ...prevProfile!,
              ...payload.new,
            }))
          }
        )
        .subscribe()
    }

    return () => {
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription)
      }
    }
  }, [user])

  const calculateCurrentRank = (experience: number) => {
    return ranks
      .filter(rank => experience >= rank.required_experience)
      .sort((a, b) => b.required_experience - a.required_experience)[0]
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    let updatedData = { ...updates }

    // If experience is being updated, recalculate the rank
    if ('experience' in updates && ranks.length > 0) {
      const newRank = calculateCurrentRank(updates.experience!)
      if (newRank && newRank.name !== profile?.rank) {
        updatedData.rank = newRank.name
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Kunne ikke oppdatere profilen:', error)
    } else {
      // Explicitly type 'data' as Partial<Profile>
      const typedData = data as Partial<Profile>
      setProfile(prevProfile => prevProfile ? { ...prevProfile, ...typedData } : prevProfile)
      return typedData
    }
  }

  const addExperience = async (amount: number) => {
    console.log('Adding experience:', amount)
    if (!user || !profile) return

    const newExperience = profile.experience + amount
    
    // Find the highest rank the user qualifies for
    const newRank = ranks
      .filter(rank => newExperience >= rank.required_experience)
      .sort((a, b) => b.required_experience - a.required_experience)[0]

    const updates: Partial<Profile> = {
      experience: newExperience,
    }

    if (newRank && newRank.name !== profile.rank) {
      updates.rank = newRank.name
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Kunne ikke oppdatere erfaring:', error)
    } else {
      // Immediately update the local state
      setProfile(prevProfile => ({
        ...prevProfile!,
        ...updates,
      }))

      console.log('Updated profile:', { ...profile, ...updates })

      return {
        newRank: newRank && newRank.name !== profile.rank ? newRank.name : undefined,
      }
    }

    return {}
  }

  const calculateSuccessRate = (crimeSuccessRate: number, crimeDifficulty: number) => {
    const currentRank = ranks.find(rank => rank.name === profile?.rank);
    const rankBonus = currentRank ? currentRank.rank_bonus : 0;
    let adjustedSuccessRate = crimeSuccessRate + (rankBonus * 100) - (crimeDifficulty * 5);
    return Math.min(Math.max(adjustedSuccessRate, 5), 95); // Clamp between 5% and 95%
  }

  const checkJailStatus = () => {
    if (profile?.jail_time) {
      const releaseTime = new Date(profile.jail_time);
      if (releaseTime > new Date()) {
        return `I fengsel til ${releaseTime.toLocaleString()}`;
      } else {
        // Release from jail if time has passed
        updateProfile({ jail_time: null, jail_sentence: 0 });
        return null;
      }
    }
    return null;
  };

  const commitCrime = async (crimeId: string) => {
    if (!user || !profile) return null

    // Fetch the crime details
    const { data: crime, error: crimeError } = await supabase
      .from('crimes')
      .select('*')
      .eq('id', crimeId)
      .single()

    if (crimeError) {
      console.error('Kunne ikke hente kriminalitet:', crimeError)
      return null
    }

    const adjustedSuccessRate = calculateSuccessRate(crime.success_rate, crime.difficulty);
    const isSuccessful = Math.random() < adjustedSuccessRate / 100

    // Calculate rewards
    const experienceGained = isSuccessful ? crime.experience_reward : 0
    console.log('Erfaring å få:', experienceGained)

    const cashGained = isSuccessful ? Math.floor(Math.random() * (crime.max_reward - crime.min_reward + 1)) + crime.min_reward : 0

    let message = isSuccessful ? `Suksess! Du har gjennomført ${crime.name}!` : `Feil! Du klarte ikke å gjennomføre ${crime.name}.`
    let newRank

    if (isSuccessful) {
      const experienceResult = await addExperience(experienceGained)
      console.log('Erfaring result:', experienceResult)
      if (experienceResult?.newRank) {
        newRank = experienceResult.newRank
        message += ` Du har blitt oppgradert til ${newRank}!`
      }
    }

    let sentToJail = false;

    // Check for jail
    if (!isSuccessful) {
      const jailRoll = Math.random();
      if (jailRoll < crime.jail_risk) {
        const jailTime = new Date();
        jailTime.setMinutes(jailTime.getMinutes() + 30); // 30 minutes in jail

        await updateProfile({
          is_in_jail: true,
          jail_time: jailTime.toISOString(),
          breakout_chance: 10 // Reset to default
        });

        message += " Du ble oppdaget og sendt til fengsel!";
        sentToJail = true;
      }
    }

    // Update crime statistics
    const { data: statsData, error: statsError } = await supabase.rpc('update_crime_statistics', {
      p_user_id: user.id,
      p_success: isSuccessful,
      p_profit: cashGained
    })

    if (statsError) {
      console.error('Kunne ikke oppdatere kriminalitetstatistikk:', statsError)
    }

    // Update the profile in the database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        experience: isSuccessful ? profile.experience + experienceGained : profile.experience,
        cash: profile.cash + cashGained
      })
      .eq('id', user.id)
      .single()

    if (updateError) {
      console.error('Kunne ikke oppdatere profilen:', updateError)
      return null
    }

    // Update the local profile state
    setProfile(prevProfile => ({
      ...prevProfile!,
      ...(updatedProfile as Partial<Profile>)
    }))

    return {
      success: isSuccessful,
      experienceGained: isSuccessful ? experienceGained : 0,
      cashGained,
      message,
      newRank,
      sentToJail
    }
  }

  const buyWeapon = async (weaponId: string) => {
    if (!user || !profile) return null

    // Fetch the weapon details
    const { data: weapon, error: weaponError } = await supabase
      .from('items')
      .select('*')
      .eq('id', weaponId)
      .single()

    if (weaponError) {
      console.error('Kunne ikke hente utstyr:', weaponError)
      return null
    }

    // Check if the user has enough cash
    if (profile.cash < weapon.value) {
      return { success: false, message: 'Ikke nok penger' }
    }

    // Update the profile in the database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        cash: profile.cash - weapon.value,
        equipped_weapon: weapon.name
      })
      .eq('id', user.id)
      .single()

    if (updateError) {
      console.error('Kunne ikke oppdatere profilen:', updateError)
      return null
    }

    // Update the local profile state
    setProfile(prevProfile => ({
      ...prevProfile!,
      ...(updatedProfile as Partial<Profile>)
    }))

    return {
      success: true,
      message: `Suksess! Du har kjøpt og utstyrt ${weapon.name}!`
    }
  }

  const attemptBreakout = async () => {
    if (!profile) return null;

    const success = Math.random() < profile.breakout_chance / 100;

    if (success) {
      const updatedProfile = await updateProfile({ 
        is_in_jail: false, 
        jail_time: null, 
        jail_sentence: 0,
        breakout_chance: 10 // Reset to default
      });
      return { success: true, message: "Vellykket! Du er fri!", newJailTime: null, updatedProfile };
    } else {
      // Increase jail time by 30 minutes
      const newJailTime = new Date(profile.jail_time || new Date());
      newJailTime.setMinutes(newJailTime.getMinutes() + 30);

      const newChance = Math.max(profile.breakout_chance - 2, 5); // Decrease chance, minimum 5%
      const updatedProfile = await updateProfile({ 
        breakout_chance: newChance,
        jail_time: newJailTime.toISOString(),
        jail_sentence: Math.floor((newJailTime.getTime() - Date.now()) / 1000)
      });
      return { 
        success: false, 
        message: "Utbrytningsforsøk feilet. Du har fått en straff på 30 minutter.",
        newJailTime: newJailTime.toISOString(),
        newBreakoutChance: newChance,
        updatedProfile
      };
    }
  };

  const increaseBreakoutChance = async () => {
    if (!profile) return null;

    const newChance = Math.min(profile.breakout_chance + 5, 100);
    await updateProfile({ breakout_chance: newChance });
    return { success: true, message: "Utbrytersjanse økt" };
  };

  const performJailActivity = async (activityId: string) => {
    if (!profile) return null;

    const activity = jailActivities.find(a => a.id === activityId);
    if (!activity) return null;

    const now = new Date();
    if (profile.last_activity_time) {
      const lastActivity = new Date(profile.last_activity_time);
      const timeSinceLastActivity = (now.getTime() - lastActivity.getTime()) / 1000;
      if (timeSinceLastActivity < activity.cooldown_seconds) {
        return { success: false, message: `Du må vente ${Math.ceil((activity.cooldown_seconds - timeSinceLastActivity) / 60)} minutter før du kan gjøre dette igjen.` };
      }
    }

    const newChance = Math.min(profile.breakout_chance + activity.chance_increase, 100);
    const updatedProfile = await updateProfile({ 
      breakout_chance: newChance,
      last_activity_time: now.toISOString()
    });

    if (updatedProfile) {
      return { 
        success: true, 
        message: `Du har utført ${activity.name}. Utbrytersjanse økt med ${activity.chance_increase}%.`,
        newBreakoutChance: newChance
      };
    } else {
      return { success: false, message: "Kunne ikke utføre aktivitet. Prøv igjen." };
    }
  };

  return {
    profile,
    ranks,
    jailActivities,
    isLoading,
    updateProfile,
    addExperience,
    calculateSuccessRate,
    checkJailStatus,
    commitCrime,
    buyWeapon,
    attemptBreakout,
    increaseBreakoutChance,
    performJailActivity,
    calculateCurrentRank,
  }
}
