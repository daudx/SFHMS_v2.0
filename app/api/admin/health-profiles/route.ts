import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

// GET all health profiles
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT hp.ProfileID, hp.Height, hp.BloodType, 
             hp.Allergies, hp.ChronicConditions, hp.CreatedDate,
             s.StudentID, s.FirstName || ' ' || s.LastName as StudentName
      FROM HealthProfile hp
      JOIN Student s ON hp.FK_StudentID = s.StudentID
      JOIN "User" u ON s.FK_UserID = u.UserID
      ORDER BY hp.CreatedDate DESC
    `

    const result = await executeQuery(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching health profiles:", error)
    return NextResponse.json(
      { error: "Failed to fetch health profiles" },
      { status: 500 }
    )
  }
}

// POST create new health profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, height, weight, bloodType, allergies, medicalConditions } = body

    const sql = `
      INSERT INTO HealthProfile 
        (FK_StudentID, Height, Weight, BloodType, Allergies, MedicalConditions)
      VALUES (:1, :2, :3, :4, :5, :6)
      RETURNING ProfileID INTO :7
    `

    const result = await executeQuery(sql, [
      studentId,
      height,
      weight,
      bloodType,
      allergies,
      medicalConditions,
      { dir: 3, type: 2 }, // OUT parameter
    ])

    return NextResponse.json({
      success: true,
      message: "Health profile created successfully",
      profileId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating health profile:", error)
    return NextResponse.json(
      { error: "Failed to create health profile" },
      { status: 500 }
    )
  }
}

// PUT update health profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, height, weight, bloodType, allergies, medicalConditions } = body

    const sql = `
      UPDATE HealthProfile 
      SET Height = :1, Weight = :2, BloodType = :3, 
          Allergies = :4, MedicalConditions = :5
      WHERE ProfileID = :6
    `

    await executeQuery(sql, [
      height,
      weight,
      bloodType,
      allergies,
      medicalConditions,
      profileId,
    ])

    return NextResponse.json({
      success: true,
      message: "Health profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating health profile:", error)
    return NextResponse.json(
      { error: "Failed to update health profile" },
      { status: 500 }
    )
  }
}

// DELETE health profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      )
    }

    const sql = `DELETE FROM HealthProfile WHERE ProfileID = :1`
    await executeQuery(sql, [parseInt(profileId)])

    return NextResponse.json({
      success: true,
      message: "Health profile deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting health profile:", error)
    return NextResponse.json(
      { error: "Failed to delete health profile" },
      { status: 500 }
    )
  }
}
