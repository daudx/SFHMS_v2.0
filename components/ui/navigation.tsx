"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Menu, X } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 animate-slideInDown">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-scale">
            <Heart className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold gradient-text">HealthFit</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Dashboard
            </Link>
            <Link
              href="/dashboard/health-records"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Health
            </Link>
            <Link
              href="/dashboard/fitness-activities"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Fitness
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden hover-scale" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slideInDown">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/health-records"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Health Records
            </Link>
            <Link
              href="/dashboard/fitness-activities"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fitness Activities
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
