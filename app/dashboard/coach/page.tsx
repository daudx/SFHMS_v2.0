"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Users, TrendingUp, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

interface Student {
  STUDENTID: number;
  FIRSTNAME: string;
  LASTNAME: string;
  GENDER: string;
  DATEOFBIRTH: string;
  TOTALACTIVITIES: number;
  REVIEWSCOUNT: number;
  LASTACTIVITYDATE: string;
}

interface Review {
  REVIEWID: number;
  REVIEWDATE: string;
  REVIEWNOTES: string;
  STUDENTNAME: string;
  ACTIVITYTYPE: string;
  DURATIONMINUTES: number;
  CALORIESBURNED: number;
  LOGDATE: string;
}

interface TrainingPlan {
  PLANID: number;
  PLANNAME: string;
  DESCRIPTION: string;
  STARTDATE: string;
  ENDDATE: string;
}

export default function CoachDashboardPage() {
  const router = useRouter();
  const [coachId, setCoachId] = useState<number | null>(null);
  const [coachName, setCoachName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    reviewsCompleted: 0,
    upcomingSessions: 0,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    // Get user info from session
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "Coach") {
        toast.error("Access denied. Coach role required.");
        router.push("/dashboard");
        return;
      }

      // Use coachId from the user object (not userId)
      const coachIdToUse = user.coachId || user.userId;
      setCoachId(coachIdToUse);
      setCoachName(user.fullName);
      fetchAllData(coachIdToUse);
    } else {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, [router]);

  const fetchAllData = async (userId: number) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCoachStats(userId),
        fetchStudents(userId),
        fetchReviews(userId),
        fetchTrainingPlans(userId),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachStats = async (userId: number) => {
    try {
      console.log("[Coach Dashboard] Fetching stats for coach ID:", userId);
      const response = await fetch("/api/coach/stats", {
        headers: { "x-coach-id": userId.toString() },
      });
      const data = await response.json();
      console.log("[Coach Dashboard] Stats response:", data);
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error("[Coach Dashboard] Stats fetch failed:", data.error);
      }
    } catch (error) {
      console.error("Error fetching coach stats:", error);
    }
  };

  const fetchStudents = async (userId: number) => {
    try {
      console.log("[Coach Dashboard] Fetching students for coach ID:", userId);
      const response = await fetch("/api/coach/students", {
        headers: { "x-coach-id": userId.toString() },
      });
      const data = await response.json();
      console.log("[Coach Dashboard] Students response:", data);
      if (data.success) {
        setStudents(data.students);
      } else {
        console.error("[Coach Dashboard] Students fetch failed:", data.error);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchReviews = async (userId: number) => {
    try {
      const response = await fetch("/api/coach/reviews", {
        headers: { "x-coach-id": userId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchTrainingPlans = async (userId: number) => {
    try {
      const response = await fetch(`/api/training-plans?coachId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTrainingPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching training plans:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Dumbbell className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Dumbbell className="h-8 w-8" />
          Coach Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {coachName}! Manage your training programs and student progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Training Plans
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlans} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Under your guidance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reviews Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewsCompleted}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">My Students ({students.length})</TabsTrigger>
          <TabsTrigger value="plans">Training Plans ({trainingPlans.length})</TabsTrigger>
          <TabsTrigger value="reviews">Fitness Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
              <CardDescription>
                Students you're currently coaching (based on fitness reviews)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students assigned yet</p>
                  <p className="text-sm mt-2">
                    Start reviewing student fitness activities to build your roster
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.STUDENTID}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {student.FIRSTNAME} {student.LASTNAME}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          <span>📊 {student.TOTALACTIVITIES} activities</span>
                          <span>✅ {student.REVIEWSCOUNT} reviews</span>
                          {student.LASTACTIVITYDATE && (
                            <span>
                              🕒 Last activity:{" "}
                              {new Date(student.LASTACTIVITYDATE).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{student.GENDER}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Training Plans</CardTitle>
                <CardDescription>Workout programs you've created</CardDescription>
              </div>
              <Button onClick={() => router.push("/dashboard/training-plans")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </CardHeader>
            <CardContent>
              {trainingPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No training plans created yet</p>
                  <p className="text-sm mt-2">
                    Create your first training plan to get started
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/training-plans")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Training Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingPlans.map((plan) => (
                    <div
                      key={plan.PLANID}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{plan.PLANNAME}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.DESCRIPTION}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            📅 Start: {new Date(plan.STARTDATE).toLocaleDateString()}
                          </span>
                          {plan.ENDDATE && (
                            <span>
                              🏁 End: {new Date(plan.ENDDATE).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge>
                        {!plan.ENDDATE || new Date(plan.ENDDATE) >= new Date()
                          ? "Active"
                          : "Completed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Fitness Reviews</CardTitle>
              <CardDescription>
                Performance evaluations you've completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews completed yet</p>
                  <p className="text-sm mt-2">
                    Start reviewing student fitness activities
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.REVIEWID}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.STUDENTNAME}</p>
                          <p className="text-sm text-muted-foreground">
                            {review.ACTIVITYTYPE} •{" "}
                            {new Date(review.LOGDATE).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(review.REVIEWDATE).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                        <span>⏱️ {review.DURATIONMINUTES} min</span>
                        <span>🔥 {review.CALORIESBURNED} cal</span>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded">
                        {review.REVIEWNOTES}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
