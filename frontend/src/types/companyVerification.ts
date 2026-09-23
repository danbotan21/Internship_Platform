// Mirrors InternshipPlatform.BusinessLayer/Onboarding.
// Enums arrive as strings because the API registers JsonStringEnumConverter.

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected'

export type SubmitVerificationRequest = {
  legalName: string
  registrationNumber: string
  website: string
  headquarters: string
  industry: string
  companySize: string
  position: string
  phone?: string
}

export type MyVerificationRequest = {
  id: string
  status: VerificationStatus
  legalName: string
  registrationNumber: string
  website: string
  headquarters: string
  industry: string
  companySize: string
  position: string
  phone: string | null
  createdAt: string
  decidedAt: string | null
  rejectionReason: string | null
  companyId: string | null
}

export type MyVerificationState = {
  canSubmit: boolean
  alreadyInCompany: boolean
  request: MyVerificationRequest | null
}
