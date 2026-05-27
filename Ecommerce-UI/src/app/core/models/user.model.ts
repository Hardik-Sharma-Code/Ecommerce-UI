import { KycStatus } from '../enums/kyc-status.enum';

// --- Admin list DTOs (returned by /admin/users, /admin/customers, /admin/vendors) ---
export interface UserListDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

// --- Customer DTOs ---
export interface CustomerProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CustomerRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateCustomerProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// --- Vendor DTOs ---
export interface VendorProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  kycStatus: KycStatus;
}

export interface VendorRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  businessDescription?: string;
  businessPhone?: string;
  businessAddress?: string;
}

export interface UpdateVendorProfileDto {
  firstName: string;
  lastName: string;
  businessName: string;
  businessDescription?: string;
  businessPhone?: string;
  businessAddress?: string;
}

// --- KYC DTOs ---
export interface KycSubmissionDto {
  documentType: string;
  documentNumber: string;
}

export interface KycStatusDto {
  status: KycStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface UpdateVendorKycStatusDto {
  status: KycStatus;
  rejectionReason?: string;
}
