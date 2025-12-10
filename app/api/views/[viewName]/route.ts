import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ viewName: string }> }
) {
  let connection;

  try {
    const { viewName } = await params;

    // Validate view name to prevent SQL injection
    const allowedViews = [
      "vw_student_full_profile",
      "vw_coach_student_overview",
      "vw_health_risk_alerts",
      "vw_upcoming_appointments",
      "vw_recent_fitness_activity",
      "vw_student_goal_progress",
      "vw_nurse_dashboard",
    ];

    if (!allowedViews.includes(viewName)) {
      return NextResponse.json(
        { error: "Invalid view name" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM ${viewName}`,
      [],
      {
        outFormat: 4001, // OBJECT format
        maxRows: 100, // Limit results
      }
    );

    return NextResponse.json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0,
    });
  } catch (error: any) {
    console.error(`Error fetching view data:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch view data",
        data: [],
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
