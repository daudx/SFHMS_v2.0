import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const nurseId = searchParams.get("nurseId")

    let sql = "SELECT * FROM Appointment"
    const params: any[] = []
    const conditions: string[] = []

    if (studentId) {
      conditions.push("FK_StudentID = :1")
      params.push(parseInt(studentId))
    }

    if (nurseId) {
      conditions.push(`FK_NurseID = :${params.length + 1}`)
      params.push(parseInt(nurseId))
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY AppointmentDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, nurseId, appointmentDate, appointmentTime, reason } = body

    const sql = `
      INSERT INTO Appointment (AppointmentDate, AppointmentTime, Reason, FK_StudentID, FK_NurseID)
      VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5)
      RETURNING AppointmentID INTO :6
    `

    const result = await executeQuery(sql, [
      appointmentDate,
      appointmentTime,
      reason,
      studentId,
      nurseId,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "Appointment created successfully",
      appointmentId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}
