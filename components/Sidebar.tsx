'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "./button"
import { Home, Cctv, Briefcase, Building2, TrendingUp, ShoppingBag, Car, Sword, Swords, Dices, Flag, Trophy, Award, Heart, Columns4 } from "lucide-react"

type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
}

type MenuCategory = {
  name: string;
  items: MenuItem[];
}

const menuCategories: MenuCategory[] = [
  {
    name: 'MAIN',
    items: [
      { icon: Home, label: 'Hjemmeside', href: '/dashboard' },
    ]
  },
  {
    name: 'KRIMINALITET',
    items: [
      { icon: Cctv, label: 'Kriminalitet', href: '/crimes' },
      { icon: Columns4, label: 'Fengsel', href: '/fengsel' },
    ]
  },
  {
    name: 'BEDRIFTER',
    items: [
      { icon: Briefcase, label: 'Bedrifter', href: '/business' },
      { icon: Building2, label: 'Eiendommer', href: '/properties' },
      { icon: TrendingUp, label: 'Investeringer', href: '/investments' },
    ]
  },
  {
    name: 'SHOPPING',
    items: [
      { icon: ShoppingBag, label: 'Svartemarked', href: '/black-market' },
      { icon: Car, label: 'Biler', href: '/vehicles' },
      { icon: Sword, label: 'Våpen', href: '/weapons' },
    ]
  },
  {
    name: 'UNDERHOLDNING',
    items: [
      { icon: Dices, label: 'Kasino', href: '/casino' },
      { icon: Swords, label: 'Fight Club', href: '/fight-club' },
      { icon: Flag, label: 'Gateløp', href: '/street-races' },
    ]
  },
  {
    name: 'ANNET',
    items: [
      { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
      { icon: Award, label: 'Achievements', href: '/achievements' },
      { icon: Heart, label: 'Hospital', href: '/hospital' },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-48 bg-zinc-900 p-2 overflow-y-auto rounded-lg border border-zinc-800">
      {menuCategories.map((category, index) => (
        <div key={category.name} className={index !== 0 ? 'mt-4' : ''}>
          <h3 className="text-xs font-semibold text-zinc-500 mb-2">{category.name}</h3>
          <div className="space-y-1">
            {category.items.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm transition-colors duration-200 ${
                    pathname === item.href ? 'bg-zinc-800' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
