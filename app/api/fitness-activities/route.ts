import { type NextRequest, NextResponse } from "next/server"
import { getFitnessActivities, createFitnessActivity, getStudentByUserId, deleteFitnessActivity } from "@/lib/db/queries"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
    }

    // Get student ID from user ID
    const student = await getStudentByUserId(Number.parseInt(userId))

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const activities = await getFitnessActivities(student.student_id)
    return NextResponse.json(activities)
  } catch (error) {
    console.error("[v0] Error fetching fitness activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
    }

    // Get student ID from user ID
    const student = await getStudentByUserId(Number.parseInt(userId))

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const data = await request.json()
    const result = await createFitnessActivity({
      studentId: student.student_id,
      activityType: data.activityType,
      durationMinutes: data.durationMinutes,
      caloriesBurned: data.caloriesBurned,
      distance: data.distance,
      activityDate: data.activityDate,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[v0] Error logging activity:", error)
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 })
  }
}

import { getConnection } from "@/lib/db/oracle";

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify student ownership
    // We can just rely on the update query filtering by studentId for safety, 
    // but first we need studentId from userId.
    const student = await getStudentByUserId(Number.parseInt(userId))
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    const data = await request.json()
    const { logId, activityType, durationMinutes, caloriesBurned, distance, activityDate } = data

    if (!logId) return NextResponse.json({ error: "Log ID required" }, { status: 400 })

    connection = await getConnection();
    const sql = `
        UPDATE FitnessLog 
        SET ActivityType = :activityType, 
            DurationMinutes = :durationMinutes, 
            CaloriesBurned = :caloriesBurned, 
            Distance = :distance, 
            LogDate = TO_DATE(:activityDate, 'YYYY-MM-DD')
        WHERE LogID = :logId AND FK_StudentID = :studentId
    `;

    const result = await connection.execute(sql, {
      activityType,
      durationMinutes,
      caloriesBurned,
      distance: distance || null,
      activityDate,
      logId,
      studentId: student.student_id
    }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Activity not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed update" }, { status: 500 })
  } finally {
    if (connection) await connection.close();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
    }

    const logId = request.nextUrl.searchParams.get("id")
    if (!logId) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 })
    }

    await deleteFitnessActivity(Number.parseInt(logId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting fitness activity:", error)
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
