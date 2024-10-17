// You can define shared types here
export type User = {
  id: string;
  username: string;
  email: string;
  rank: string;
  respect: number;
  health: number;
  cash: number;
  weapon: string;
  protection: string;
  jail_time: string | null;
  experience: number;
  avatar_url?: string;
  equipped_weapon: string;
  equipped_armor: string;
  breakout_chance?: number;
  // Add any other fields that are present in your profile data
}

export type Rank = {
  name: string;
  required_experience: number;
}

export type Crime = {
  id: string;
  name: string;
  difficulty: number;
  reward: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Add more types as needed
