export interface Registration {
  id: string;
  phoneNumber: string;
  status: RegistrationStatus;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED'
}

export interface RegistrationRequest {
  phoneNumber: string;
}

export interface VerificationRequest {
  phoneNumber: string;
  code: string;
} 