import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

// GET all coaches
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT c.CoachID, c.FirstName, c.LastName, c.Certification, c.ContactPhone,
             u.Username, u.Email, c.FirstName || ' ' || c.LastName as FullName
      FROM Coach c
      JOIN "User" u ON c.FK_UserID = u.UserID
      ORDER BY c.CoachID DESC
    `

    const result = await executeQuery(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching coaches:", error)
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    )
  }
}

// POST create new coach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, certification, contactPhone } = body

    const sql = `
      INSERT INTO Coach (FK_UserID, Certification, ContactPhone)
      VALUES (:1, :2, :3)
      RETURNING CoachID INTO :4
    `

    const result = await executeQuery(sql, [
      userId,
      certification,
      contactPhone,
      { dir: 3, type: 2 }, // OUT parameter
    ])

    return NextResponse.json({
      success: true,
      message: "Coach created successfully",
      coachId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating coach:", error)
    return NextResponse.json(
      { error: "Failed to create coach" },
      { status: 500 }
    )
  }
}

// PUT update coach
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { coachId, certification, contactPhone } = body

    const sql = `
      UPDATE Coach 
      SET Certification = :1, ContactPhone = :2
      WHERE CoachID = :3
    `

    await executeQuery(sql, [certification, contactPhone, coachId])

    return NextResponse.json({
      success: true,
      message: "Coach updated successfully",
    })
  } catch (error) {
    console.error("Error updating coach:", error)
    return NextResponse.json(
      { error: "Failed to update coach" },
      { status: 500 }
    )
  }
}

// DELETE coach
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get("coachId")

    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 }
      )
    }

    const sql = `DELETE FROM Coach WHERE CoachID = :1`
    await executeQuery(sql, [parseInt(coachId)])

    return NextResponse.json({
      success: true,
      message: "Coach deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting coach:", error)
    return NextResponse.json(
      { error: "Failed to delete coach" },
      { status: 500 }
    )
  }
}
