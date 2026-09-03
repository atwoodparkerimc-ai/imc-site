import { SupabaseClient } from "@supabase/supabase-js";

// ==========================================
// 1. DATA TYPES & INTERFACES
// ==========================================

export interface UserProfile {
  id: string;
  first_name: string;
  last_name?: string | null;
  nickname: string | null;
  role: string;
  points_balance: number;
  lifetime_points?: number; // Career Earnings Field
  location?: string | null;
  must_change_password?: boolean;
  last_safety_check?: string;
  last_safe_act_date?: string;
  terms_accepted_at?: string | null;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  cost_in_points: number;
  quantity_in_stock: number;
  description?: string;
  image_url?: string;
  images?: string[]; // Array of photo URLs for gallery carousel
  category?: string;
  is_featured?: boolean;
}

export interface PointLedgerEntry {
  id: string;
  created_at: string;
  amount: number;
  sender_id: string;
  receiver_id: string;
  reason: string;
}

export interface SafeActRecord {
  id: string;
  created_at: string;
  reporter_id: string;
  recipient_id?: string;
  reason?: string;
}

export interface SafetyMeetingRecord {
  id: string;
  meeting_date: string;
  manager_id: string;
}

export interface LedgerActivityItem {
  id: string;
  description: string;
  amount: number;
  type: 'award' | 'redemption';
  created_at: string;
}

// ==========================================
// 2. PROFILE & USER OPERATIONS
// ==========================================

/** Fetch an individual employee profile by user ID */
export async function getEmployeeProfile(
  supabase: SupabaseClient, 
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, nickname, role, points_balance, location, must_change_password, last_safety_check, last_safe_act_date, terms_accepted_at')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

/** Record user acceptance of the Employee Incentive Program Terms */
export async function acceptEmployeeTerms(
  supabase: SupabaseClient, 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Failed to record terms acceptance:", err);
    return { success: false, error: err.message };
  }
}

/** Fetch a user's current points balance */
export async function getUserPointsBalance(
  supabase: SupabaseClient, 
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', userId)
    .single();

  if (error || !data) return 0;
  return data.points_balance || 0;
}

/** Calculate total lifetime points earned by summing all positive ledger entries */
export async function getUserLifetimePoints(
  supabase: SupabaseClient,
  userId: string,
  currentBalance: number = 0
): Promise<number> {
  const { data, error } = await supabase
    .from('point_ledger')
    .select('amount')
    .eq('receiver_id', userId)
    .gt('amount', 0);

  if (error || !data) return currentBalance;
  
  const ledgerSum = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Career total should always be at least equal to current redeemable balance
  return Math.max(ledgerSum, currentBalance);
}

/** Seed or initialize backdated points for a new or existing employee profile */
export async function initializeBackdatedPoints(
  supabase: SupabaseClient,
  payload: {
    userId: string;
    points: number;
    hireDate?: string; // Optional ISO string for backdating (e.g. "2024-01-15T00:00:00.000Z")
  }
): Promise<{ success: boolean; error?: string }> {
  const timestamp = payload.hireDate || new Date().toISOString();

  // Insert initial ledger entry backdated to hire date
  // (Supabase DB Trigger will automatically handle updating profiles.points_balance)
  const { error: ledgerErr } = await supabase
    .from('point_ledger')
    .insert([
      {
        sender_id: payload.userId,
        receiver_id: payload.userId,
        amount: payload.points,
        reason: 'BACKDATED HIRE POINTS ALLOCATION',
        created_at: timestamp
      }
    ]);

  if (ledgerErr) return { success: false, error: ledgerErr.message };

  return { success: true };
}

/** Fetch list of team members at the SAME LOCATION, excluding the current active user */
export async function getPeerProfiles(
  supabase: SupabaseClient, 
  userId: string,
  userLocation?: string | null
): Promise<Pick<UserProfile, 'id' | 'first_name' | 'last_name' | 'nickname' | 'location'>[]> {
  let query = supabase
    .from('profiles')
    .select('id, first_name, last_name, nickname, location')
    .neq('id', userId);

  // Strictly filter peers matching active site location if provided
  if (userLocation) {
    query = query.eq('location', userLocation);
  }

  const { data, error } = await query.order('first_name');

  if (error) {
    console.error("Error fetching peer profiles:", error.message);
    return [];
  }
  return data || [];
}

/** Update user display nickname preference */
export async function updateUserProfileNickname(
  supabase: SupabaseClient, 
  userId: string, 
  nickname: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Update employee password requirement flag upon first login completion */
export async function completePasswordChange(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ==========================================
// 2B. LOCATION & TRANSFER OPERATIONS
// ==========================================

/** Fetch all available active job locations */
export async function getJobLocations(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('name')
    .order('name', { ascending: true });

  // Updated fallback array to include Nestle Gaffney
  if (error || !data || data.length === 0) {
    return ['Nestle Springville', 'Nestle Gaffney', 'Springville Shop'];
  }
  return data.map(l => l.name);
}

/** Update an employee's location assignment without modifying point history */
export async function updateUserLocation(
  supabase: SupabaseClient, 
  userId: string, 
  location: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ location })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ==========================================
// 3. STORE & INVENTORY OPERATIONS
// ==========================================

/** Fetch all active store catalog items */
export async function getInventoryItems(
  supabase: SupabaseClient
): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching inventory items:", error.message);
    return [];
  }
  return (data as InventoryItem[]) || [];
}

/** Add a new catalog item to the store inventory with rich details */
export async function addInventoryItem(
  supabase: SupabaseClient, 
  payload: { 
    itemName: string; 
    costInPoints: number; 
    quantityInStock: number;
    description?: string;
    category?: string;
    images?: string[];
    isFeatured?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('inventory').insert([
    {
      item_name: payload.itemName,
      cost_in_points: payload.costInPoints,
      quantity_in_stock: payload.quantityInStock,
      description: payload.description || null,
      category: payload.category || 'General',
      images: payload.images && payload.images.length > 0 ? payload.images : null,
      image_url: payload.images && payload.images.length > 0 ? payload.images[0] : null,
      is_featured: payload.isFeatured || false
    }
  ]);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Delete a catalog item from inventory by ID */
export async function deleteInventoryItemById(
  supabase: SupabaseClient, 
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('inventory').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Execute a store item redemption purchase */
export async function redeemStoreItem(
  supabase: SupabaseClient, 
  userId: string, 
  itemId: string, 
  cost: number
): Promise<{ success: boolean; error?: string }> {
  // 1. Verify user points balance
  const currentBalance = await getUserPointsBalance(supabase, userId);
  if (currentBalance < cost) {
    return { success: false, error: "Insufficient points balance." };
  }

  // 2. Verify inventory stock
  const { data: itemData } = await supabase
    .from('inventory')
    .select('quantity_in_stock')
    .eq('id', itemId)
    .single();

  if (!itemData || itemData.quantity_in_stock <= 0) {
    return { success: false, error: "Item is out of stock." };
  }

  // 3. Insert record into redemptions table
  const { error: redemptionErr } = await supabase
    .from('redemptions')
    .insert({
      employee_id: userId,
      item_id: itemId,
      points_spent: cost,
      status: 'pending_pickup'
    });

  if (redemptionErr) {
    return { success: false, error: redemptionErr.message };
  }

  // 4. Deduct points balance on user profile
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ points_balance: currentBalance - cost })
    .eq('id', userId);

  if (profileErr) {
    return { success: false, error: profileErr.message };
  }

  // 5. Decrement inventory item stock
  await supabase
    .from('inventory')
    .update({ quantity_in_stock: itemData.quantity_in_stock - 1 })
    .eq('id', itemId);

  return { success: true };
}

// ==========================================
// 4. DAILY SAFETY BRIEFINGS & RECOGNITIONS
// ==========================================

/** Process user completion of the daily safety briefing (+10 PTS) */
export async function completeDailySafetyBriefing(
  supabase: SupabaseClient, 
  userId: string
): Promise<{ success: boolean; alreadyCheckedIn?: boolean; error?: string }> {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check if user already signed the daily check-in
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_safety_check')
    .eq('id', userId)
    .single();

  if (profile?.last_safety_check === todayStr) {
    return { success: false, alreadyCheckedIn: true };
  }

  // 2. Insert point ledger entry
  // (Supabase DB Trigger will automatically add +10 to profiles.points_balance)
  const { error: ledgerError } = await supabase
    .from('point_ledger')
    .insert([
      {
        sender_id: userId,
        receiver_id: userId,
        amount: 10,
        reason: 'DAILY SAFETY BRIEFING'
      }
    ]);

  if (ledgerError) {
    return { success: false, error: ledgerError.message };
  }

  // 3. Record daily check-in date on profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ last_safety_check: todayStr })
    .eq('id', userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true };
}

/** 
 * Submit a peer Safe Act report:
 * - Reporter always gets +5 PTS.
 * - Recipient 1st report today = +10 PTS.
 * - Recipient 2nd report today = +5 PTS (hits 15 PTS daily cap).
 * - Recipient 3+ reports today = +0 PTS (capped), but observation is still recorded.
 */
export async function submitSafeActReport(
  supabase: SupabaseClient, 
  payload: { reporterId: string; recipientId: string; reason: string }
): Promise<{ success: boolean; alreadyReportedToday?: boolean; recipientBonusGranted?: boolean; error?: string }> {
  const todayStr = new Date().toISOString().split('T')[0];
  const startOfDay = `${todayStr}T00:00:00.000Z`;

  // 1. Verify reporter hasn't already filed a report today & fetch display name
  const { data: reporterProfile } = await supabase
    .from('profiles')
    .select('last_safe_act_date, first_name, last_name, nickname')
    .eq('id', payload.reporterId)
    .single();

  if (reporterProfile?.last_safe_act_date === todayStr) {
    return { success: false, alreadyReportedToday: true };
  }

  const reporterName = reporterProfile?.nickname || `${reporterProfile?.first_name || ''} ${reporterProfile?.last_name || ''}`.trim() || "a coworker";

  // 2. Check how many Safe Acts recipient has already received TODAY
  const { data: existingActsToday } = await supabase
    .from('safe_acts')
    .select('id')
    .eq('recipient_id', payload.recipientId)
    .gte('created_at', startOfDay);

  const previousCountToday = existingActsToday?.length || 0;

  // Calculate recipient point allocation based on daily cap rules
  let recipientAwardAmount = 0;
  if (previousCountToday === 0) {
    recipientAwardAmount = 10; // 1st report: +10 PTS
  } else if (previousCountToday === 1) {
    recipientAwardAmount = 5;  // 2nd report: +5 PTS Multi-Recognition Bonus (Hits 15 PTS cap)
  } else {
    recipientAwardAmount = 0;  // 3+ reports: +0 PTS (Recipient capped)
  }

  // 3. Log safe act entry
  const { error: safeActErr } = await supabase
    .from('safe_acts')
    .insert([
      {
        reporter_id: payload.reporterId,
        recipient_id: payload.recipientId,
        reason: payload.reason
      }
    ]);

  if (safeActErr) {
    console.error("Safe Act Insert Error:", safeActErr.message);
    return { success: false, error: safeActErr.message };
  }

  // 4. Log point ledger entries
  // (The Supabase DB Trigger will automatically add points_balance to profiles for both entries!)
  const fullReason = `REPORTED SAFE ACT: ${payload.reason}`;
  const ledgerEntries = [
    { sender_id: payload.reporterId, receiver_id: payload.reporterId, amount: 5, reason: fullReason }
  ];

  if (recipientAwardAmount > 0) {
    ledgerEntries.push({
      sender_id: payload.reporterId,
      receiver_id: payload.recipientId,
      amount: recipientAwardAmount,
      reason: recipientAwardAmount === 5 ? `${fullReason} [MULTI-RECOGNITION BONUS]` : fullReason
    });
  }

  const { error: ledgerErr } = await supabase
    .from('point_ledger')
    .insert(ledgerEntries);

  if (ledgerErr) {
    return { success: false, error: ledgerErr.message };
  }

  // 5. Send popup notification record to recipient
  if (recipientAwardAmount > 0) {
    const { error: notifErr } = await supabase.from('notifications').insert([
      {
        user_id: payload.recipientId,
        message: `You were awarded +${recipientAwardAmount} PTS by ${reporterName}! Reason: ${payload.reason}`,
        is_read: false
      }
    ]);

    if (notifErr) {
      console.error("Safe Act Notification Exception:", notifErr.message);
    }
  }

  // 6. Mark reporter's daily check-in date
  await supabase
    .from('profiles')
    .update({ last_safe_act_date: todayStr })
    .eq('id', payload.reporterId);

  return { success: true, recipientBonusGranted: previousCountToday === 1 };
}

/** Award manager recognition points to an employee */
export async function awardPointsToEmployee(
  supabase: SupabaseClient, 
  payload: { managerId: string; employeeId: string; amount: number; category: string; reason: string }
): Promise<{ success: boolean; error?: string }> {
  const fullReason = `${payload.category.toUpperCase()}: ${payload.reason}`;

  // 1. Fetch manager name for clean popup messaging
  const { data: managerProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, nickname')
    .eq('id', payload.managerId)
    .single();

  const managerName = managerProfile?.nickname || `${managerProfile?.first_name || ''} ${managerProfile?.last_name || ''}`.trim() || "a Manager";

  // 2. Record transaction in point_ledger
  // (The Supabase DB Trigger automatically updates profiles.points_balance)
  const { error: ledgerError } = await supabase.from('point_ledger').insert([
    {
      sender_id: payload.managerId,
      receiver_id: payload.employeeId,
      amount: payload.amount,
      reason: fullReason
    }
  ]);

  if (ledgerError) {
    return { success: false, error: ledgerError.message };
  }

  // 3. Send popup notification record to recipient
  const { error: notifErr } = await supabase.from('notifications').insert([
    {
      user_id: payload.employeeId,
      message: `You received +${payload.amount} PTS from ${managerName}! Reason: ${payload.reason}`,
      is_read: false
    }
  ]);

  if (notifErr) {
    console.error("Manager Award Notification Exception:", notifErr.message);
  }

  return { success: true };
}

// ==========================================
// 5. HAZARDS & ROLL CALL AUDITS
// ==========================================

/** Fetch the latest broadcast hazard score for a specific job location */
export async function getLatestHazardScore(
  supabase: SupabaseClient,
  location: string = 'Springville Shop'
): Promise<number> {
  const { data } = await supabase
    .from('daily_hazards')
    .select('hazard_count')
    .eq('location', location)
    .order('recorded_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.hazard_count ?? 0;
}

/** Update or broadcast the site daily hazard score for a specific job location */
export async function updateDailyHazardScore(
  supabase: SupabaseClient, 
  payload: { recordedDate: string; hazardCount: number; updatedBy: string | null; location?: string }
): Promise<{ success: boolean; error?: string }> {
  const siteLocation = payload.location || 'Springville Shop';

  const { error } = await supabase.from('daily_hazards').upsert(
    {
      recorded_date: payload.recordedDate,
      hazard_count: payload.hazardCount,
      updated_by: payload.updatedBy,
      location: siteLocation
    },
    { onConflict: 'location,recorded_date' }
  );

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Finalize and archive daily roll call audit log */
export async function finalizeDailyAuditLog(
  supabase: SupabaseClient, 
  payload: { auditDate: string; safetyTopic: string; gridData: any; finalizedBy: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('audit_logs').insert([
    {
      audit_date: payload.auditDate,
      safety_topic: payload.safetyTopic,
      grid_data: payload.gridData,
      finalized_by: payload.finalizedBy
    }
  ]);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ==========================================
// 6. LEDGER & ACTIVITY FEED OPERATORS
// ==========================================

/** Fetch user unified ledger history (awards + redemptions) */
export async function getUserLedgerActivity(
  supabase: SupabaseClient, 
  userId: string
): Promise<LedgerActivityItem[]> {
  const [ledgerRes, redemptionsRes] = await Promise.all([
    supabase
      .from('point_ledger')
      .select('*')
      .eq('receiver_id', userId) // Strictly fetch points RECEIVED by this employee
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('redemptions')
      .select('id, points_spent, created_at, status')
      .eq('employee_id', userId)
      .order('created_at', { ascending: false })
      .limit(15)
  ]);

  const activity: LedgerActivityItem[] = [];

  if (ledgerRes.data) {
    ledgerRes.data.forEach((row: any) => {
      activity.push({
        id: `ledger-${row.id}`,
        description: row.reason || 'Points Awarded',
        amount: row.amount,
        type: 'award',
        created_at: row.created_at
      });
    });
  }

  if (redemptionsRes.data) {
    redemptionsRes.data.forEach((row: any) => {
      activity.push({
        id: `redemption-${row.id}`,
        description: `Store Redemption (${row.status})`,
        amount: row.points_spent,
        type: 'redemption',
        created_at: row.created_at
      });
    });
  }

  return activity;
}

/** Fetch master data set required for the Manager Command Center */
export async function getManagerMasterData(supabase: SupabaseClient) {
  const [teamRes, awardsRes, actsRes, meetingsRes, redemptionsRes] = await Promise.all([
    supabase.from('profiles').select('id, first_name, last_name, nickname, role, points_balance, location, must_change_password').order('first_name'),
    supabase.from('point_ledger').select('*').gt('amount', 0),
    supabase.from('safe_acts').select('*'),
    supabase.from('safety_meetings').select('*'),
    supabase.from('redemptions').select('id', { count: 'exact' })
  ]);

  const allUsers = (teamRes.data as UserProfile[]) || [];
  const activeTeam = allUsers.filter(p => p.role !== 'manager');

  return {
    allUsers,
    activeTeam,
    awards: (awardsRes.data as PointLedgerEntry[]) || [],
    safeActs: (actsRes.data as SafeActRecord[]) || [],
    safetyMeetings: (meetingsRes.data as SafetyMeetingRecord[]) || [],
    requisitionCount: redemptionsRes.count || 0
  };
}

// ==========================================
// 7. CERTIFICATIONS & FIELD TOOLS
// ==========================================

export interface EmployeeCertRecord {
  id?: string;
  employee_id: string;
  cert_type: string;
  issue_date: string | null;
  expiration_date: string | null;
}

export type CertStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_TRAINED';

export interface EvaluatedCert {
  typeKey: string;
  title: string;
  status: CertStatus;
  issueDate: string | null;
  expirationDate: string | null;
  daysRemaining: number | null;
}

// Master list of certifications based on user role
export const BASE_EMPLOYEE_CERTS = [
  { key: 'scissor_lift', title: 'Scissor Lift Operator' },
  { key: 'boom_lift', title: 'Boom Lift Operator' },
  { key: 'forklift', title: 'Forklift Operator' },
  { key: 'confined_space', title: 'Confined Space Entry' },
  { key: 'arc_flash', title: 'Arc Flash Safety' },
  { key: 'osha_10', title: 'OSHA 10-Hour General Industry' },
];

export const MANAGER_ADDITIONAL_CERTS = [
  { key: 'osha_30', title: 'OSHA 30-Hour Safety' },
  { key: 'osha_511', title: 'OSHA 511 General Industry' },
  { key: 'lift_trainer', title: 'Certified Lift Trainer' },
];

/** Evaluate certification status against the 90-day warning threshold */
export function calculateCertStatus(
  issueDateStr: string | null,
  expirationDateStr: string | null
): { status: CertStatus; daysRemaining: number | null } {
  // 1. If no dates exist at all, they haven't completed training
  if (!issueDateStr && !expirationDateStr) {
    return { status: 'NOT_TRAINED', daysRemaining: null };
  }

  // 2. If it has an issue date but never expires (e.g. OSHA 10)
  if (!expirationDateStr) {
    return { status: 'VALID', daysRemaining: null };
  }

  // 3. If an expiration date exists, calculate the timeline
  const now = new Date();
  const exp = new Date(expirationDateStr);
  const diffTime = exp.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: 'EXPIRED', daysRemaining };
  if (daysRemaining <= 90) return { status: 'EXPIRING_SOON', daysRemaining };
  return { status: 'VALID', daysRemaining };
}

/** Fetch employee certifications evaluated with status badges */
export async function getEmployeeCertifications(
  supabase: SupabaseClient,
  userId: string,
  userRole: string
): Promise<EvaluatedCert[]> {
  const { data: rawCerts } = await supabase
    .from('employee_certifications')
    .select('*')
    .eq('employee_id', userId);

  const certMap = new Map<string, EmployeeCertRecord>();
  if (rawCerts) {
    rawCerts.forEach((c: EmployeeCertRecord) => certMap.set(c.cert_type, c));
  }

  const allowedCerts = [...BASE_EMPLOYEE_CERTS];
  if (userRole === 'manager') {
    allowedCerts.push(...MANAGER_ADDITIONAL_CERTS);
  }

  return allowedCerts.map((cert) => {
    const record = certMap.get(cert.key);
    const issueDate = record?.issue_date || null;
    const expDate = record?.expiration_date || null;
    const { status, daysRemaining } = calculateCertStatus(issueDate, expDate);

    return {
      typeKey: cert.key,
      title: cert.title,
      status,
      issueDate,
      expirationDate: expDate,
      daysRemaining
    };
  });
}

/** Upsert an employee certification record */
export async function upsertEmployeeCertification(
  supabase: SupabaseClient,
  payload: {
    employee_id: string;
    cert_type: string;
    issue_date: string | null;
    expiration_date: string | null;
  }
) {
  const { data, error } = await supabase
    .from('employee_certifications')
    .upsert(
      {
        employee_id: payload.employee_id,
        cert_type: payload.cert_type,
        issue_date: payload.issue_date || null,
        expiration_date: payload.expiration_date || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'employee_id,cert_type' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating certification:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/** Fetch required daily paperwork URL for a given location */
export async function getLocationPaperworkUrl(
  supabase: SupabaseClient,
  locationName: string | null | undefined
): Promise<string | null> {
  if (!locationName) return null;

  const target = locationName.trim();

  // 1. Exact match attempt
  const { data: exactData, error: exactErr } = await supabase
    .from('locations')
    .select('name, paperwork_url')
    .ilike('name', target)
    .maybeSingle();

  if (exactErr) {
    console.error("Paperwork URL Query Exception:", exactErr.message);
  }

  if (exactData?.paperwork_url) {
    return exactData.paperwork_url;
  }

  // 2. Fuzzy wildcard attempt (handles partial location string matches)
  const { data: fuzzyData } = await supabase
    .from('locations')
    .select('paperwork_url')
    .ilike('name', `%${target}%`)
    .not('paperwork_url', 'is', null)
    .limit(1)
    .maybeSingle();

  if (fuzzyData?.paperwork_url) {
    return fuzzyData.paperwork_url;
  }

  // 3. Keyword fallback (e.g., if profile string is "Nestle Springville", match any row containing "Nestle")
  const primaryWord = target.split(' ')[0];
  if (primaryWord.length > 2) {
    const { data: keywordData } = await supabase
      .from('locations')
      .select('paperwork_url')
      .ilike('name', `%${primaryWord}%`)
      .not('paperwork_url', 'is', null)
      .limit(1)
      .maybeSingle();

    return keywordData?.paperwork_url || null;
  }

  return null;
}

/** Upsert employee certification dates (Manager Only) */
export async function saveEmployeeCertification(
  supabase: SupabaseClient,
  payload: { employeeId: string; certType: string; issueDate: string | null; expirationDate: string | null }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('employee_certifications')
    .upsert(
      {
        employee_id: payload.employeeId,
        cert_type: payload.certType,
        issue_date: payload.issueDate,
        expiration_date: payload.expirationDate,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'employee_id,cert_type' }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ==========================================
// 8. ORDER FULFILLMENT & LOGISTICS
// ==========================================

export interface RedemptionRecord {
  id: string;
  created_at: string;
  employee_id: string;
  item_id: string;
  points_spent: number;
  status: 'pending_pickup' | 'in_progress' | 'ordered' | 'fulfilled' | 'cancelled';
  assigned_manager_id?: string | null;
  
  // Joined Data
  employee?: { first_name: string; last_name?: string | null; nickname: string | null; location: string | null };
  item?: { item_name: string; image_url: string | null; images: string[] | null };
  manager?: { first_name: string; last_name?: string | null; nickname: string | null };
}

/** Fetch all redemption orders with joined employee and item data */
export async function getFulfillmentOrders(
  supabase: SupabaseClient
): Promise<RedemptionRecord[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select(`
      *,
      employee:profiles!employee_id(first_name, last_name, nickname, location),
      item:inventory!item_id(item_name, image_url, images),
      manager:profiles!assigned_manager_id(first_name, last_name, nickname)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch fulfillment orders:", error.message);
    return [];
  }
  
  return data as unknown as RedemptionRecord[];
}

/** Update the status and assignment of a specific order */
export async function updateOrderStatus(
  supabase: SupabaseClient,
  redemptionId: string,
  status: string,
  managerId: string | null
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('redemptions')
    .update({ 
      status: status,
      assigned_manager_id: managerId
    })
    .eq('id', redemptionId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Cancel an order, return points to the employee, replenish stock, and notify the user */
export async function cancelAndRefundOrder(
  supabase: SupabaseClient,
  order: RedemptionRecord,
  managerId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: cancelErr } = await supabase
      .from('redemptions')
      .update({ 
        status: 'cancelled',
        assigned_manager_id: managerId
      })
      .eq('id', order.id);

    if (cancelErr) throw cancelErr;

    const itemName = order.item?.item_name || 'Store Item';
    const { error: ledgerErr } = await supabase
      .from('point_ledger')
      .insert([
        {
          sender_id: managerId || order.employee_id,
          receiver_id: order.employee_id,
          amount: order.points_spent,
          reason: `REFUND: REQUISITION CANCELLED (${itemName.toUpperCase()})`
        }
      ]);

    if (ledgerErr) throw ledgerErr;

    const { data: itemData } = await supabase
      .from('inventory')
      .select('quantity_in_stock')
      .eq('id', order.item_id)
      .single();

    if (itemData) {
      await supabase
        .from('inventory')
        .update({ quantity_in_stock: (itemData.quantity_in_stock || 0) + 1 })
        .eq('id', order.item_id);
    }

    await supabase.from('notifications').insert([
      {
        user_id: order.employee_id,
        message: `Your order for "${itemName}" was cancelled and ${order.points_spent} PTS have been refunded to your account.`,
        is_read: false
      }
    ]);

    return { success: true };
  } catch (err: any) {
    console.error("Order cancellation failed:", err);
    return { success: false, error: err.message || "Failed to cancel order." };
  }
}

/** Update an existing catalog inventory item */
export async function updateInventoryItem(
  supabase: SupabaseClient,
  id: string,
  payload: {
    itemName: string;
    costInPoints: number;
    quantityInStock: number;
    description?: string;
    category?: string;
    images?: string[];
    isFeatured?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('inventory')
    .update({
      item_name: payload.itemName,
      cost_in_points: payload.costInPoints,
      quantity_in_stock: payload.quantityInStock,
      description: payload.description || null,
      category: payload.category || 'General',
      images: payload.images && payload.images.length > 0 ? payload.images : null,
      image_url: payload.images && payload.images.length > 0 ? payload.images[0] : null,
      is_featured: payload.isFeatured || false
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ==========================================
// 9. SITE-SPECIFIC BRIEFING ROUTING
// ==========================================

/** Set a site-specific safety briefing override for the current day */
export async function setSiteBriefingOverride(
  supabase: SupabaseClient,
  locationName: string,
  briefingId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const { data, error } = await supabase
    .from('locations')
    .update({
      active_briefing_id: briefingId,
      active_briefing_date: todayStr
    })
    .ilike('name', locationName.trim()) // Bulletproof match (ignores case/spaces)
    .select();

  if (error) return { success: false, error: error.message };

  if (!data || data.length === 0) {
    return { success: false, error: `Location '${locationName}' not found or blocked by RLS.` };
  }

  return { success: true };
}

/** Fetch the active briefing override for a specific location (if valid for today) */
export async function getActiveSiteBriefingId(
  supabase: SupabaseClient,
  locationName: string | null | undefined
): Promise<string | null> {
  if (!locationName) return null;
  
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const { data, error } = await supabase
    .from('locations')
    .select('active_briefing_id, active_briefing_date')
    .ilike('name', locationName.trim()) // ilike prevents case-sensitivity bugs
    .maybeSingle();

  if (error || !data) return null;
  
  // Only return the override if it was explicitly set for the local TODAY
  if (data.active_briefing_date === todayStr) {
    return data.active_briefing_id;
  }
  
  return null;
}