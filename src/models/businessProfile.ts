export interface BusinessProfile {
  id: string;
  name: string;
  address: string;
  description: string;
  email: string;
  website: string;
  profilePictureUrl: string;
  vertical: string;
  messagingProduct: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfileUpdate {
  name?: string;
  address?: string;
  description?: string;
  email?: string;
  website?: string;
  vertical?: string;
} 