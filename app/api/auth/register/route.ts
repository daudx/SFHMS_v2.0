import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db/queries"
import { executeQuery } from "@/lib/db/oracle"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, role } = await request.json()

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    if (!['Student', 'Coach', 'Nurse'].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be Student, Coach, or Nurse" }, { status: 400 })
    }

    // Check if user already exists by email
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Check if username already exists
    const usernameCheck = await executeQuery(
      `SELECT UserID FROM "User" WHERE Username = :1`,
      [username]
    )
    if (usernameCheck.rows && usernameCheck.rows.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await createUser({ name, username, email, passwordHash, role })

    return NextResponse.json(
      { success: true, userId: result.userId, message: "User registered successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
