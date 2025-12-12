import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");
        const coachId = request.headers.get("x-coach-id");

        if (!coachId) {
            return NextResponse.json({ error: "Missing coach ID" }, { status: 400 });
        }

        connection = await getConnection();

        let query = `SELECT 
                fl.LogID,
                fl.ActivityType,
                fl.DurationMinutes,
                fl.CaloriesBurned,
                fl.Distance,
                TO_CHAR(fl.LogDate, 'YYYY-MM-DD') as LogDate,
                s.FirstName || ' ' || s.LastName as StudentName,
                s.StudentID
             FROM FitnessLog fl
             JOIN Student s ON fl.FK_StudentID = s.StudentID
             WHERE 1=1`;

        const params: any = {};

        if (studentId) {
            query += ` AND fl.FK_StudentID = :studentId`;
            params.studentId = parseInt(studentId);
        } else {
            // If no specific student, fetch for all students assigned to this coach
            // Assuming direct FK on Student table based on recent schema updates
            query += ` AND s.FK_CoachID = :coachId`;
            params.coachId = parseInt(coachId);
        }

        query += ` ORDER BY fl.LogDate DESC`;

        const result = await connection.execute(
            query,
            params,
            { outFormat: 4002 }
        );

        return NextResponse.json({
            success: true,
            logs: result.rows
        });
    } catch (error: any) {
        console.error("Error fetching student logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
