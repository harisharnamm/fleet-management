-- ============================================================================
-- 04_seed_data.sql
-- Fleet Management System — SGA 2
-- Seed data for testing and initial demonstration
-- Note: Passwords are all hashed for 'Password123!'
-- Hash generated via bcryptjs: $2a$10$iMhTjJvD1L0tKkWtE3a0Ce6j7v7Bvj0cT0e0w0m0z0k0p0q0r0s0t
-- ============================================================================

-- 1. Seed Users (Admin, Fleet Manager, Viewer)
-- Password for all seed users is 'Password123!'
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@fleetms.com', '$2a$10$Ew.V5p6b4kE20Z.8iI9XaeM44Qc1m0hPjZlC69aN4Y93u8kH7fT6y', 'System Administrator', 'admin', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'manager@fleetms.com', '$2a$10$Ew.V5p6b4kE20Z.8iI9XaeM44Qc1m0hPjZlC69aN4Y93u8kH7fT6y', 'Fleet Operations Manager', 'fleet_manager', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'viewer@fleetms.com', '$2a$10$Ew.V5p6b4kE20Z.8iI9XaeM44Qc1m0hPjZlC69aN4Y93u8kH7fT6y', 'Read-Only Viewer', 'viewer', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2. Seed 5 Vehicles
INSERT INTO vehicles (id, vin, registration_number, make, model, year, status, type, assigned_driver_id)
VALUES
    ('b0000000-0000-0000-0000-000000000001', '1FTFW1ED5MFC12345', 'FLT-101-TX', 'Ford', 'F-150 Lightning', 2023, 'active', 'electric', 'a0000000-0000-0000-0000-000000000002'),
    ('b0000000-0000-0000-0000-000000000002', '3FRTL7E23NDA54321', 'FLT-202-CA', 'Freightliner', 'Cascadia Heavy', 2022, 'active', 'truck', NULL),
    ('b0000000-0000-0000-0000-000000000003', '1FTBR1Y89PKA67890', 'FLT-303-NY', 'Ford', 'Transit 350 HD Cargo', 2021, 'maintenance', 'van', NULL),
    ('b0000000-0000-0000-0000-000000000004', '5YJ3E1EB8NF112233', 'FLT-404-WA', 'Tesla', 'Model Y Fleet', 2024, 'active', 'electric', 'a0000000-0000-0000-0000-000000000003'),
    ('b0000000-0000-0000-0000-000000000005', '2C3CDXBG8PH998877', 'FLT-505-IL', 'Ram', 'ProMaster 2500', 2020, 'inactive', 'van', NULL)
ON CONFLICT (registration_number) DO NOTHING;

-- 3. Seed Telemetry Records (Coordinates centered around San Francisco Bay Area: 37.7749, -122.4194)
-- Notice ST_MakePoint takes (longitude, latitude)
INSERT INTO telemetry (id, vehicle_id, speed, fuel_level, battery_level, engine_temp, latitude, longitude, location, odometer, recorded_at)
VALUES
    -- Vehicle 1: Active in Downtown SF (approx 0.5 km from center)
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 48.5, NULL, 78.0, 72.0, 37.7792, -122.4140, ST_SetSRID(ST_MakePoint(-122.4140, 37.7792), 4326)::geography, 14250.2, NOW() - INTERVAL '5 minutes'),
    -- Vehicle 2: Cascadia Truck near Port of Oakland (approx 11 km east)
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 62.0, 84.5, NULL, 94.0, 37.8044, -122.2712, ST_SetSRID(ST_MakePoint(-122.2712, 37.8044), 4326)::geography, 88920.0, NOW() - INTERVAL '2 minutes'),
    -- Vehicle 3: Transit in Maintenance Yard (South SF, approx 14 km south)
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 0.0, 42.0, NULL, 28.0, 37.6547, -122.4077, ST_SetSRID(ST_MakePoint(-122.4077, 37.6547), 4326)::geography, 64200.5, NOW() - INTERVAL '1 hour'),
    -- Vehicle 4: Tesla Model Y in Mission District (approx 2 km south)
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 34.0, NULL, 91.5, 68.0, 37.7599, -122.4148, ST_SetSRID(ST_MakePoint(-122.4148, 37.7599), 4326)::geography, 8310.4, NOW() - INTERVAL '1 minute'),
    -- Vehicle 5: Inactive ProMaster in depot
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 0.0, 15.0, NULL, 22.0, 37.7312, -122.3888, ST_SetSRID(ST_MakePoint(-122.3888, 37.7312), 4326)::geography, 112400.0, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Vehicle Events
INSERT INTO vehicle_events (id, vehicle_id, event_type, severity, description, metadata, created_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'ENGINE_OVERHEAT', 'critical', 'Engine coolant temperature exceeded safety threshold: 108C', '{"temp_c": 108, "threshold": 105}'::jsonb, NOW() - INTERVAL '2 hours'),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'GEOFENCE_EXIT', 'medium', 'Vehicle departed designated dispatch zone: SF Metro Hub', '{"zone": "SF_METRO"}'::jsonb, NOW() - INTERVAL '45 minutes'),
    ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'STATUS_CHANGE', 'high', 'Vehicle status changed from active to maintenance due to engine alert', '{"prev_status": "active", "new_status": "maintenance"}'::jsonb, NOW() - INTERVAL '1 hour 55 minutes')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Notifications (Mock SMS Delivery Records)
INSERT INTO notifications (id, recipient, message, channel, status, event_id, provider_response, sent_at, created_at)
VALUES
    ('e0000000-0000-0000-0000-000000000001', '+14155552671', 'CRITICAL ALERT: Ford Transit FLT-303-NY engine overheated (108C). Vehicle pulled into South SF yard.', 'sms', 'delivered', 'd0000000-0000-0000-0000-000000000001', '{"mock_provider": "SimulatedSMS", "message_id": "MOCK-SMS-9921", "latency_ms": 142, "network": "T-Mobile", "status_code": "DELIVRD"}'::jsonb, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    ('e0000000-0000-0000-0000-000000000002', '+14155558912', 'DISPATCH NOTICE: Ford F-150 FLT-101-TX has crossed outside SF Metro perimeter.', 'sms', 'delivered', 'd0000000-0000-0000-0000-000000000002', '{"mock_provider": "SimulatedSMS", "message_id": "MOCK-SMS-9922", "latency_ms": 98, "network": "Verizon", "status_code": "DELIVRD"}'::jsonb, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Gateway API Key (Hashed for 'dev-secret-key-12345')
INSERT INTO api_keys (id, name, key_hash, owner_id, is_active, permissions, expires_at)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Default Gateway Dev Key', 'dev-secret-key-12345', 'a0000000-0000-0000-0000-000000000001', TRUE, '["*"]'::jsonb, NOW() + INTERVAL '1 year')
ON CONFLICT (key_hash) DO NOTHING;
