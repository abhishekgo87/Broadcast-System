// ==================== TYPES ====================

export interface Contact {
  id: number;
  name: string;
  phone: string;
  status?: 'waiting' | 'pending' | 'sent' | 'failed';
  error?: string;
  raw?: Record<string, unknown>;
}

export interface UploadResponse {
  success: boolean;
  totalRows: number;
  validContacts: number;
  columns: string[];
  phoneColumn: string;
  nameColumn: string;
  contacts: Contact[];
}

export interface SmsResult {
  id: number;
  phone: string;
  name: string;
  status: 'sent' | 'failed';
  sid?: string;
  messageStatus?: string;
  error?: string;
}

export interface SendResponse {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  results: SmsResult[];
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface Campaign {
  id: string;
  name: string;
  date: string;
  message: string;
  totalContacts: number;
  sent: number;
  failed: number;
  status: 'completed' | 'partially_failed' | 'failed';
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}
