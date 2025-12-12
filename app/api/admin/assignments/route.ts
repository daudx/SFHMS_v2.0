import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;
    try {
        connection = await getConnection();

        // 1. Get Students with Assignments
        const studentsQuery = `
            SELECT 
                s.StudentID, s.FirstName || ' ' || s.LastName as StudentName,
                s.FK_CoachID, c.FirstName || ' ' || c.LastName as CoachName,
                s.FK_NurseID, n.FirstName || ' ' || n.LastName as NurseName
            FROM Student s
            LEFT JOIN Coach c ON s.FK_CoachID = c.CoachID
            LEFT JOIN Nurse n ON s.FK_NurseID = n.NurseID
            ORDER BY s.StudentID DESC
        `;
        const studentsRes = await connection.execute(studentsQuery, [], { outFormat: 4002 });

        // 2. Get Coaches
        const coachesRes = await connection.execute(
            `SELECT CoachID, FirstName || ' ' || LastName as Name FROM Coach ORDER BY Name`,
            [], { outFormat: 4002 }
        );

        // 3. Get Nurses
        const nursesRes = await connection.execute(
            `SELECT NurseID, FirstName || ' ' || LastName as Name FROM Nurse ORDER BY Name`,
            [], { outFormat: 4002 }
        );

        return NextResponse.json({
            success: true,
            students: studentsRes.rows,
            coaches: coachesRes.rows,
            nurses: nursesRes.rows
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { studentId, coachId, nurseId } = body;

        if (!studentId) return NextResponse.json({ error: "Student ID required" }, { status: 400 });

        connection = await getConnection();

        // Update Student table
        await connection.execute(
            `UPDATE Student SET FK_CoachID = :coachId, FK_NurseID = :nurseId WHERE StudentID = :studentId`,
            {
                coachId: coachId || null,
                nurseId: nurseId || null,
                studentId
            },
            { autoCommit: true }
        );

        // Log the action (SystemLogs)
        // We can just try-catch this log insertion so it doesn't fail the main action
        try {
            await connection.execute(
                `INSERT INTO SystemLogs (LogID, Action, Details, Timestamp) 
                 VALUES (seq_systemlogs_id.NEXTVAL, 'Assignment Update', 'Assigned Student ' || :sid || ' to Coach ' || :cid || ' and Nurse ' || :nid, SYSDATE)`,
                { sid: studentId, cid: coachId || 'None', nid: nurseId || 'None' },
                { autoCommit: true }
            );
        } catch (ignore) { }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
