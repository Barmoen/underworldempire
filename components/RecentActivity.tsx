import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

type Activity = {
  time: string;
  action: string;
  result: string;
  profitLoss: string;
}

const recentActivities: Activity[] = [
  { time: "5 mins ago", action: "Bank Heist", result: "Success", profitLoss: "+$50,000" },
  { time: "20 mins ago", action: "Street Race", result: "Lost", profitLoss: "-$10,000" },
  { time: "1 hour ago", action: "Extortion", result: "Success", profitLoss: "+$25,000" },
  { time: "3 hours ago", action: "Gang War", result: "Victory", profitLoss: "+100 Respect" },
]

export default function RecentActivity() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 border-b border-zinc-800 pb-2">Recent Activity</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Profit/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentActivities.map((activity, index) => (
            <TableRow key={index}>
              <TableCell>{activity.time}</TableCell>
              <TableCell>{activity.action}</TableCell>
              <TableCell className={activity.result === "Success" || activity.result === "Victory" ? "text-green-500" : "text-red-500"}>
                {activity.result}
              </TableCell>
              <TableCell className="text-right">{activity.profitLoss}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}