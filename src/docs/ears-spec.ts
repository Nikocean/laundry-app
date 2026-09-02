import { EARSRequirement } from '../types/laundry';

export const EARS_SPECIFICATIONS: EARSRequirement[] = [
  // 1. CUSTOMER MOBILE APP (Flutter Specification)
  {
    id: 'REQ-CUST-001',
    module: 'Customer App',
    type: 'Ubiquitous',
    earsSyntax: 'The Customer Mobile App shall display available laundry service categories (Pakaian Kiloan, Pakaian Satuan, Tas Branded, Sepatu, Bedcover) with real-time pricing and estimated processing duration.',
    statement: 'The system shall present laundry catalog with category filters, dynamic pricing per unit/kg, and duration estimates.',
    acceptanceCriteria: [
      'Customer sees clearly differentiated categories: Kiloan, Pakaian Satuan, Tas, Sepatu, Bedcover.',
      'Pricing is formatted in IDR (Rupiah) with calculation breakdowns.',
      'Aroma perfume selector is provided during order creation.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-CUST-002',
    module: 'Customer App',
    type: 'Event-driven',
    earsSyntax: 'WHEN a customer submits a new laundry pickup booking, the Customer Mobile App shall dispatch the order to the backend, set status to "pending", generate a unique order number, and trigger an admin notification.',
    statement: 'Submitting a booking creates an active order record with pending status and logs an initial timeline entry.',
    acceptanceCriteria: [
      'Order record includes items, perfume choice, pickup address, and payment method.',
      'Order state enters "pending" waiting for store confirmation or courier pickup.',
      'Customer receives instant booking confirmation card with tracking link.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-CUST-003',
    module: 'Customer App',
    type: 'State-driven',
    earsSyntax: 'WHILE an order is in the "delivering" or "picked_up" state, the Customer Mobile App shall render a real-time GPS tracking map displaying the assigned courier marker, vehicle details, live ETA, and route polyline.',
    statement: 'Active transit states show real-time moving courier coordinates, driver contact options, and arrival estimates.',
    acceptanceCriteria: [
      'Map renders courier motorcycle icon with pulsing location indicator.',
      'Courier name, photo, phone, vehicle plate number, and rating are visible.',
      'Progress stepper reflects 6 operational milestones in real time.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-CUST-004',
    module: 'Customer App',
    type: 'Event-driven',
    earsSyntax: 'WHEN an order status changes in the backend, the Customer Mobile App shall update the status badge and timeline immediately without requiring manual page refresh.',
    statement: 'Real-time synchronization reflects washing, packing, and courier delivery progress immediately.',
    acceptanceCriteria: [
      'Status progression (pending -> picked_up -> washing -> done -> delivering -> delivered) triggers UI update.',
      'Timeline displays exact timestamp and operational actor (Admin, Kurir, or Sistem).'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-CUST-005',
    module: 'Customer App',
    type: 'Optional Feature',
    earsSyntax: 'WHERE the customer selects Express Service, the Customer Mobile App shall apply express turnaround pricing multiplier and set guaranteed completion timeframe within 24 hours.',
    statement: 'Express service provides priority processing badge and calculates expedited service fees.',
    acceptanceCriteria: [
      'Express badge highlights priority washing status.',
      'Estimated completion time adjusts from 48h (regular) to 12-24h (express).'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-CUST-006',
    module: 'Customer App',
    type: 'Unwanted Behaviour',
    earsSyntax: 'IF the customer attempts to submit an order without a valid address or selected items, THEN the Customer Mobile App shall prevent submission and highlight missing mandatory fields.',
    statement: 'Form validation prevents empty carts or incomplete delivery coordinates from generating invalid orders.',
    acceptanceCriteria: [
      'Validation toast notifies user if cart is empty or address is blank.',
      'Submit button disables or displays validation errors before network call.'
    ],
    status: 'IMPLEMENTED'
  },

  // 2. COURIER MOBILE APP (Flutter Courier Specification)
  {
    id: 'REQ-COUR-001',
    module: 'Courier App',
    type: 'Ubiquitous',
    earsSyntax: 'The Courier Mobile App shall provide an operational duty toggle enabling the courier to switch between "Online (Siap Antar/Jemput)" and "Offline (Istirahat)".',
    statement: 'Courier availability state governs automated task assignment and dispatch availability in the admin portal.',
    acceptanceCriteria: [
      'Courier can toggle availability switch with immediate visual status indicator.',
      'Completed tasks count and today earnings update dynamically.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-COUR-002',
    module: 'Courier App',
    type: 'Event-driven',
    earsSyntax: 'WHEN an admin assigns a pickup or delivery task to the courier, the Courier Mobile App shall sound an alert, display the task in the active queue, and provide customer navigation coordinates.',
    statement: 'Assigned orders appear in real-time under "Penjemputan" or "Pengantaran" tabs with address, customer contact, and item notes.',
    acceptanceCriteria: [
      'Task card shows customer name, phone, item summary, and destination address.',
      'One-tap navigation button opens live route simulator to the customer location.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-COUR-003',
    module: 'Courier App',
    type: 'Complex',
    earsSyntax: 'WHILE executing a delivery task, WHEN the courier taps "Tiba & Konfirmasi Pengantaran", the Courier Mobile App shall require capturing/uploading a Proof of Delivery (PoD) photo before transitioning the order to "delivered".',
    statement: 'Delivery completion requires proof of delivery photo attachment and optional customer digital sign-off.',
    acceptanceCriteria: [
      'Camera / file upload photo proof dialog is triggered.',
      'Order transitions to "delivered" and timestamp is recorded in audit timeline.',
      'Proof photo is viewable immediately by customer and web admin.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-COUR-004',
    module: 'Courier App',
    type: 'Event-driven',
    earsSyntax: 'WHEN the courier picks up laundry bags from customer premises, the Courier Mobile App shall transition order status to "picked_up" and notify the laundry workshop.',
    statement: 'Pickup confirmation moves order from pending to picked up and logs courier handover.',
    acceptanceCriteria: [
      'Tapping "Konfirmasi Jemput" sets status to picked_up.',
      'Customer app receives notification that items are on the way to workshop.'
    ],
    status: 'IMPLEMENTED'
  },

  // 3. ADMIN WEB DASHBOARD (Desktop Management Specification)
  {
    id: 'REQ-ADM-001',
    module: 'Admin Web Dashboard',
    type: 'Ubiquitous',
    earsSyntax: 'The Admin Web Dashboard shall provide a real-time Kanban board and searchable Data Grid to monitor all laundry orders across every operational lifecycle stage.',
    statement: 'Admin dashboard provides unified visibility over Pending, Picked Up, Washing, Done, Delivering, and Delivered orders.',
    acceptanceCriteria: [
      'Live status counter cards display current active volume per state.',
      'Orders can be searched by customer name, order number, or phone number.',
      'Filters allow quick isolation by status, service type, or payment status.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-ADM-002',
    module: 'Admin Web Dashboard',
    type: 'Event-driven',
    earsSyntax: 'WHEN a laundry technician advances the wash stage (e.g. from "picked_up" to "washing", or "washing" to "done"), the Admin Web Dashboard shall update the state machine and broadcast the new status to the customer and courier apps.',
    statement: 'One-click status transitions update the database and broadcast real-time state changes to all connected clients.',
    acceptanceCriteria: [
      'Status change buttons provide quick progression (e.g. "Mulai Cuci", "Selesai Cuci & Packing", "Siap Diantar").',
      'Timeline automatically captures admin name and exact timestamp.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-ADM-003',
    module: 'Admin Web Dashboard',
    type: 'Event-driven',
    earsSyntax: 'WHEN the admin assigns an available courier to a ready order, the Admin Web Dashboard shall bind the courier profile to the order and update the order state to "delivering".',
    statement: 'Courier assignment modal lists available couriers with current task load and vehicle info.',
    acceptanceCriteria: [
      'Modal displays list of active and available couriers.',
      'Assigning a courier binds courierId, name, phone, plate, and sets status to delivering.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-ADM-004',
    module: 'Offline POS Store',
    type: 'Ubiquitous',
    earsSyntax: 'The Admin Web Dashboard shall feature an Offline Walk-in POS (Point of Sale) module allowing store operators to register walk-in customer orders with weight scales, itemized services, perfume choices, and thermal receipt generation.',
    statement: 'Offline POS enables walk-in laundry input with instant thermal receipt generation and digital tracking code.',
    acceptanceCriteria: [
      'Admin can input walk-in customer details, scale weight (kg), or item quantities (tas, sepatu, baju).',
      'Calculates total price, payment method (Cash/QRIS), and marks source as "offline_pos".',
      'Generates printable thermal receipt with barcode for customer online status tracking.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-ADM-005',
    module: 'Admin Web Dashboard',
    type: 'Ubiquitous',
    earsSyntax: 'The Admin Web Dashboard shall provide financial reporting and operational analytics, calculating daily gross revenue, kilograms washed, active couriers on duty, and popular services breakdown.',
    statement: 'Analytics view visualizes revenue metrics, order velocity, and service distribution.',
    acceptanceCriteria: [
      'Summary metrics calculate total revenue in IDR, total kg processed, and completion rates.',
      'Charts display daily revenue trends and breakdown of service types.'
    ],
    status: 'IMPLEMENTED'
  },

  // 4. CLOUD BACKEND & STATE MACHINE SPECIFICATION
  {
    id: 'REQ-BE-001',
    module: 'Cloud Backend & State Machine',
    type: 'State-driven',
    earsSyntax: 'WHILE processing order status transitions, the Cloud Backend shall enforce strict State Machine progression: pending -> picked_up -> washing -> done -> delivering -> delivered (or cancelled).',
    statement: 'Order state machine strictly validates valid transitions and disallows invalid backward steps without explicit override.',
    acceptanceCriteria: [
      'Direct invalid jumps (e.g. pending directly to delivered) are rejected.',
      'Every transition generates an immutable audit timeline event with actor attribution.'
    ],
    status: 'IMPLEMENTED'
  },
  {
    id: 'REQ-BE-002',
    module: 'Cloud Backend & State Machine',
    type: 'Event-driven',
    earsSyntax: 'WHEN any order status changes via Cloud Function or store action, the Cloud Backend shall publish notification payloads to subscribed customer and courier device listeners.',
    statement: 'Event bus broadcasts push notification alerts across all app roles.',
    acceptanceCriteria: [
      'Customer app receives push alert upon washing completion and courier dispatch.',
      'Courier receives alert when assigned a new pickup or delivery job.'
    ],
    status: 'IMPLEMENTED'
  }
];
