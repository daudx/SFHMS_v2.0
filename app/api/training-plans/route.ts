import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get("coachId")

    let sql = "SELECT * FROM TrainingPlan"
    const params: any[] = []

    if (coachId) {
      sql += " WHERE FK_CoachID = :1"
      params.push(parseInt(coachId))
    }

    sql += " ORDER BY StartDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching training plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch training plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planName, description, startDate, endDate, coachId } = body

    const sql = `
      INSERT INTO TrainingPlan (PlanName, Description, StartDate, EndDate, FK_CoachID)
      VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), TO_DATE(:4, 'YYYY-MM-DD'), :5)
      RETURNING PlanID INTO :6
    `

    const result = await executeQuery(sql, [
      planName,
      description,
      startDate,
      endDate,
      coachId,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "Training plan created successfully",
      planId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating training plan:", error)
    return NextResponse.json(
      { error: "Failed to create training plan" },
      { status: 500 }
    )
  }
}
