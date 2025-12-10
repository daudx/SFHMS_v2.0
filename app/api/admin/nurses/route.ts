import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

// GET all nurses
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT n.NurseID, n.FirstName, n.LastName, n.LicenseNumber, n.CreatedDate,
             u.Username, u.Email, n.FirstName || ' ' || n.LastName as FullName
      FROM Nurse n
      JOIN "User" u ON n.FK_UserID = u.UserID
      ORDER BY n.NurseID DESC
    `

    const result = await executeQuery(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching nurses:", error)
    return NextResponse.json(
      { error: "Failed to fetch nurses" },
      { status: 500 }
    )
  }
}

// POST create new nurse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, firstName, lastName, licenseNumber } = body

    const sql = `
      INSERT INTO Nurse (FK_UserID, FirstName, LastName, LicenseNumber)
      VALUES (:1, :2, :3, :4)
      RETURNING NurseID INTO :5
    `

    const result = await executeQuery(sql, [
      userId,
      firstName,
      lastName,
      licenseNumber,
      { dir: 3, type: 2 }, // OUT parameter
    ])

    return NextResponse.json({
      success: true,
      message: "Nurse created successfully",
      nurseId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating nurse:", error)
    return NextResponse.json(
      { error: "Failed to create nurse" },
      { status: 500 }
    )
  }
}

// PUT update nurse
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { nurseId, firstName, lastName, licenseNumber } = body

    const sql = `
      UPDATE Nurse 
      SET FirstName = :1, LastName = :2, LicenseNumber = :3
      WHERE NurseID = :4
    `

    await executeQuery(sql, [firstName, lastName, licenseNumber, nurseId])

    return NextResponse.json({
      success: true,
      message: "Nurse updated successfully",
    })
  } catch (error) {
    console.error("Error updating nurse:", error)
    return NextResponse.json(
      { error: "Failed to update nurse" },
      { status: 500 }
    )
  }
}

// DELETE nurse
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nurseId = searchParams.get("nurseId")

    if (!nurseId) {
      return NextResponse.json(
        { error: "Nurse ID is required" },
        { status: 400 }
      )
    }

    const sql = `DELETE FROM Nurse WHERE NurseID = :1`
    await executeQuery(sql, [parseInt(nurseId)])

    return NextResponse.json({
      success: true,
      message: "Nurse deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting nurse:", error)
    return NextResponse.json(
      { error: "Failed to delete nurse" },
      { status: 500 }
    )
  }
}
