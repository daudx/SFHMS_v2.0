import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET /api/coach/stats - Get coach dashboard statistics
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

        // Get total training plans
        const plansResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL FROM TrainingPlan WHERE FK_CoachID = :coachId`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 }
        );

        // Get active training plans (not ended or end date in future)
        const activePlansResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL 
       FROM TrainingPlan 
       WHERE FK_CoachID = :coachId 
       AND (EndDate IS NULL OR EndDate >= SYSDATE)`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 }
        );

        // Get total reviews completed this month
        const reviewsResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL 
       FROM CoachFitnessReview 
       WHERE FK_CoachID = :coachId 
       AND EXTRACT(MONTH FROM ReviewDate) = EXTRACT(MONTH FROM SYSDATE)
       AND EXTRACT(YEAR FROM ReviewDate) = EXTRACT(YEAR FROM SYSDATE)`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 }
        );

        // Get total assessments
        const assessmentsResult = await connection.execute(
            `SELECT COUNT(*) as TOTAL FROM FitnessAssessment WHERE FK_CoachID = :coachId`,
            { coachId: parseInt(coachId) },
            { outFormat: 4001 }
        );

        const stats = {
            totalPlans: plansResult.rows?.[0]?.TOTAL || 0,
            activePlans: activePlansResult.rows?.[0]?.TOTAL || 0,
            reviewsCompleted: reviewsResult.rows?.[0]?.TOTAL || 0,
            totalAssessments: assessmentsResult.rows?.[0]?.TOTAL || 0,
        };

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error: any) {
        console.error("Error fetching coach stats:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch statistics",
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
