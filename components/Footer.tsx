import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-500 text-xs p-4 mt-2 border-t border-zinc-800">
      <div className="flex justify-between items-center">
        <span>&copy; 2024 Underworld Empire. All rights reserved.</span>
        <div className="space-x-4">
          <Link href="/terms" className="hover:text-zinc-300 transition-colors duration-200">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors duration-200">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}