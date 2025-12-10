import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/reviews - Get all fitness reviews by this coach
export async function GET(request: NextRequest) {
    let connection;

    try {
        const coachId = request.headers.get("x-coach-id");

        if (!coachId) {
            return NextResponse.json(
                { error: "Coach ID not provided" },
                { status: 400 }
            );
        }

        connection = await getConnection();

        const result = await connection.execute(
            `SELECT 
        cfr.ReviewID,
        cfr.ReviewDate,
        cfr.ReviewNotes,
        cfr.FK_CoachID,
        cfr.FK_LogID,
        fl.ActivityType,
        fl.DurationMinutes,
        fl.CaloriesBurned,
        fl.Distance,
        fl.LogDate,
        s.StudentID,
        s.FirstName || ' ' || s.LastName as StudentName
      FROM CoachFitnessReview cfr
      INNER JOIN FitnessLog fl ON cfr.FK_LogID = fl.LogID
      INNER JOIN Student s ON fl.FK_StudentID = s.StudentID
      WHERE cfr.FK_CoachID = :coachId
      ORDER BY cfr.ReviewDate DESC`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 }
        );

        return NextResponse.json({
            success: true,
            reviews: result.rows || [],
        });
    } catch (error: any) {
        console.error("Error fetching fitness reviews:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch reviews",
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

// POST /api/coach/reviews - Create a new fitness review
export async function POST(request: NextRequest) {
    let connection;

    try {
        const coachId = request.headers.get("x-coach-id");

        if (!coachId) {
            return NextResponse.json(
                { error: "Coach ID not provided" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { logId, reviewNotes } = body;

        if (!logId || !reviewNotes) {
            return NextResponse.json(
                { error: "Missing required fields: logId, reviewNotes" },
                { status: 400 }
            );
        }

        connection = await getConnection();

        const result = await connection.execute(
            `INSERT INTO CoachFitnessReview (ReviewDate, ReviewNotes, FK_CoachID, FK_LogID)
       VALUES (SYSDATE, :reviewNotes, :coachId, :logId)`,
            {
                reviewNotes,
                coachId: parseInt(coachId),
                logId: parseInt(logId),
            },
            { autoCommit: true, outFormat: 4001 }
        );

        return NextResponse.json({
            success: true,
            message: "Fitness review created successfully",
        });
    } catch (error: any) {
        console.error("Error creating fitness review:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create review",
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
