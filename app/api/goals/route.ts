import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    let sql = "SELECT * FROM Goal"
    const params: any[] = []

    if (studentId) {
      sql += " WHERE FK_StudentID = :1"
      params.push(parseInt(studentId))
    }

    sql += " ORDER BY CreatedDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, goalType, targetValue, startDate, endDate } = body

    const sql = `
      INSERT INTO Goal (GoalType, TargetValue, StartDate, EndDate, FK_StudentID)
      VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), TO_DATE(:4, 'YYYY-MM-DD'), :5)
      RETURNING GoalID INTO :6
    `

    const result = await executeQuery(sql, [
      goalType,
      targetValue,
      startDate,
      endDate,
      studentId,
      { dir: 3, type: 2 }, // OUT parameter for GoalID
    ])

    return NextResponse.json({
      success: true,
      message: "Goal created successfully",
      goalId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { goalId, isAchieved } = body

    const sql = `UPDATE Goal SET IsAchieved = :1 WHERE GoalID = :2`

    await executeQuery(sql, [isAchieved, goalId])

    return NextResponse.json({
      success: true,
      message: "Goal updated successfully",
    })
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    )
  }
}
