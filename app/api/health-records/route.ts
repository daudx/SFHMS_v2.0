import { type NextRequest, NextResponse } from "next/server"
import { getHealthRecords, createHealthRecord, getStudentByUserId, deleteHealthRecord } from "@/lib/db/queries"
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

    const records = await getHealthRecords(student.student_id)
    return NextResponse.json(records)
  } catch (error) {
    console.error("[v0] Error fetching health records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
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
    await createHealthRecord({
      studentId: student.student_id,
      visitDate: data.visitDate,
      diagnosis: data.diagnosis,
      prescription: data.prescription,
      notes: data.notes,
      nurseId: data.nurseId || 1, // Default nurse ID
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating health record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 })
    }

    const recordId = request.nextUrl.searchParams.get("id")
    if (!recordId) {
      return NextResponse.json({ error: "Record ID required" }, { status: 400 })
    }

    await deleteHealthRecord(Number.parseInt(recordId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting health record:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}
