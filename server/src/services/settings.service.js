import crypto from 'crypto';
import supabase from '../config/db.js';

// Pre-seeded in-memory user preferences fallback (mirrors database/seeds.sql)
const initialSeedPreferences = [
  {
    id: 'fa000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001', // Manager
    low_stock_enabled: true,
    critical_stock_enabled: true,
    out_of_stock_enabled: true,
    system_notifications_enabled: true,
    created_at: new Date('2026-09-29T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-29T10:00:00Z').toISOString()
  },
  {
    id: 'fa000000-0000-0000-0000-000000000002',
    user_id: 'e0000000-0000-0000-0000-000000000002', // Staff
    low_stock_enabled: true,
    critical_stock_enabled: true,
    out_of_stock_enabled: true,
    system_notifications_enabled: true,
    created_at: new Date('2026-09-29T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-29T10:00:00Z').toISOString()
  }
];

let inMemoryPreferences = JSON.parse(JSON.stringify(initialSeedPreferences));

/**
 * Format raw preference record into standard API response.
 */
function formatPreferences(record) {
  const lowStock = Boolean(record.low_stock_enabled ?? record.lowStockEnabled ?? true);
  const criticalStock = Boolean(record.critical_stock_enabled ?? record.criticalStockEnabled ?? true);
  const outOfStock = Boolean(record.out_of_stock_enabled ?? record.outOfStockEnabled ?? true);
  const systemNotifs = Boolean(record.system_notifications_enabled ?? record.systemNotificationsEnabled ?? true);

  return {
    id: record.id,
    userId: record.user_id || record.userId,
    low_stock_enabled: lowStock,
    critical_stock_enabled: criticalStock,
    out_of_stock_enabled: outOfStock,
    system_notifications_enabled: systemNotifs,
    lowStockEnabled: lowStock,
    criticalStockEnabled: criticalStock,
    outOfStockEnabled: outOfStock,
    systemNotificationsEnabled: systemNotifs,
    createdAt: record.created_at || record.createdAt,
    updatedAt: record.updated_at || record.updatedAt
  };
}

/**
 * Retrieves preferences for the given authenticated user ID.
 * If no preference record exists yet, initializes with default settings (all true).
 */
export async function getUserPreferences(userId) {
  if (!userId) {
    throw new Error('User ID is required to fetch preferences');
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return formatPreferences(data);
      }

      // If not exists in Supabase, create default record
      const defaultRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        low_stock_enabled: true,
        critical_stock_enabled: true,
        out_of_stock_enabled: true,
        system_notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: created, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultRecord)
        .select('*')
        .single();

      if (!insertError && created) {
        return formatPreferences(created);
      }
    } catch (err) {
      console.warn('[PREFERENCES DB WARNING] Supabase query failed, checking fallback store:', err.message);
    }
  }

  // Fallback in-memory
  let record = inMemoryPreferences.find(
    (p) => p.user_id === userId || p.userId === userId
  );

  if (!record) {
    record = {
      id: crypto.randomUUID(),
      user_id: userId,
      low_stock_enabled: true,
      critical_stock_enabled: true,
      out_of_stock_enabled: true,
      system_notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryPreferences.push(record);
  }

  return formatPreferences(record);
}

/**
 * Updates preferences for the given authenticated user ID.
 * Only allowlisted fields are updated.
 */
export async function updateUserPreferences(userId, updateData = {}) {
  if (!userId) {
    throw new Error('User ID is required to update preferences');
  }

  // Ensure record exists
  const existing = await getUserPreferences(userId);

  const updates = {
    updated_at: new Date().toISOString()
  };

  if (updateData.low_stock_enabled !== undefined) {
    updates.low_stock_enabled = Boolean(updateData.low_stock_enabled);
  } else if (updateData.lowStockEnabled !== undefined) {
    updates.low_stock_enabled = Boolean(updateData.lowStockEnabled);
  }

  if (updateData.critical_stock_enabled !== undefined) {
    updates.critical_stock_enabled = Boolean(updateData.critical_stock_enabled);
  } else if (updateData.criticalStockEnabled !== undefined) {
    updates.critical_stock_enabled = Boolean(updateData.criticalStockEnabled);
  }

  if (updateData.out_of_stock_enabled !== undefined) {
    updates.out_of_stock_enabled = Boolean(updateData.out_of_stock_enabled);
  } else if (updateData.outOfStockEnabled !== undefined) {
    updates.out_of_stock_enabled = Boolean(updateData.outOfStockEnabled);
  }

  if (updateData.system_notifications_enabled !== undefined) {
    updates.system_notifications_enabled = Boolean(updateData.system_notifications_enabled);
  } else if (updateData.systemNotificationsEnabled !== undefined) {
    updates.system_notifications_enabled = Boolean(updateData.systemNotificationsEnabled);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (!error && data) {
        return formatPreferences(data);
      }
    } catch (err) {
      console.warn('[PREFERENCES DB WARNING] Supabase update failed:', err.message);
    }
  }

  // Fallback in-memory
  const memRecord = inMemoryPreferences.find(
    (p) => p.user_id === userId || p.userId === userId
  );

  if (memRecord) {
    Object.assign(memRecord, updates);
    return formatPreferences(memRecord);
  }

  const newRecord = {
    ...existing,
    ...updates,
    id: existing.id || crypto.randomUUID(),
    user_id: userId
  };
  inMemoryPreferences.push(newRecord);
  return formatPreferences(newRecord);
}

/**
 * Resets in-memory preferences for test isolation.
 */
export function _resetInMemoryPreferences() {
  inMemoryPreferences = JSON.parse(JSON.stringify(initialSeedPreferences));
}

export default {
  getUserPreferences,
  updateUserPreferences,
  _resetInMemoryPreferences
};
