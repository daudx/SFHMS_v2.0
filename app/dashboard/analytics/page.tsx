"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  ArrowLeft,
  Activity,
  Heart,
  Calendar,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [activities, setActivities] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, recordsRes] = await Promise.all([
          fetch("/api/fitness-activities"),
          fetch("/api/health-records"),
        ]);

        // Check if user is not authenticated
        if (activitiesRes.status === 401 || recordsRes.status === 401) {
          router.push("/auth/signup");
          return;
        }

        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          setActivities(data);
        }
        if (recordsRes.ok) {
          const data = await recordsRes.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-12 w-64 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalActivities = activities.length;
  const totalRecords = records.length;
  const totalCalories = activities.reduce(
    (sum: number, a: any) => sum + (a.calories_burned || 0),
    0
  );
  const avgCalories =
    totalActivities > 0 ? Math.round(totalCalories / totalActivities) : 0;
  const totalMinutes = activities.reduce(
    (sum: number, a: any) => sum + (a.duration_minutes || 0),
    0
  );
  const totalDistance = activities.reduce(
    (sum: number, a: any) => sum + (a.distance || 0),
    0
  );

  // Group activities by type
  const activityByType = activities.reduce((acc: any, activity: any) => {
    const type = activity.activity_type;
    if (!acc[type]) {
      acc[type] = { count: 0, calories: 0, minutes: 0 };
    }
    acc[type].count++;
    acc[type].calories += activity.calories_burned || 0;
    acc[type].minutes += activity.duration_minutes || 0;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              Analytics & Insights
            </h1>
            <p className="text-gray-600 mt-1">
              Get detailed health trends, statistics, and personalized insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Activities
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {totalActivities}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Health Records
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalRecords}
                  </p>
                </div>
                <Heart className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Calories
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {totalCalories}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Time
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {totalMinutes} min
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Breakdown */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Activity Breakdown
            </CardTitle>
            <CardDescription>Your activities organized by type</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(activityByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(activityByType).map(
                  ([type, data]: [string, any]) => (
                    <div
                      key={type}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{type}</h3>
                        <span className="text-sm text-gray-600">
                          {data.count} sessions
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Calories</p>
                          <p className="font-bold text-orange-600">
                            {data.calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Minutes</p>
                          <p className="font-bold text-blue-600">
                            {data.minutes}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg per Session</p>
                          <p className="font-bold text-emerald-600">
                            {Math.round(data.calories / data.count)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No activity data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Your overall fitness statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  Average Calories/Workout
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {avgCalories}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm font-medium">Total Distance</span>
                <span className="text-lg font-bold text-emerald-600">
                  {totalDistance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Active Minutes</span>
                <span className="text-lg font-bold text-purple-600">
                  {totalMinutes} min
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Health Overview</CardTitle>
              <CardDescription>Your wellness journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Medical Checkups</span>
                <span className="text-lg font-bold text-blue-600">
                  {totalRecords}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm font-medium">Fitness Sessions</span>
                <span className="text-lg font-bold text-emerald-600">
                  {totalActivities}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Activity Types</span>
                <span className="text-lg font-bold text-orange-600">
                  {Object.keys(activityByType).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
