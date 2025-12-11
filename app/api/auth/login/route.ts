import { type NextRequest, NextResponse } from "next/server"
import oracledb from "oracledb"
import bcrypt from "bcryptjs"
import { getConnection } from "@/lib/db/oracle"

export async function POST(request: NextRequest) {
  let connection

  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      )
    }

    connection = await getConnection()

    // Query to verify user credentials using EMAIL instead of username
    const result = await connection.execute(
      `SELECT 
        u.USERID,
        u.USERNAME,
        u.PASSWORDHASH,
        u.EMAIL,
        u.ROLE,
        u.CREATEDDATE
      FROM "User" u
      WHERE LOWER(u.EMAIL) = LOWER(:email)
        AND u.ROLE = :role`,
      { email, role },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or role" },
        { status: 401 }
      )
    }

    const user = result.rows[0] as any

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.PASSWORDHASH)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Get additional info based on role
    let additionalInfo = {}
    if (role === 'Student') {
      const studentResult = await connection.execute(
        `SELECT s.FIRSTNAME, s.LASTNAME, s.STUDENTID 
         FROM Student s 
         WHERE s.FK_USERID = :userid`,
        { userid: user.USERID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      )
      if (studentResult.rows && studentResult.rows.length > 0) {
        const student = studentResult.rows[0] as any
        additionalInfo = {
          firstName: student.FIRSTNAME,
          lastName: student.LASTNAME,
          fullName: `${student.FIRSTNAME} ${student.LASTNAME}`,
          studentId: student.STUDENTID
        }
      }
    } else if (role === 'Coach') {
      const coachResult = await connection.execute(
        `SELECT c.FIRSTNAME, c.LASTNAME, c.COACHID, c.CERTIFICATION 
         FROM Coach c 
         WHERE c.FK_USERID = :userid`,
        { userid: user.USERID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      )
      if (coachResult.rows && coachResult.rows.length > 0) {
        const coach = coachResult.rows[0] as any
        additionalInfo = {
          firstName: coach.FIRSTNAME,
          lastName: coach.LASTNAME,
          fullName: `${coach.FIRSTNAME} ${coach.LASTNAME}`,
          coachId: coach.COACHID,
          certification: coach.CERTIFICATION
        }
      }
    } else if (role === 'Nurse') {
      const nurseResult = await connection.execute(
        `SELECT n.FIRSTNAME, n.LASTNAME, n.NURSEID, n.LICENSENUMBER 
         FROM Nurse n 
         WHERE n.FK_USERID = :userid`,
        { userid: user.USERID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      )
      if (nurseResult.rows && nurseResult.rows.length > 0) {
        const nurse = nurseResult.rows[0] as any
        additionalInfo = {
          firstName: nurse.FIRSTNAME,
          lastName: nurse.LASTNAME,
          fullName: `${nurse.FIRSTNAME} ${nurse.LASTNAME}`,
          nurseId: nurse.NURSEID,
          licenseNumber: nurse.LICENSENUMBER
        }
      }
    } else if (role === 'Admin') {
      additionalInfo = {
        fullName: 'Daud Admin'
      }
    }

    // Return user data (excluding password)
    const userData = {
      userId: user.USERID,
      username: user.USERNAME,
      email: user.EMAIL,
      role: user.ROLE,
      createdDate: user.CREATEDDATE,
      ...additionalInfo
    }

    const response = NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    )

    // Set session cookie
    response.cookies.set("userId", user.USERID.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    response.cookies.set("userRole", user.ROLE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("[API] Login error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error("[API] Error closing connection:", err)
      }
    }
  }
}
