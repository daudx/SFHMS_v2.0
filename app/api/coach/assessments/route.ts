import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/assessments?coachId=...&studentId=...
export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const coachId = searchParams.get("coachId");
        const studentId = searchParams.get("studentId");

        if (!coachId && !studentId) {
            return NextResponse.json({ error: "Missing coachId or studentId" }, { status: 400 });
        }

        connection = await getConnection();
        let query = `
            SELECT 
                fa.AssessmentID,
                TO_CHAR(fa.AssessmentDate, 'YYYY-MM-DD') as AssessmentDate,
                fa.PerformanceScore,
                fa.Notes,
                fa.FK_StudentID,
                fa.FK_CoachID,
                s.FirstName || ' ' || s.LastName as StudentName
            FROM FitnessAssessment fa
            JOIN Student s ON fa.FK_StudentID = s.StudentID
        `;
        const binds: any = {};

        if (studentId) {
            query += ` WHERE fa.FK_StudentID = :studentId`;
            binds.studentId = parseInt(studentId);
            if (coachId) {
                query += ` AND fa.FK_CoachID = :coachId`;
                binds.coachId = parseInt(coachId);
            }
        } else if (coachId) {
            query += ` WHERE fa.FK_CoachID = :coachId`;
            binds.coachId = parseInt(coachId);
        }

        query += ` ORDER BY fa.AssessmentDate DESC`;

        const result = await connection.execute(query, binds, { outFormat: 4002 });
        return NextResponse.json({ success: true, data: result.rows });

    } catch (error: any) {
        console.error("Error fetching assessments:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

// POST /api/coach/assessments
export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { studentId, coachId, date, score, notes } = body;

        connection = await getConnection();

        // Oracle date handling can be tricky. Default SYSDATE if null.
        // If date provided, use TO_DATE.

        const sql = `
            INSERT INTO FitnessAssessment (FK_StudentID, FK_CoachID, AssessmentDate, PerformanceScore, Notes)
            VALUES (:studentId, :coachId, TO_DATE(:assessDate, 'YYYY-MM-DD'), :score, :notes)
        `;

        await connection.execute(sql, {
            studentId,
            coachId,
            assessDate: date || new Date().toISOString().split('T')[0],
            score: score || null,
            notes: notes || ''
        }, { autoCommit: true });

        return NextResponse.json({ success: true, message: "Assessment created" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

// PUT /api/coach/assessments
export async function PUT(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { assessmentId, date, score, notes } = body;

        if (!assessmentId) return NextResponse.json({ error: "Missing AssessmentID" }, { status: 400 });

        connection = await getConnection();

        const sql = `
            UPDATE FitnessAssessment 
            SET AssessmentDate = TO_DATE(:assessDate, 'YYYY-MM-DD'),
                PerformanceScore = :score,
                Notes = :notes
            WHERE AssessmentID = :assessmentId
        `;

        await connection.execute(sql, {
            assessDate: date,
            score: score,
            notes: notes,
            assessmentId: assessmentId
        }, { autoCommit: true });

        return NextResponse.json({ success: true, message: "Assessment updated" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

// DELETE /api/coach/assessments?id=...
export async function DELETE(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        connection = await getConnection();
        await connection.execute(
            `DELETE FROM FitnessAssessment WHERE AssessmentID = :id`,
            { id: parseInt(id) },
            { autoCommit: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
