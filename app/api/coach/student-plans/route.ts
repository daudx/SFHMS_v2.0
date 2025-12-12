import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/student-plans?studentId=... OR ?coachId=...
export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");
        const coachId = searchParams.get("coachId");

        if (!studentId && !coachId) return NextResponse.json({ error: "Missing studentId or coachId" }, { status: 400 });

        connection = await getConnection();

        let query = `
            SELECT 
                stp.AssignmentID,
                TO_CHAR(stp.AssignedDate, 'YYYY-MM-DD') as AssignedDate,
                stp.Status,
                tp.PlanID,
                tp.PlanName,
                tp.Description,
                s.FirstName || ' ' || s.LastName as StudentName,
                s.StudentID
             FROM StudentTrainingPlan stp
             JOIN TrainingPlan tp ON stp.FK_PlanID = tp.PlanID
             JOIN Student s ON stp.FK_StudentID = s.StudentID
        `;

        const binds: any = {};

        if (studentId) {
            query += ` WHERE stp.FK_StudentID = :studentId`;
            binds.studentId = parseInt(studentId);
        } else if (coachId) {
            // Get plans where the student is assigned to this coach
            // Assuming we only want to see plans assigned by THIS coach, 
            // OR plans assigned to students that THIS coach manages.
            // Since TrainingPlan has FK_CoachID, we can filter by that if we only want plans *created* by this coach?
            // User request: "assigned goal ... for all active students".
            // Let's filter by students assigned to this coach.
            // User request: "assigned goal ... for all active students".
            // Let's filter by students assigned to this coach.
            query += ` 
                WHERE s.FK_CoachID = :coachId
            `;
            binds.coachId = parseInt(coachId);
        }

        query += ` ORDER BY stp.AssignedDate DESC`;

        const result = await connection.execute(query, binds, { outFormat: 4002 });
        return NextResponse.json({ success: true, data: result.rows });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally { if (connection) await connection.close(); }
}

// POST /api/coach/student-plans (Assign plan)
export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { studentId, planId } = body;
        if (!studentId || !planId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        connection = await getConnection();
        await connection.execute(
            `INSERT INTO StudentTrainingPlan (FK_StudentID, FK_PlanID) VALUES (:studentId, :planId)`,
            { studentId, planId },
            { autoCommit: true }
        );
        return NextResponse.json({ success: true, message: "Assigned" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally { if (connection) await connection.close(); }
}
