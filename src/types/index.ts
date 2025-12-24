// User types
export type UserRole = 'super_admin' | 'admin' | 'operator'
export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended'
export type PlatformAccess = 'mobile' | 'web' | 'both'

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  university?: string
  role: UserRole
  status: UserStatus
  platform_access: PlatformAccess
  initial_password: boolean
  created_at: string
}

export interface Operator extends User {
  sessions_count?: number
  last_active?: string
}

// Session types
export type SessionStatus = 'draft' | 'active' | 'completed' | 'cancelled'

export interface Session {
  id: string
  operatorId: string
  respondentId: string
  status: SessionStatus
  createdAt: string
  startedAt?: string
  endedAt?: string
  config: SessionConfig
  operator?: User
  respondent?: Respondent
  reactionTrials?: ReactionTrial[]
  vitalReadings?: VitalReading[]
  tympaniReadings?: TympaniReading[]
}

export interface SessionConfig {
  testType: 'reaction_time' | 'tympanic' | 'vitals' | 'combined'
  stimulusTypes?: ('visual' | 'auditory' | 'tactile')[]
  duration?: number
  repetitions?: number
}

// Respondent types
export interface Respondent {
  id: string
  guest_name: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  weight?: number
  height?: number
  status?: string
  university?: string
  created_at: string
}

// Data readings types
export interface ReactionTrial {
  id: string
  session_id: string
  response_time: number
  stimulus_type: string
  stimulus_category: string
  created_at: string
}

export interface VitalReading {
  id: string
  session_id: string
  heart_rate?: number
  heart_rate_variability?: number
  spo2?: number
  reading_time: string
}

export interface TympaniReading {
  id: string
  session_id: string
  temperature: number
  reading_time: string
}

// Dashboard stats
export interface DashboardStats {
  totalOperators: number
  activeSessions: number
  completedSessions: number
  totalRespondents: number
  totalReactionTrials: number
  averageReactionTime: number
  systemHealth: SystemHealth
}

export interface SystemHealth {
  backend: boolean
  database: boolean
  esp32Server: boolean
  esp32Clients: number
}

// API types
export interface LoginRequest {
  username: string
  password: string
  platform: 'web'
}

export interface LoginResponse {
  access_token: string
  token_type: string
  requires_password_change?: boolean
}

export interface ListResponse<T> {
  items: T[]
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

// Export types
export interface ExportRequest {
  sessionIds?: string[]
  startDate?: string
  endDate?: string
  format: 'csv' | 'json'
  include: ('sessions' | 'reaction_trials' | 'vital_readings' | 'tympani_readings')[]
}

export interface BulkRecordingRespondent {
  local_id?: number
  name: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  created_at?: string
}

export interface TympaniBulkRecording {
  id: string
  label: string
  operator_id: string
  operator_name?: string
  respondent: BulkRecordingRespondent
  time_start: string
  time_end: string
  count: number
  created_at: string
}

export interface HrvBulkRecording {
  id: string
  label: string
  operator_id: string
  operator_name?: string
  respondent: BulkRecordingRespondent
  time_start: string
  time_end: string
  count: number
  created_at: string
}

export interface SummaryOperatorItem {
  operator_id: string
  operator_name: string
  tympani_count: number
  hrv_count: number
}

export interface SummaryOperatorResponse {
  range: { from: string; to: string }
  items: SummaryOperatorItem[]
}

export interface SummaryTimeSeriesItem {
  period: string
  tympani_count: number
  hrv_count: number
}

export interface SummaryTimeSeriesResponse {
  range: { from: string; to: string }
  group_by: 'day' | 'week' | 'month'
  series: SummaryTimeSeriesItem[]
}

export interface SummaryGlobalResponse {
  range: { from: string; to: string }
  tympani_count: number
  hrv_count: number
  operators_active: number
}
