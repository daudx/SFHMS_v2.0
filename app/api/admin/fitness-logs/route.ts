import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

// GET all fitness logs
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT fl.LogID, fl.ActivityType, fl.DurationMinutes, fl.CaloriesBurned,
             fl.Distance, fl.LogDate, fl.CreatedDate,
             s.StudentID, s.FirstName || ' ' || s.LastName as StudentName
      FROM FitnessLog fl
      JOIN Student s ON fl.FK_StudentID = s.StudentID
      JOIN "User" u ON s.FK_UserID = u.UserID
      ORDER BY fl.LogDate DESC
    `

    const result = await executeQuery(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching fitness logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch fitness logs" },
      { status: 500 }
    )
  }
}

// POST create new fitness log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, activityType, durationMinutes, caloriesBurned, distance, logDate } = body

    const sql = `
      INSERT INTO FitnessLog 
        (FK_StudentID, ActivityType, DurationMinutes, CaloriesBurned, Distance, LogDate)
      VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'))
      RETURNING LogID INTO :7
    `

    const result = await executeQuery(sql, [
      studentId,
      activityType,
      durationMinutes,
      caloriesBurned,
      distance,
      logDate,
      { dir: 3, type: 2 }, // OUT parameter
    ])

    return NextResponse.json({
      success: true,
      message: "Fitness log created successfully",
      logId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating fitness log:", error)
    return NextResponse.json(
      { error: "Failed to create fitness log" },
      { status: 500 }
    )
  }
}

// PUT update fitness log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { logId, activityType, durationMinutes, caloriesBurned, distance } = body

    const sql = `
      UPDATE FitnessLog 
      SET ActivityType = :1, DurationMinutes = :2, 
          CaloriesBurned = :3, Distance = :4
      WHERE LogID = :5
    `

    await executeQuery(sql, [
      activityType,
      durationMinutes,
      caloriesBurned,
      distance,
      logId,
    ])

    return NextResponse.json({
      success: true,
      message: "Fitness log updated successfully",
    })
  } catch (error) {
    console.error("Error updating fitness log:", error)
    return NextResponse.json(
      { error: "Failed to update fitness log" },
      { status: 500 }
    )
  }
}

// DELETE fitness log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const logId = searchParams.get("logId")

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      )
    }

    const sql = `DELETE FROM FitnessLog WHERE LogID = :1`
    await executeQuery(sql, [parseInt(logId)])

    return NextResponse.json({
      success: true,
      message: "Fitness log deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting fitness log:", error)
    return NextResponse.json(
      { error: "Failed to delete fitness log" },
      { status: 500 }
    )
  }
}
