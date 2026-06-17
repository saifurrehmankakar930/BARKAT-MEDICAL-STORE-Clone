/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Branch {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export type UserRole = "Admin" | "Pharmacist" | "Saleperson";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  branchId: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;    // cost price from supplier
  retailPrice: number;  // sale price to patient
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;   // YYYY-MM-DD
  stockQty: number;
  drapControlled: boolean; // if true, requires valid prescription & DRAP compliant logs
  description?: string;
}

export type PaymentMethod = "Cash" | "Credit Ledger" | "Digital/Card" | "Split";

export interface Sale {
  id: string;
  branchId: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  rxNumber?: string;
  total: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: string; // details of split payment
  synced: boolean; // false if made offline and not yet pushed to backend
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  qty: number;
  price: number; // retailPrice at timing of sale
}

export type PurchaseStatus = "Draft" | "Ordered" | "Received" | "Cancelled";

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  status: PurchaseStatus;
  total: number;
  varianceDetected: boolean; // if supplier price differs from last cost price
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  qty: number;
  costPrice: number;
  retailPrice: number;
  batchNumber: string;
  expiryDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  ledgerBalance: number; // positive means we owe supplier, negative is prepaid
  address?: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  rxNumber: string; // DRAP require Rx verification number
  productId: string;
  productName: string;
  branchId: string;
  createdAt: string;
  qty: number;
}

export type LedgerAccountType = "Cash Book" | "Supplier Ledger" | "Customer Ledger" | "Revenue Account" | "Expense Account";

export interface LedgerEntry {
  id: string;
  accountType: LedgerAccountType;
  entityId: string; // e.g. supplierId, or saleId
  entityName: string; // supplier name or customer name
  description: string;
  debit: number;  // cash index or ledger incoming
  credit: number; // cash out or ledger payment
  balance: number; // cumulative balance
  createdAt: string;
}

export interface PaymentCard {
  id: string;
  cardholderName: string;
  bankName: string; // e.g. Meezan Bank, HBL, EasyPaisa, etc.
  cardNumber: string; // e.g. **** 1234
  cardType: "Debit" | "Credit" | "Mobile Wallet" | "Other";
  expiryDate?: string; // MM/YY
  isActive: boolean;
  createdAt: string;
}
