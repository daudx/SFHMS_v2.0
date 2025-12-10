import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db/oracle"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get("coachId")
    const logId = searchParams.get("logId")

    let sql = "SELECT * FROM CoachFitnessReview"
    const params: any[] = []
    const conditions: string[] = []

    if (coachId) {
      conditions.push("FK_CoachID = :1")
      params.push(parseInt(coachId))
    }

    if (logId) {
      conditions.push(`FK_LogID = :${params.length + 1}`)
      params.push(parseInt(logId))
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY ReviewDate DESC"

    const result = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error fetching coach reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch coach reviews" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coachId, logId, reviewDate, reviewNotes } = body

    const sql = `
      INSERT INTO CoachFitnessReview (ReviewDate, ReviewNotes, FK_CoachID, FK_LogID)
      VALUES (TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4)
      RETURNING ReviewID INTO :5
    `

    const result = await executeQuery(sql, [
      reviewDate,
      reviewNotes,
      coachId,
      logId,
      { dir: 3, type: 2 },
    ])

    return NextResponse.json({
      success: true,
      message: "Coach review created successfully",
      reviewId: result.outBinds?.[0],
    })
  } catch (error) {
    console.error("Error creating coach review:", error)
    return NextResponse.json(
      { error: "Failed to create coach review" },
      { status: 500 }
    )
  }
}
