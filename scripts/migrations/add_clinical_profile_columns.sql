-- Add missing columns to HealthProfile table for Nurse Clinical Profile functionality
-- Run this script to update the database schema

ALTER TABLE HealthProfile ADD (
    Weight NUMBER(5,2),
    BloodPressure VARCHAR2(20),
    HeartRate NUMBER(3),
    Temperature NUMBER(4,2),
    MedicalNotes VARCHAR2(1000),
    EmergencyContact VARCHAR2(200)
);

-- Add check constraints
ALTER TABLE HealthProfile ADD CONSTRAINT chk_weight_positive CHECK (Weight > 0 AND Weight <= 500);
ALTER TABLE HealthProfile ADD CONSTRAINT chk_heartrate_valid CHECK (HeartRate > 0 AND HeartRate <= 300);
ALTER TABLE HealthProfile ADD CONSTRAINT chk_temperature_valid CHECK (Temperature > 30 AND Temperature < 45);

COMMIT;
