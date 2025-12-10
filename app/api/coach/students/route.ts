import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/students - Get all students assigned to this coach (via training plans)
export async function GET(request: NextRequest) {
    let connection;

    try {
        // Get coach info from session/headers
        const coachId = request.headers.get("x-coach-id");

        if (!coachId) {
            return NextResponse.json(
                { error: "Coach ID not provided" },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // Get students who have been reviewed by this coach (through fitness logs)
        // This shows students the coach is actively working with
        const result = await connection.execute(
            `SELECT DISTINCT
        s.StudentID,
        s.FirstName,
        s.LastName,
        s.Gender,
        TO_CHAR(s.DateOfBirth, 'YYYY-MM-DD') as DateOfBirth,
        s.EmergencyContactPhone,
        (SELECT COUNT(*) FROM FitnessLog fl WHERE fl.FK_StudentID = s.StudentID) as TotalActivities,
        (SELECT COUNT(*) FROM CoachFitnessReview cfr 
         JOIN FitnessLog fl ON cfr.FK_LogID = fl.LogID 
         WHERE fl.FK_StudentID = s.StudentID AND cfr.FK_CoachID = :coachId) as ReviewsCount,
        (SELECT MAX(fl.LogDate) FROM FitnessLog fl WHERE fl.FK_StudentID = s.StudentID) as LastActivityDate
      FROM Student s
      WHERE EXISTS (
        SELECT 1 FROM CoachFitnessReview cfr
        JOIN FitnessLog fl ON cfr.FK_LogID = fl.LogID
        WHERE fl.FK_StudentID = s.StudentID 
        AND cfr.FK_CoachID = :coachId
      )
      ORDER BY s.LastName, s.FirstName`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 } // OBJECT format
        );
        return NextResponse.json({
            success: true,
            students: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching coach students:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch students",
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}
