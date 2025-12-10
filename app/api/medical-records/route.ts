import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    let sql = "SELECT * FROM MedicalRecord"
    const params: any[] = []

    if (studentId) {
      sql += " WHERE FK_StudentID = :1"
      params.push(parseInt(studentId))
    }

    sql += " ORDER BY VisitDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, nurseId, visitDate, diagnosis, prescription, notes } = body

    const sql = `
      INSERT INTO MedicalRecord (VisitDate, Diagnosis, Prescription, Notes, FK_StudentID, FK_NurseID)
      VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5, :6)
      RETURNING RecordID INTO :7
    `

    const result = await executeQuery(sql, [
      visitDate,
      diagnosis,
      prescription,
      notes,
      studentId,
      nurseId,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "Medical record created successfully",
      recordId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating medical record:", error)
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 }
    )
  }
}
