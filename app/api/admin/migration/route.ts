import { getConnection } from "@/lib/db/oracle";
import { NextResponse } from "next/server";

export async function GET() {
    let connection;
    try {
        connection = await getConnection();

        // Add FK_CoachID
        try {
            await connection.execute(`ALTER TABLE Student ADD (FK_CoachID NUMBER)`);
            console.log("Added FK_CoachID column");
        } catch (e: any) {
            console.log("FK_CoachID column likely exists:", e.message);
        }

        try {
            await connection.execute(`ALTER TABLE Student ADD CONSTRAINT fk_student_coach FOREIGN KEY (FK_CoachID) REFERENCES Coach(CoachID) ON DELETE SET NULL`);
            console.log("Added FK_CoachID constraint");
        } catch (e: any) {
            console.log("FK_CoachID constraint likely exists:", e.message);
        }

        // Add FK_NurseID
        try {
            await connection.execute(`ALTER TABLE Student ADD (FK_NurseID NUMBER)`);
            console.log("Added FK_NurseID column");
        } catch (e: any) {
            console.log("FK_NurseID column likely exists:", e.message);
        }

        try {
            await connection.execute(`ALTER TABLE Student ADD CONSTRAINT fk_student_nurse FOREIGN KEY (FK_NurseID) REFERENCES Nurse(NurseID) ON DELETE SET NULL`);
            console.log("Added FK_NurseID constraint");
        } catch (e: any) {
            console.log("FK_NurseID constraint likely exists:", e.message);
        }

        // Create SystemSettings table if not exists
        try {
            await connection.execute(`
                CREATE TABLE SystemSettings (
                    SettingID NUMBER PRIMARY KEY,
                    Category VARCHAR2(50) NOT NULL,
                    Name VARCHAR2(100) NOT NULL,
                    Type VARCHAR2(20) DEFAULT 'String',
                    Value VARCHAR2(255),
                    IsActive NUMBER(1) DEFAULT 1
                )
             `);
            // Add sequence
            await connection.execute(`CREATE SEQUENCE seq_systemsettings_id START WITH 1 INCREMENT BY 1`);
            console.log("Created SystemSettings table");
        } catch (e: any) {
            console.log("SystemSettings table likely exists:", e.message);
        }

        // Create SystemLogs table if not exists
        try {
            await connection.execute(`
                CREATE TABLE SystemLogs (
                    LogID NUMBER PRIMARY KEY,
                    Action VARCHAR2(100) NOT NULL,
                    PerformedBy VARCHAR2(100),
                    Timestamp DATE DEFAULT SYSDATE,
                    Details VARCHAR2(500)
                )
             `);
            await connection.execute(`CREATE SEQUENCE seq_systemlogs_id START WITH 1 INCREMENT BY 1`);
            console.log("Created SystemLogs table");
        } catch (e: any) {
            console.log("SystemLogs table likely exists:", e.message);
        }

        return NextResponse.json({ success: true, message: "Migration check completed" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        if (connection) await connection.close();
    }
}
