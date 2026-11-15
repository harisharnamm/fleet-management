import { query, pool } from '../../config/db.js';
import { activeStore } from '../../config/seedStore.js';

class UsersService {
  async listUsers() {
    if (pool) {
      try {
        const res = await query(
          'SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        return res.rows;
      } catch (err) {
        console.warn('[UsersService] Neon DB list failed, using fallback:', err.message);
      }
    }

    return activeStore.users.map(({ password_hash, ...u }) => u);
  }

  async getUserById(id) {
    if (pool) {
      try {
        const res = await query(
          'SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
          [id]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('[UsersService] Neon DB getUserById failed:', err.message);
      }
    }

    const user = activeStore.users.find((u) => u.id === id);
    if (!user) {
      const error = new Error(`User with ID '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async updateUserRole(id, newRole) {
    if (pool) {
      try {
        const res = await query(
          'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, is_active, created_at, updated_at',
          [newRole, id]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('[UsersService] Neon DB updateRole failed:', err.message);
      }
    }

    const user = activeStore.users.find((u) => u.id === id);
    if (!user) {
      const error = new Error(`User with ID '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    user.role = newRole;
    user.updated_at = new Date().toISOString();
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async deleteUser(id) {
    if (pool) {
      try {
        const res = await query(
          'DELETE FROM users WHERE id = $1 RETURNING id, email, full_name, role, is_active, created_at, updated_at',
          [id]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('[UsersService] Neon DB deleteUser failed:', err.message);
      }
    }

    const userIndex = activeStore.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      const error = new Error(`User with ID '${id}' not found.`);
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const removed = activeStore.users.splice(userIndex, 1)[0];
    const { password_hash, ...safeUser } = removed;
    return safeUser;
  }
}

export const usersService = new UsersService();
