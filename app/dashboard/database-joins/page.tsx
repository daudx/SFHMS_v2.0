"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, GitMerge, Info } from "lucide-react";

export default function DatabaseJoinsPage() {
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<Record<string, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  const viewsInfo = [
    {
      name: "vw_student_full_profile",
      title: "Student Full Profile",
      joinType: "INNER JOIN (3-way)",
      description:
        "Combines Student, HealthProfile, and User tables. Shows only students with complete profiles.",
      tables: ["Student", "HealthProfile", "User"],
    },
    {
      name: "vw_coach_student_overview",
      title: "Coach Student Overview",
      joinType: "LEFT JOIN (2 levels)",
      description:
        "Shows all coaches even if they don't have training plans. Demonstrates LEFT JOIN cascading.",
      tables: ["Coach", "TrainingPlan", "PlanDetail"],
    },
    {
      name: "vw_health_risk_alerts",
      title: "Health Risk Alerts",
      joinType: "INNER JOIN + CASE",
      description:
        "Uses INNER JOIN with CASE expressions and LIKE operator for pattern matching.",
      tables: ["Student", "HealthProfile"],
    },
    {
      name: "vw_upcoming_appointments",
      title: "Upcoming Appointments",
      joinType: "INNER JOIN (3-way)",
      description: "Joins Student, Nurse, and Appointment with date filtering.",
      tables: ["Appointment", "Student", "Nurse"],
    },
    {
      name: "vw_recent_fitness_activity",
      title: "Recent Fitness Activity",
      joinType: "INNER JOIN + WHERE",
      description: "Shows fitness logs from last 30 days with student details.",
      tables: ["FitnessLog", "Student"],
    },
    {
      name: "vw_student_goal_progress",
      title: "Student Goal Progress",
      joinType: "INNER JOIN + Calculations",
      description:
        "Tracks goals with calculated columns for progress tracking.",
      tables: ["Goal", "Student"],
    },
    {
      name: "vw_nurse_dashboard",
      title: "Nurse Dashboard",
      joinType: "LEFT JOIN + GROUP BY",
      description:
        "Aggregated statistics using LEFT JOIN with COUNT and conditional aggregation.",
      tables: ["Nurse", "MedicalRecord", "Appointment"],
    },
  ];

  useEffect(() => {
    const fetchViewData = async () => {
      try {
        setLoading(true);
        const viewData: Record<string, any[]> = {};

        for (const view of viewsInfo) {
          const response = await fetch(`/api/views/${view.name}`);
          if (response.ok) {
            const data = await response.json();
            viewData[view.name] = data.data || [];
          }
        }

        setViews(viewData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load view data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchViewData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database JOIN Demonstrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore different SQL JOIN types through interactive database views
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About Database JOINs</AlertTitle>
        <AlertDescription>
          This page demonstrates various JOIN operations used in the SFHMS
          database. Each view showcases different JOIN types (INNER, LEFT,
          OUTER) and advanced SQL features like aggregations, subqueries, and
          calculated columns. Navigate through tabs to see live data from each
          view.
        </AlertDescription>
      </Alert>

      {/* ERD Diagram Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Entity Relationship Diagram
          </CardTitle>
          <CardDescription>
            Visual representation of table relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">1:1 Relationships</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Student → HealthProfile</li>
                  <li>• User → Student/Coach/Nurse</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">1:M Relationships</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Student → FitnessLog</li>
                  <li>• Student → Goal</li>
                  <li>• Student → MedicalRecord</li>
                  <li>• Coach → TrainingPlan</li>
                  <li>• TrainingPlan → PlanDetail</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">M:M Relationships</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Coach ↔ FitnessLog (via CoachFitnessReview)</li>
                  <li>• Student ↔ Nurse (via Appointment)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Views Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>View Results</CardTitle>
          <CardDescription>
            Live data from database views demonstrating JOIN operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vw_student_full_profile" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
              {viewsInfo.map((view) => (
                <TabsTrigger
                  key={view.name}
                  value={view.name}
                  className="text-xs"
                >
                  {view.title.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {viewsInfo.map((view) => (
              <TabsContent
                key={view.name}
                value={view.name}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{view.title}</h3>
                    <Badge variant="outline">{view.joinType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {view.description}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground">
                      Tables:
                    </span>
                    {view.tables.map((table) => (
                      <Badge
                        key={table}
                        variant="secondary"
                        className="text-xs"
                      >
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : views[view.name]?.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(views[view.name][0]).map((key) => (
                            <TableHead key={key} className="font-semibold">
                              {key.replace(/_/g, " ").toUpperCase()}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {views[view.name].slice(0, 10).map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value: any, cellIdx) => (
                              <TableCell key={cellIdx}>
                                {value === null ? (
                                  <span className="text-muted-foreground italic">
                                    null
                                  </span>
                                ) : typeof value === "object" ? (
                                  JSON.stringify(value)
                                ) : (
                                  String(value)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No data available for this view
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
