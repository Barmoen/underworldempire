import React from 'react'
import { Button } from "./button"
import { Zap, Users, Briefcase, Shield } from "lucide-react"

type QuickAction = {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "outline";
}

const actions: QuickAction[] = [
  { icon: Zap, label: "Commit Crime", variant: "default" },
  { icon: Users, label: "Gang Activity", variant: "outline" },
  { icon: Briefcase, label: "Manage Business", variant: "outline" },
  { icon: Shield, label: "Train Skills", variant: "outline" },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {actions.map((action, index) => (
        <Button 
          key={index}
          className="h-auto py-6 flex flex-col items-center transition-colors duration-200"
          variant={action.variant}
        >
          <action.icon className="h-8 w-8 mb-2" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  )
}