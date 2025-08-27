export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'resident';
  buildingId?: string;
  wingId?: string;
  floorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalFloors: number;
  ownerId: string;
  paymentQRCode?: string;
  paymentImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wing {
  id: string;
  name: string;
  buildingId: string;
  totalFloors: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Floor {
  id: string;
  number: number;
  wingId: string;
  buildingId: string;
  totalUnits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  work: string;
  maintenancePaid: boolean;
  maintenanceAmount: number;
  buildingId: string;
  wingId: string;
  floorId: string;
  unitNumber: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  servicemanName: string;
  phone: string;
  address: string;
  openingTime: string;
  closingTime: string;
  buildingId: string;
  wingIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'resident';
  buildingId: string;
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  residentId: string;
  residentName: string;
  buildingId: string;
  wingId: string;
  floorId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  buildingId: string;
  type: 'qr' | 'image';
  data: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  residentId: string;
  buildingId: string;
  amount: number;
  type: 'maintenance' | 'utility' | 'service' | 'other';
  status: 'pending' | 'completed' | 'failed';
  qrCodeData?: string;
  paymentDate?: Date;
  dueDate: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
