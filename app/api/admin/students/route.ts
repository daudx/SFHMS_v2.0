import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT s.StudentID, s.FirstName, s.LastName, s.DateOfBirth, s.Gender, 
             s.EmergencyContactPhone, s.CreatedDate, s.FK_UserID,
             u.Username, u.Email, s.FirstName || ' ' || s.LastName as FullName
      FROM Student s
      LEFT JOIN "User" u ON s.FK_UserID = u.UserID
      ORDER BY s.CreatedDate DESC
    `
    const result = await executeQuery(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, emergencyContactPhone, userId } = body

    const sql = `
      INSERT INTO Student (FirstName, LastName, DateOfBirth, Gender, EmergencyContactPhone, FK_UserID)
      VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6)
      RETURNING StudentID INTO :7
    `

    const result = await executeQuery(sql, [
      firstName,
      lastName,
      dateOfBirth,
      gender,
      emergencyContactPhone,
      userId,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      studentId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, firstName, lastName, gender, emergencyContactPhone } = body

    const sql = `
      UPDATE Student
      SET FirstName = :1, LastName = :2, Gender = :3, EmergencyContactPhone = :4
      WHERE StudentID = :5
    `

    await executeQuery(sql, [firstName, lastName, gender, emergencyContactPhone, studentId])

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      )
    }

    const sql = "DELETE FROM Student WHERE StudentID = :1"
    await executeQuery(sql, [parseInt(studentId)])

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    )
  }
}
