export type UserRole = 'customer' | 'courier' | 'admin';

export type OrderStatus =
  | 'pending'       // Pesanan dibuat, menunggu konfirmasi / penjemputan
  | 'picked_up'     // Cucian telah dijemput kurir & tiba di workshop
  | 'washing'       // Sedang dalam proses cuci, pengeringan, & setrika
  | 'done'          // Selesai dipacking, siap diantar atau siap diambil
  | 'delivering'    // Sedang dalam perjalanan diantar oleh kurir ke customer
  | 'delivered'     // Telah diterima oleh customer (dengan bukti foto)
  | 'cancelled';    // Dibatalkan

export type ServiceType =
  | 'kiloan_reguler'
  | 'kiloan_express'
  | 'satuan_baju'
  | 'satuan_tas'
  | 'satuan_sepatu'
  | 'satuan_bedcover'
  | 'setrika_saja';

export type PaymentMethod = 'qris' | 'cash' | 'transfer_bank' | 'ewallet';
export type PaymentStatus = 'unpaid' | 'paid' | 'cod';
export type OrderSource = 'app_customer' | 'offline_pos';

export interface OrderItem {
  id: string;
  name: string;
  category: 'pakaian' | 'tas' | 'sepatu' | 'linen' | 'kiloan';
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface LocationCoordinate {
  lat: number;
  lng: number;
  address: string;
  detail?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  isAvailable: boolean;
  currentLocation: {
    x: number; // percentage on map (0-100)
    y: number; // percentage on map (0-100)
    address: string;
  };
  activeOrderId?: string;
  completedToday: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
  actor: 'system' | 'customer' | 'admin' | 'courier';
  actorName?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "LND-2026-0891"
  source: OrderSource;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoordinates: { x: number; y: number };
  items: OrderItem[];
  totalWeightKg?: number;
  serviceType: ServiceType;
  serviceName: string;
  perfumeAroma: string;
  specialInstructions?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierAvatar?: string;
  estimatedDeliveryTime?: string;
  proofPhotoUrl?: string;
  proofSignatureUrl?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
  isExpress: boolean;
}

export interface ServiceDefinition {
  id: ServiceType;
  name: string;
  description: string;
  category: 'kiloan' | 'satuan' | 'spesial';
  basePrice: number;
  unit: string;
  estimatedDurationHours: number;
  iconName: string;
  popular?: boolean;
}

export interface PerfumeOption {
  id: string;
  name: string;
  notes: string;
  isPopular?: boolean;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
  type: 'order_created' | 'status_changed' | 'courier_assigned' | 'delivery_update' | 'payment_received';
}

export interface EARSRequirement {
  id: string;
  module: 'Customer App' | 'Courier App' | 'Admin Web Dashboard' | 'Cloud Backend & State Machine' | 'Offline POS Store';
  type: 'Ubiquitous' | 'Event-driven' | 'State-driven' | 'Unwanted Behaviour' | 'Optional Feature' | 'Complex';
  earsSyntax: string;
  statement: string;
  acceptanceCriteria: string[];
  status: 'IMPLEMENTED' | 'VERIFIED';
}
