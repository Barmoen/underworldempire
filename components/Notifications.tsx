import React from 'react'
import { AlertTriangle, TrendingUp } from "lucide-react"

type Notification = {
  icon: React.ElementType;
  message: string;
  color: string;
}

const notifications: Notification[] = [
  {
    icon: AlertTriangle,
    message: "Your protection is expiring in 2 hours. Visit the Black Market to renew.",
    color: "text-yellow-500"
  },
  {
    icon: TrendingUp,
    message: "Your nightclub profits have increased by 15% this week!",
    color: "text-green-500"
  }
]

export default function Notifications() {
  return (
    <div>
      <h3 className="text-xl font-semibold mt-6 mb-3 border-b border-zinc-800 pb-2">Notifications</h3>
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-center space-x-2 bg-zinc-800 p-3 rounded-lg transition-colors duration-200 hover:bg-zinc-700">
            <notification.icon className={`${notification.color} flex-shrink-0`} />
            <span>{notification.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}