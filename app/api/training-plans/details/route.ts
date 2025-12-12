import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db/oracle";

// GET: Fetch details for a specific plan
export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const planId = searchParams.get("planId");

        if (!planId) {
            return NextResponse.json({ error: "Missing planId" }, { status: 400 });
        }

        connection = await getConnection();
        const result = await connection.execute(
            `SELECT 
                DetailID, 
                ExerciseName, 
                Sets, 
                Reps,
                DayOfWeek
             FROM PlanDetail 
             WHERE FK_PlanID = :planId
             ORDER BY DetailID`,
            { planId: parseInt(planId) },
            { outFormat: 4002 }
        );

        return NextResponse.json({ success: true, details: result.rows });
    } catch (error: any) {
        console.error("Error fetching plan details:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

// POST: Add a new exercise to a plan
export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { planId, exerciseName, sets, reps, dayOfWeek } = body;

        if (!planId || !exerciseName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        connection = await getConnection();
        await connection.execute(
            `INSERT INTO PlanDetail (FK_PlanID, ExerciseName, Sets, Reps, DayOfWeek)
             VALUES (:planId, :exerciseName, :sets, :reps, :dayOfWeek)`,
            {
                planId: parseInt(planId),
                exerciseName,
                sets: sets || 0,
                reps: reps || 0,
                dayOfWeek: dayOfWeek || 'Monday'
            },
            { autoCommit: true }
        );

        return NextResponse.json({ success: true, message: "Exercise added" });
    } catch (error: any) {
        console.error("Error adding plan detail:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}

// DELETE: Remove an exercise detail
export async function DELETE(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const detailId = searchParams.get("detailId");

        if (!detailId) {
            return NextResponse.json({ error: "Missing detailId" }, { status: 400 });
        }

        connection = await getConnection();
        await connection.execute(
            `DELETE FROM PlanDetail WHERE DetailID = :detailId`,
            { detailId: parseInt(detailId) },
            { autoCommit: true }
        );

        return NextResponse.json({ success: true, message: "Exercise deleted" });
    } catch (error: any) {
        console.error("Error deleting plan detail:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
