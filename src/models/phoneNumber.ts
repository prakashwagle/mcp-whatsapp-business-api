export interface PhoneNumber {
  id: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: QualityRating;
  codeVerificationStatus: CodeVerificationStatus;
  messagingLimit: MessagingLimit;
  createdAt: Date;
  updatedAt: Date;
}

export enum QualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export enum CodeVerificationStatus {
  VERIFIED = 'VERIFIED',
  NOT_VERIFIED = 'NOT_VERIFIED',
  PENDING = 'PENDING'
}

export interface MessagingLimit {
  tier: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
} 