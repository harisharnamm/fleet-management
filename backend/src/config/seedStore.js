/**
 * Resilient In-Memory Seed Store
 * Used as test store fallback and seed reference for testing and offline development.
 */
export const initialSeedStore = {
  users: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@fleetms.com',
      password_hash: '$2a$10$wT02jWzZp.x9s4o8LgPeeuD6dGf0K7mZJvHnB3c.kPZ0dO8WkW1.W',
      full_name: 'System Administrator',
      role: 'admin',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      email: 'manager@fleetms.com',
      password_hash: '$2a$10$wT02jWzZp.x9s4o8LgPeeuD6dGf0K7mZJvHnB3c.kPZ0dO8WkW1.W',
      full_name: 'Fleet Operations Manager',
      role: 'fleet_manager',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      email: 'viewer@fleetms.com',
      password_hash: '$2a$10$wT02jWzZp.x9s4o8LgPeeuD6dGf0K7mZJvHnB3c.kPZ0dO8WkW1.W',
      full_name: 'Read-Only Viewer',
      role: 'viewer',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    }
  ],
  vehicles: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      vin: '1FTFW1ED5MFC12345',
      registration_number: 'FLT-101-TX',
      make: 'Ford',
      model: 'F-150 Lightning',
      year: 2023,
      status: 'active',
      type: 'electric',
      assigned_driver_id: 'a0000000-0000-0000-0000-000000000002',
      created_at: new Date('2026-01-15T08:00:00Z').toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      vin: '3FRTL7E23NDA54321',
      registration_number: 'FLT-202-CA',
      make: 'Freightliner',
      model: 'Cascadia Heavy',
      year: 2022,
      status: 'active',
      type: 'truck',
      assigned_driver_id: null,
      created_at: new Date('2026-01-16T09:00:00Z').toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      vin: '1FTBR1Y89PKA67890',
      registration_number: 'FLT-303-NY',
      make: 'Ford',
      model: 'Transit 350 HD Cargo',
      year: 2021,
      status: 'maintenance',
      type: 'van',
      assigned_driver_id: null,
      created_at: new Date('2026-01-17T10:00:00Z').toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      vin: '5YJ3E1EB8NF112233',
      registration_number: 'FLT-404-WA',
      make: 'Tesla',
      model: 'Model Y Fleet',
      year: 2024,
      status: 'active',
      type: 'electric',
      assigned_driver_id: 'a0000000-0000-0000-0000-000000000003',
      created_at: new Date('2026-01-18T11:00:00Z').toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      vin: '2C3CDXBG8PH998877',
      registration_number: 'FLT-505-IL',
      make: 'Ram',
      model: 'ProMaster 2500',
      year: 2020,
      status: 'inactive',
      type: 'van',
      assigned_driver_id: null,
      created_at: new Date('2026-01-19T12:00:00Z').toISOString()
    }
  ],
  telemetry: [],
  vehicle_events: [],
  notifications: []
};

export let activeStore = JSON.parse(JSON.stringify(initialSeedStore));

export function resetStore() {
  activeStore = JSON.parse(JSON.stringify(initialSeedStore));
  return activeStore;
}
