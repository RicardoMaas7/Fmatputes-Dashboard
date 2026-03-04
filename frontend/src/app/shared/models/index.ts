/** Modelo de usuario del backend */
export interface User {
  id: string;
  username: string;
  displayName: string | null;
  birthday: string | null;
  profilePhotoUrl: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  bankAccounts?: BankAccount[];
  serviceDebts?: UserServiceDebt[];
  transportSeats?: TransportSeat[];
  treasuryPayments?: TreasuryPayment[];
  notifications?: Notification[];
}

/** Cuenta bancaria */
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  created_at: string;
}

/** Servicio compartido */
export interface SharedService {
  id: string;
  name: string;
  iconUrl: string | null;
  totalCost: number;
  nextPaymentDate: string | null;
  isActive: boolean;
  pendingBalance?: number;
}

/** Deuda de usuario en un servicio */
export interface UserServiceDebt {
  id: string;
  userId: string;
  serviceId: string;
  pendingBalance: number;
  user?: Pick<User, 'id' | 'username' | 'displayName'>;
  service?: SharedService;
}

/** Transporte */
export interface Transport {
  id: string;
  name: string;
  driverName: string | null;
  paradero: string | null;
  departureMorning: string | null;
  returnMorning: string | null;
  totalSeats: number;
  isActive: boolean;
  seats: TransportSeat[];
  occupiedSeats?: number;
  availableSeats?: number;
  userPendingBalance?: number;
}

/** Asiento de transporte */
export interface TransportSeat {
  id: string;
  transportId: string;
  userId: string;
  pendingBalance: number;
  user?: Pick<User, 'id' | 'username' | 'displayName'>;
  transport?: Transport;
}

/** Tesorería */
export interface Treasury {
  id: string;
  name: string;
  totalCollected: number;
  nextGoalAmount: number;
  nextGoalDescription: string | null;
  progress?: number;
  userTotalPaid?: number;
  payments?: TreasuryPayment[];
}

/** Pago a tesorería */
export interface TreasuryPayment {
  id: string;
  userId: string;
  treasuryId: string;
  amountPaid: number;
  created_at: string;
}

/** Notificación */
export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: string;
  isRead: boolean;
  created_at: string;
}

/** Recordatorio */
export interface Reminder {
  id: string;
  title: string;
  message: string | null;
  type: 'info' | 'warning' | 'urgent';
  isActive: boolean;
  is_active?: boolean;
  expiresAt: string | null;
  expires_at?: string | null;
  createdBy: string;
  created_at: string;
  creator?: Pick<User, 'id' | 'displayName'>;
}

/** Resultado de radar/votación */
export interface VoteResult {
  userId: string;
  results: Record<string, { average: number; voteCount: number }>;
  averages?: Record<string, number>;
}

/** Radar SVG response */
export interface RadarResponse {
  userId: string;
  username: string;
  displayName: string;
  stats: Record<string, number>;
  svg: string | null;
}

/** JWT payload / current user */
export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

/** Login response */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}
