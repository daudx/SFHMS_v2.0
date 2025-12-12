import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";
import { cookies } from "next/headers";

// GET /api/student/my-plan
export async function GET(request: NextRequest) {
    let connection;
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        connection = await getConnection();

        // 1. Get Student ID
        const studentRes = await connection.execute(
            `SELECT StudentID FROM Student WHERE FK_UserID = :userId`,
            { userId: parseInt(userId) },
            { outFormat: 4002 }
        );
        if (!studentRes.rows || studentRes.rows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        const studentId = (studentRes.rows[0] as any).STUDENTID;

        // 2. Get Latest Assigned Plan
        // Join StudentTrainingPlan, TrainingPlan, Coach
        const planQuery = `
            SELECT 
                tp.PlanID, tp.PlanName, tp.Description, 
                TO_CHAR(tp.StartDate, 'YYYY-MM-DD') as StartDate, 
                TO_CHAR(tp.EndDate, 'YYYY-MM-DD') as EndDate,
                c.FirstName || ' ' || c.LastName as CoachName,
                stp.Status,
                TO_CHAR(stp.AssignedDate, 'YYYY-MM-DD') as AssignedDate
            FROM StudentTrainingPlan stp
            JOIN TrainingPlan tp ON stp.FK_PlanID = tp.PlanID
            JOIN Coach c ON tp.FK_CoachID = c.CoachID
            WHERE stp.FK_StudentID = :studentId
            ORDER BY stp.AssignedDate DESC
            FETCH FIRST 1 ROWS ONLY
        `;

        const planRes = await connection.execute(planQuery, { studentId }, { outFormat: 4002 });

        if (!planRes.rows || planRes.rows.length === 0) {
            return NextResponse.json({ success: true, plan: null });
        }

        const plan = planRes.rows[0];

        // 3. Get Exercises for this plan
        const exercisesRes = await connection.execute(
            `SELECT * FROM PlanDetail WHERE FK_PlanID = :planId ORDER BY 
             CASE DayOfWeek 
                WHEN 'Monday' THEN 1 
                WHEN 'Tuesday' THEN 2 
                WHEN 'Wednesday' THEN 3 
                WHEN 'Thursday' THEN 4 
                WHEN 'Friday' THEN 5 
                WHEN 'Saturday' THEN 6 
                WHEN 'Sunday' THEN 7 
             END ASC`,
            { planId: plan.PLANID },
            { outFormat: 4002 }
        );

        return NextResponse.json({
            success: true,
            plan: {
                ...plan,
                exercises: exercisesRes.rows
            }
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
