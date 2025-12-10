import { type NextRequest, NextResponse } from "next/server"
import { getFitnessActivities, createFitnessActivity, getStudentByUserId, deleteFitnessActivity } from "@/lib/db/queries"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

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
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

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

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

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
