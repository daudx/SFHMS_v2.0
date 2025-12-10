"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Activity, Heart, BarChart3, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 animate-slideInLeft">
            <Heart className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold gradient-text">HealthFit</span>
          </div>
          <div className="flex gap-3 animate-slideInRight">
            <Link href="/auth/login">
              <Button variant="ghost" className="hover-scale">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 btn-animate">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slideInLeft">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Welcome to HealthFit
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Transform Your <span className="gradient-text">Wellness</span>{" "}
              Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Track your health, monitor fitness progress, and achieve your
              wellness goals with our comprehensive platform designed for
              students.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 btn-animate text-white px-8 h-12 text-base">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  className="px-8 h-12 text-base hover-scale bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative animate-slideInRight">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-emerald-400 rounded-2xl blur-3xl opacity-20 animate-float"></div>
            <div className="relative bg-linear-to-br from-blue-500 to-emerald-500 rounded-2xl p-8 text-white shadow-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold opacity-90">
                    Health Metrics
                  </span>
                  <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Heart Rate</span>
                    <span className="font-bold">72 BPM</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2"></div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between">
                    <span>Daily Steps</span>
                    <span className="font-bold">8,234</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your health and fitness in one place
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div
            className="card-premium p-8 animate-scaleUp"
            style={{ animationDelay: "0s" }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Health Records</h3>
            <p className="text-gray-600 mb-6">
              Track medical checkups, vital signs, and comprehensive health data
              in one secure location.
            </p>
            <Link href="/dashboard/health-records">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 p-0 hover-scale"
              >
                View Records <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Feature 2 */}
          <div
            className="card-premium p-8 animate-scaleUp"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fitness Activities</h3>
            <p className="text-gray-600 mb-6">
              Log exercises, track workouts, and monitor your fitness progress
              with detailed analytics.
            </p>
            <Link href="/dashboard/fitness-activities">
              <Button
                variant="ghost"
                className="text-emerald-600 hover:text-emerald-700 p-0 hover-scale"
              >
                Log Activity <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Feature 3 */}
          <div
            className="card-premium p-8 animate-scaleUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Analytics & Insights</h3>
            <p className="text-gray-600 mb-6">
              Get detailed health trends, statistics, and personalized insights
              to guide your wellness journey.
            </p>
            <Link href="/dashboard/analytics">
              <Button
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 p-0 hover-scale"
              >
                View Analytics <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="card-premium p-12 text-center bg-linear-to-br from-blue-50 to-emerald-50 animate-fadeIn">
          <div className="mb-6 text-5xl">✨</div>
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students already tracking their wellness journey.
            Start your free account today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 btn-animate px-8 h-12 text-base">
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="px-8 h-12 text-base hover-scale bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="font-bold">HealthFit</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 HealthFit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
