import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "overview"

    let sql = ""

    switch (type) {
      case "student-activity":
        sql = `
          SELECT 
            s.StudentID,
            s.FirstName || ' ' || s.LastName AS StudentName,
            COUNT(fl.LogID) AS TotalActivities,
            SUM(fl.CaloriesBurned) AS TotalCalories,
            AVG(fl.DurationMinutes) AS AvgDuration
          FROM Student s
          LEFT JOIN FitnessLog fl ON s.StudentID = fl.FK_StudentID
          GROUP BY s.StudentID, s.FirstName, s.LastName
          HAVING COUNT(fl.LogID) > 0
          ORDER BY TotalActivities DESC
        `
        break

      case "health-summary":
        sql = `
          SELECT 
            hp.BloodType,
            COUNT(*) AS StudentCount,
            COUNT(CASE WHEN hp.ChronicConditions IS NOT NULL THEN 1 END) AS WithConditions
          FROM HealthProfile hp
          GROUP BY hp.BloodType
          ORDER BY StudentCount DESC
        `
        break

      case "appointment-stats":
        sql = `
          SELECT 
            a.Status,
            COUNT(*) AS Count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS Percentage
          FROM Appointment a
          GROUP BY a.Status
        `
        break

      case "goal-progress":
        sql = `
          SELECT 
            g.GoalType,
            COUNT(*) AS TotalGoals,
            SUM(CASE WHEN g.IsAchieved = 'Y' THEN 1 ELSE 0 END) AS Achieved,
            ROUND(SUM(CASE WHEN g.IsAchieved = 'Y' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS AchievementRate
          FROM Goal g
          GROUP BY g.GoalType
        `
        break

      default:
        sql = `
          SELECT 
            'Total Students' AS Metric,
            COUNT(*) AS Value
          FROM Student
          UNION ALL
          SELECT 
            'Total Coaches' AS Metric,
            COUNT(*) AS Value
          FROM Coach
          UNION ALL
          SELECT 
            'Total Appointments' AS Metric,
            COUNT(*) AS Value
          FROM Appointment
          UNION ALL
          SELECT 
            'Total Fitness Logs' AS Metric,
            COUNT(*) AS Value
          FROM FitnessLog
        `
    }

    const result = await executeQuery(sql)

    return NextResponse.json({
      success: true,
      type,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
