import { executeQuery } from "./oracle"

// User authentication and management queries

// User queries
export async function createUser(data: {
  name: string
  username: string
  email: string
  passwordHash: string
  role?: string
  details?: {
    dateOfBirth?: string
    gender?: string
    emergencyContact?: string
    certification?: string
    contactPhone?: string
    licenseNumber?: string
  }
}) {
  try {
    const role = data.role || 'Student'
    const details = data.details || {};

    // First, insert the user
    await executeQuery(
      `INSERT INTO "User" (UserID, Username, Email, PasswordHash, Role, CreatedDate) 
       VALUES (seq_user_id.NEXTVAL, :1, :2, :3, :4, SYSDATE)`,
      [data.username, data.email, data.passwordHash, role],
    )

    // Get the UserID that was just created
    // Note: Assuming username/email is unique, we fetch it back. 
    // Ideally we use RETURNING but Oracle node driver syntax varies.
    const userResult = await executeQuery(
      `SELECT UserID FROM "User" WHERE Email = :1`,
      [data.email]
    )

    const userId = userResult.rows?.[0]?.USERID

    if (!userId) {
      throw new Error("Failed to retrieve user ID after creation")
    }

    // Create role-specific record based on role
    const nameParts = data.name.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || 'Name'

    if (role === 'Student') {
      const dob = details.dateOfBirth || '2000-01-01';
      const gender = details.gender || 'Other';
      const emergency = details.emergencyContact || null;

      await executeQuery(
        `INSERT INTO Student (StudentID, FirstName, LastName, DateOfBirth, Gender, EmergencyContactPhone, FK_UserID, CreatedDate)
         VALUES (seq_student_id.NEXTVAL, :1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6, SYSDATE)`,
        [firstName, lastName, dob, gender, emergency, userId]
      )
    } else if (role === 'Coach') {
      const cert = details.certification || 'Certified Fitness Coach';
      const phone = details.contactPhone || null;

      await executeQuery(
        `INSERT INTO Coach (CoachID, FirstName, LastName, Certification, ContactPhone, FK_UserID, CreatedDate)
         VALUES (seq_coach_id.NEXTVAL, :1, :2, :3, :4, :5, SYSDATE)`,
        [firstName, lastName, cert, phone, userId]
      )
    } else if (role === 'Nurse') {
      // Generate a unique license number if not provided
      const licenseNumber = details.licenseNumber || `LN${Date.now()}`;
      const phone = details.contactPhone || null; // Accessing contactPhone from details

      await executeQuery(
        `INSERT INTO Nurse (NurseID, FirstName, LastName, LicenseNumber, ContactPhone, FK_UserID, CreatedDate)
         VALUES (seq_nurse_id.NEXTVAL, :1, :2, :3, :4, :5, SYSDATE)`,
        [firstName, lastName, licenseNumber, phone, userId]
      )
    }

    return { success: true, userId }
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await executeQuery(
      `SELECT UserID, Username, Email, PasswordHash, Role, CreatedDate FROM "User" WHERE Email = :email`,
      [email],
    )
    return result.rows?.[0] ? {
      id: result.rows[0].USERID,
      name: result.rows[0].USERNAME,
      email: result.rows[0].EMAIL,
      password_hash: result.rows[0].PASSWORDHASH,
      role: result.rows[0].ROLE,
      created_date: result.rows[0].CREATEDDATE
    } : null
  } catch (error) {
    console.error("[v0] Error getting user:", error)
    throw error
  }
}

export async function getUserById(userId: number) {
  try {
    const result = await executeQuery(
      `SELECT UserID, Username, Email, Role, CreatedDate FROM "User" WHERE UserID = :1`,
      [userId]
    )
    return result.rows?.[0] ? {
      id: result.rows[0].USERID,
      name: result.rows[0].USERNAME,
      email: result.rows[0].EMAIL,
      role: result.rows[0].ROLE,
      created_date: result.rows[0].CREATEDDATE
    } : null
  } catch (error) {
    console.error("[v0] Error getting user by ID:", error)
    throw error
  }
}

// Get Student ID from User ID
export async function getStudentByUserId(userId: number) {
  try {
    const result = await executeQuery(
      `SELECT StudentID, FirstName, LastName, DateOfBirth, Gender, EmergencyContactPhone, FK_UserID 
       FROM Student WHERE FK_UserID = :1`,
      [userId]
    )
    return result.rows?.[0] ? {
      student_id: result.rows[0].STUDENTID,
      first_name: result.rows[0].FIRSTNAME,
      last_name: result.rows[0].LASTNAME,
      date_of_birth: result.rows[0].DATEOFBIRTH,
      gender: result.rows[0].GENDER,
      emergency_contact: result.rows[0].EMERGENCYCONTACTPHONE,
      user_id: result.rows[0].FK_USERID
    } : null
  } catch (error) {
    console.error("[v0] Error getting student by user ID:", error)
    throw error
  }
}

// Health records queries (using MedicalRecord table)
export async function getHealthRecords(studentId: number) {
  try {
    const result = await executeQuery(
      `SELECT RecordID, VisitDate, Diagnosis, Prescription, Notes, FK_NurseID, FK_StudentID, CreatedDate 
       FROM MedicalRecord 
       WHERE FK_StudentID = :studentId 
       ORDER BY VisitDate DESC`,
      [studentId],
    )
    return result.rows?.map((row: any) => ({
      id: row.RECORDID,
      visit_date: row.VISITDATE,
      diagnosis: row.DIAGNOSIS,
      prescription: row.PRESCRIPTION,
      notes: row.NOTES,
      nurse_id: row.FK_NURSEID,
      student_id: row.FK_STUDENTID,
      created_date: row.CREATEDDATE
    })) || []
  } catch (error) {
    console.error("[v0] Error fetching health records:", error)
    throw error
  }
}

export async function createHealthRecord(data: {
  studentId: number
  visitDate: string
  diagnosis: string
  prescription?: string
  notes: string
  nurseId: number
}) {
  try {
    const result = await executeQuery(
      `INSERT INTO MedicalRecord (VisitDate, Diagnosis, Prescription, Notes, FK_NurseID, FK_StudentID, CreatedDate) 
       VALUES (TO_DATE(:visitDate, 'YYYY-MM-DD'), :diagnosis, :prescription, :notes, :nurseId, :studentId, SYSDATE)`,
      [data.visitDate, data.diagnosis, data.prescription || null, data.notes, data.nurseId, data.studentId],
    )
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating health record:", error)
    throw error
  }
}

export async function deleteHealthRecord(recordId: number) {
  try {
    await executeQuery(
      `DELETE FROM MedicalRecord WHERE RecordID = :1`,
      [recordId],
    )
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting health record:", error)
    throw error
  }
}

// Fitness activities queries (using FitnessLog table)
export async function getFitnessActivities(studentId: number) {
  try {
    const result = await executeQuery(
      `SELECT LogID, ActivityType, DurationMinutes, CaloriesBurned, Distance, LogDate, FK_StudentID, CreatedDate 
       FROM FitnessLog 
       WHERE FK_StudentID = :studentId 
       ORDER BY LogDate DESC`,
      [studentId],
    )
    return result.rows?.map((row: any) => ({
      id: row.LOGID,
      activity_type: row.ACTIVITYTYPE,
      duration_minutes: row.DURATIONMINUTES,
      calories_burned: row.CALORIESBURNED,
      distance: row.DISTANCE,
      activity_date: row.LOGDATE,
      student_id: row.FK_STUDENTID,
      created_date: row.CREATEDDATE
    })) || []
  } catch (error) {
    console.error("[v0] Error fetching fitness activities:", error)
    throw error
  }
}

export async function createFitnessActivity(data: {
  studentId: number
  activityType: string
  durationMinutes: number
  caloriesBurned: number
  distance?: number
  activityDate: string
}) {
  try {
    const result = await executeQuery(
      `INSERT INTO FitnessLog (ActivityType, DurationMinutes, CaloriesBurned, Distance, LogDate, FK_StudentID, CreatedDate)
       VALUES (:activityType, :durationMinutes, :caloriesBurned, :distance, TO_DATE(:activityDate, 'YYYY-MM-DD'), :studentId, SYSDATE)`,
      [data.activityType, data.durationMinutes, data.caloriesBurned, data.distance || null, data.activityDate, data.studentId],
    )
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating fitness activity:", error)
    throw error
  }
}

export async function deleteFitnessActivity(logId: number) {
  try {
    await executeQuery(
      `DELETE FROM FitnessLog WHERE LogID = :1`,
      [logId],
    )
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting fitness activity:", error)
    throw error
  }
}
