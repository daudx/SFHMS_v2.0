import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/goals?studentId=...
export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        connection = await getConnection();
        const result = await connection.execute(
            `SELECT 
                GoalID, 
                GoalType, 
                TargetValue, 
                TO_CHAR(StartDate, 'YYYY-MM-DD') as StartDate, 
                TO_CHAR(EndDate, 'YYYY-MM-DD') as EndDate, 
                IsAchieved 
             FROM Goal 
             WHERE FK_StudentID = :studentId
             ORDER BY EndDate DESC`,
            { studentId: parseInt(studentId) },
            { outFormat: 4002 }
        );

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
