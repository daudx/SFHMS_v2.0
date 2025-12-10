"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const [healthRecords, setHealthRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, activitiesRes] = await Promise.all([
          fetch("/api/health-records"),
          fetch("/api/fitness-activities"),
        ]);

        // Check if user is not authenticated
        if (recordsRes.status === 401 || activitiesRes.status === 401) {
          router.push("/auth/signup");
          return;
        }

        const records = await recordsRes.json();
        const activityData = await activitiesRes.json();

        setHealthRecords(records);
        setActivities(activityData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold animate-slideInLeft">Dashboard</h1>
          <p
            className="text-gray-600 mt-1 animate-slideInLeft"
            style={{ animationDelay: "0.1s" }}
          >
            Welcome back! Here's your health overview
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-premium p-6 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  Total Health Records
                </p>
                <p className="text-3xl font-bold mt-2">
                  {healthRecords.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div
            className="card-premium p-6 animate-scaleUp"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  Activities Logged
                </p>
                <p className="text-3xl font-bold mt-2">{activities.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div
            className="card-premium p-6 animate-scaleUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  Avg Calories Burned
                </p>
                <p className="text-3xl font-bold mt-2">
                  {activities.length > 0
                    ? Math.round(
                        activities.reduce(
                          (sum: number, a: any) =>
                            sum + (a.calories_burned || 0),
                          0
                        ) / activities.length
                      )
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Health Records */}
          <div className="card-premium p-6 animate-slideInLeft">
            <div className="flex justify-between items-center mb-6">
              <div>
                <CardTitle className="text-xl">Recent Health Records</CardTitle>
                <CardDescription>
                  Latest {Math.min(3, healthRecords.length)} entries
                </CardDescription>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {healthRecords.length > 0 ? (
              <div className="space-y-3">
                {healthRecords.slice(0, 3).map((record: any, idx: number) => (
                  <div
                    key={record.id}
                    className="p-4 bg-linear-to-r from-blue-50 to-transparent rounded-lg border border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-900">
                        {record.record_date}
                      </p>
                      <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold">
                        <ArrowUpRight className="w-3 h-3" /> Updated
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {record.notes || "No notes"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No health records yet</p>
              </div>
            )}
            <Button className="w-full mt-4 btn-animate" asChild>
              <a href="/dashboard/health-records">View All Records</a>
            </Button>
          </div>

          {/* Recent Activities */}
          <div className="card-premium p-6 animate-slideInRight">
            <div className="flex justify-between items-center mb-6">
              <div>
                <CardTitle className="text-xl">Recent Activities</CardTitle>
                <CardDescription>
                  Latest {Math.min(3, activities.length)} workouts
                </CardDescription>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 3).map((activity: any, idx: number) => (
                  <div
                    key={activity.id}
                    className="p-4 bg-linear-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-900">
                        {activity.activity_type}
                      </p>
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {activity.duration_minutes} min
                      </span>
                      <span>🔥 {activity.calories_burned} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No activities logged yet</p>
              </div>
            )}
            <Button className="w-full mt-4 btn-animate" asChild>
              <a href="/dashboard/fitness-activities">Log New Activity</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
