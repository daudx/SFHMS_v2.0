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

    console.log("Creating plan with:", { planName, description, startDate, endDate, coachId });

    if (!planName || !startDate || !endDate || !coachId) {
      return NextResponse.json(
        { error: "Missing required fields: planName, startDate, endDate, coachId" },
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO TrainingPlan (PlanName, Description, StartDate, EndDate, FK_CoachID)
      VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), TO_DATE(:4, 'YYYY-MM-DD'), :5)
    `

    await executeQuery(sql, [
      planName,
      description || "",
      startDate,
      endDate,
      parseInt(coachId),
    ])

    return NextResponse.json({
      success: true,
      message: "Training plan created successfully"
    })
  } catch (error: any) {
    console.error("Error creating training plan:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create training plan" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 })

    await executeQuery("DELETE FROM TrainingPlan WHERE PlanID = :1", [parseInt(planId)])

    return NextResponse.json({ success: true, message: "Deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, planName, description, startDate, endDate } = body

    if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 })

    const sql = `
       UPDATE TrainingPlan 
       SET PlanName = :1, Description = :2, StartDate = TO_DATE(:3, 'YYYY-MM-DD'), EndDate = TO_DATE(:4, 'YYYY-MM-DD')
       WHERE PlanID = :5
    `
    await executeQuery(sql, [planName, description, startDate, endDate, parseInt(planId)])
    return NextResponse.json({ success: true, message: "Updated" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
