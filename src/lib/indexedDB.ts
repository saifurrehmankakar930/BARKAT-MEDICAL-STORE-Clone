/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale, SaleItem, Purchase, Supplier, Prescription, LedgerEntry, Branch, PaymentCard } from "../types";

const DB_NAME = "BarakatMedicalStoreDB";
const DB_VERSION = 2;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB failed to open");
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains("branches")) {
        db.createObjectStore("branches", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sale_items")) {
        db.createObjectStore("sale_items", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("purchases")) {
        db.createObjectStore("purchases", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("suppliers")) {
        db.createObjectStore("suppliers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("prescriptions")) {
        db.createObjectStore("prescriptions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("ledger_entries")) {
        db.createObjectStore("ledger_entries", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("payment_cards")) {
        db.createObjectStore("payment_cards", { keyPath: "id" });
      }

      // Seeding will happen right after database upgrades
      const transaction = event.currentTarget ? (event.currentTarget as IDBOpenDBRequest).transaction : null;
      if (transaction) {
        seedInitialData(db, transaction);
      }
    };
  });
}

// Help seed appropriate Quetta/Balochistan pharmaceutical distributor & products
function seedInitialData(db: IDBDatabase, transaction: IDBTransaction) {
  const branchStore = transaction.objectStore("branches");
  const productStore = transaction.objectStore("products");
  const supplierStore = transaction.objectStore("suppliers");
  const ledgerStore = transaction.objectStore("ledger_entries");

  // Branches
  const b1: Branch = { id: "B1", name: "Barakat Medical Store - Jinnah Road, Quetta", address: "Opposite Civil Hospital, Jinnah Road, Quetta, Balochistan, Pakistan", createdAt: "2026-01-10" };
  const b2: Branch = { id: "B2", name: "Barakat Pharmacy - Double Road, Quetta", address: "Double Road near Al-Khair Hospital, Quetta", createdAt: "2026-03-15" };
  branchStore.put(b1);
  branchStore.put(b2);

  // Suppliers
  const s1: Supplier = { id: "SUP1", name: "Kakar Pharma Distributors", phone: "0321-8273612", ledgerBalance: 45000, address: "Phar-Mandi, Faisal Street, Quetta" };
  const s2: Supplier = { id: "SUP2", name: "Balochistan Medicine Market Wholesalers", phone: "0333-7819201", ledgerBalance: 12000, address: "Toghi Road, Quetta" };
  const s3: Supplier = { id: "SUP3", name: "Haleem & Sons Pharmaceuticals", phone: "0300-8811223", ledgerBalance: -5000, address: "Spinny Road, Quetta" };
  supplierStore.put(s1);
  supplierStore.put(s2);
  supplierStore.put(s3);

  // Products conforming to Balochistan/DRAP
  const initialProducts: Product[] = [
    { id: "P1", name: "Panadol 500mg Tablets (100s)", category: "Analgesic", unitPrice: 2.2, retailPrice: 3.0, reorderLevel: 200, batchNumber: "PAN-B992", expiryDate: "2027-11-20", stockQty: 480, drapControlled: false, description: "GlaxoSmithKline paracetamol tablets for relief of fever and pain" },
    { id: "P2", name: "Augmentin Gen 625mg Tablets (14s)", category: "Antibiotic", unitPrice: 420, retailPrice: 520, reorderLevel: 20, batchNumber: "AUG-H112", expiryDate: "2026-09-12", stockQty: 8, drapControlled: false, description: "Amoxicillin and Clavulanate potassium broad-spectrum antibiotic. Keep in a dry cool place." },
    { id: "P3", name: "Brufen 400mg Tablets (30s)", category: "Anti-inflammatory", unitPrice: 85, retailPrice: 115, reorderLevel: 50, batchNumber: "BRU-0012", expiryDate: "2028-02-28", stockQty: 18, drapControlled: false, description: "Ibuprofen anti-inflammatory relief" },
    { id: "P4", name: "Surbex Z Multivitamins Tablets (30s)", category: "Nutritional Support", unitPrice: 280, retailPrice: 340, reorderLevel: 30, batchNumber: "SRB-M102", expiryDate: "2027-04-10", stockQty: 110, drapControlled: false, description: "High-potency vitamin B-complex with zinc for body immunity" },
    { id: "P5", name: "Arinac Forte Tablets (100s)", category: "Decongestant", unitPrice: 850, retailPrice: 1100, reorderLevel: 10, batchNumber: "ARI-F821", expiryDate: "2026-07-25", stockQty: 14, drapControlled: false, description: "Ibuprofen and Pseudoephedrine cold and flu relief. Expiring soon!" },
    { id: "P6", name: "Rizek 40mg Capsules (14s)", category: "Gastrointestinal", unitPrice: 310, retailPrice: 425, reorderLevel: 25, batchNumber: "RIZ-R901", expiryDate: "2027-08-01", stockQty: 55, drapControlled: false, description: "Omeprazole acid controller for acidity and ulcers" },
    { id: "P7", name: "Amoxil 250mg Suspension (Pediatric)", category: "Antibiotic", unitPrice: 140, retailPrice: 195, reorderLevel: 15, batchNumber: "AMX-S011", expiryDate: "2026-06-30", stockQty: 6, drapControlled: false, description: "Paediatric amoxicillin oral liquid. Expiring and low stock!" },
    { id: "P8", name: "Lexotanil 3mg Tablets (Bromazepam)", category: "Sedative / Psychotropic", unitPrice: 190, retailPrice: 275, reorderLevel: 20, batchNumber: "LEX-P881", expiryDate: "2027-03-15", stockQty: 75, drapControlled: true, description: "DRAP controlled narcotic substance. Verification of original doctor prescription, patient name & Rx mandatory." },
    { id: "P9", name: "Calpol Pediatric Suspension", category: "Analgesic Pediatric", unitPrice: 90, retailPrice: 120, reorderLevel: 40, batchNumber: "CAL-P301", expiryDate: "2027-10-18", stockQty: 92, drapControlled: false, description: "Paracetamol infant oral drops" }
  ];

  initialProducts.forEach((p) => productStore.put(p));

  // Ledger Seeding
  const initialLedger: LedgerEntry[] = [
    { id: "L1", accountType: "Cash Book", entityId: "SYSTEM", entityName: "Initial Capital", description: "Opening Cash in Hand", debit: 150000, credit: 0, balance: 150000, createdAt: "2026-06-01T09:00:00Z" },
    { id: "L2", accountType: "Supplier Ledger", entityId: "SUP1", entityName: "Kakar Pharma Distributors", description: "Purchased initial stock of Panadol + Brufen", debit: 0, credit: 30000, balance: 30000, createdAt: "2026-06-02T11:00:00Z" },
    { id: "L3", accountType: "Supplier Ledger", entityId: "SUP2", entityName: "Balochistan Medicine Market Wholesalers", description: "Payment against medicine stock", debit: 5000, credit: 0, balance: -5000, createdAt: "2026-06-03T15:00:00Z" }
  ];

  initialLedger.forEach((l) => ledgerStore.put(l));

  // Seed Payment Cards
  const cardStore = transaction.objectStore("payment_cards");
  const initialCards: PaymentCard[] = [
    { id: "CARD1", cardholderName: "Barakat Pharmacy Main", bankName: "Meezan Bank Ltd", cardNumber: "**** **** **** 4321", cardType: "Debit", expiryDate: "12/28", isActive: true, createdAt: new Date().toISOString() },
    { id: "CARD2", cardholderName: "Transit Account Card", bankName: "Habib Bank Limited (HBL)", cardNumber: "**** **** **** 8821", cardType: "Credit", expiryDate: "09/27", isActive: true, createdAt: new Date().toISOString() },
    { id: "CARD3", cardholderName: "Alternative Payment", bankName: "EasyPaisa Mobile Wallet", cardNumber: "**** **** **** 7021", cardType: "Mobile Wallet", expiryDate: "11/29", isActive: true, createdAt: new Date().toISOString() }
  ];
  initialCards.forEach((c) => cardStore.put(c));
}

// Database helper operations
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function putInStore<T>(storeName: string, item: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Higher-level POS Sale with Transactional updates
export async function saveSaleOffline(sale: Sale, items: SaleItem[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // We update 'sales', 'sale_items', and adjust stock in 'products' and create 'ledger_entries'
    const tx = db.transaction(["sales", "sale_items", "products", "ledger_entries"], "readwrite");

    tx.oncomplete = () => {
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error);
    };

    // 1. Add Sale
    const salesStore = tx.objectStore("sales");
    salesStore.put(sale);

    // 2. Add Sale Items
    const itemsStore = tx.objectStore("sale_items");
    itemsStore.put(sale); // In our design, sale item has its own model
    items.forEach(itm => itemsStore.put(itm));

    // 3. Decrement Product Stock Qty
    const productStore = tx.objectStore("products");
    items.forEach(itm => {
      const getReq = productStore.get(itm.productId);
      getReq.onsuccess = () => {
        const prod = getReq.result as Product;
        if (prod) {
          prod.stockQty = Math.max(0, prod.stockQty - itm.qty);
          productStore.put(prod);
        }
      };
    });

    // 4. Create Revenue ledger entry
    const ledgerStore = tx.objectStore("ledger_entries");
    const ledgerId = `LEDG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cashEntry: LedgerEntry = {
      id: ledgerId,
      accountType: sale.paymentMethod === "Credit Ledger" ? "Customer Ledger" : "Cash Book",
      entityId: sale.id,
      entityName: sale.customerName || "Walk-in Patient",
      description: `POS Sale Ref ${sale.id.slice(-8).toUpperCase()}`,
      debit: sale.total,
      credit: 0,
      balance: 0, // calculated recursively in display component
      createdAt: sale.createdAt
    };
    ledgerStore.put(cashEntry);
  });
}

// Synchronize all offline sales
export async function syncOfflineSalesToServer(): Promise<number> {
  const db = await initDB();
  const sales = await getAllFromStore<Sale>("sales");
  const unsyncedsales = sales.filter(s => !s.synced);

  if (unsyncedsales.length === 0) return 0;

  // Let's mark all as synced in IndexedDB to simulate successful background push to master Supabase
  const tx = db.transaction("sales", "readwrite");
  const salesStore = tx.objectStore("sales");

  unsyncedsales.forEach(sale => {
    sale.synced = true;
    salesStore.put(sale);
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(unsyncedsales.length);
    tx.onerror = () => reject(tx.error);
  });
}

// Purchase stock increase transactional handler
export async function savePurchaseOffline(purchase: Purchase): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["purchases", "products", "suppliers", "ledger_entries"], "readwrite");

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    // 1. Add purchase
    const purchaseStore = tx.objectStore("purchases");
    purchaseStore.put(purchase);

    // 2. Adjust inventory product stock & and prices
    const productStore = tx.objectStore("products");
    purchase.items.forEach(itm => {
      const getReq = productStore.get(itm.productId);
      getReq.onsuccess = () => {
        const prod = getReq.result as Product;
        if (prod) {
          prod.stockQty += itm.qty;
          prod.unitPrice = itm.costPrice;
          prod.retailPrice = itm.retailPrice;
          prod.batchNumber = itm.batchNumber;
          prod.expiryDate = itm.expiryDate;
          productStore.put(prod);
        }
      };
    });

    // 3. Update supplier balance
    const supplierStore = tx.objectStore("suppliers");
    const getSup = supplierStore.get(purchase.supplierId);
    getSup.onsuccess = () => {
      const sup = getSup.result as Supplier;
      if (sup) {
        sup.ledgerBalance += purchase.total;
        supplierStore.put(sup);
      }
    };

    // 4. Ledger entries for Supplier purchase
    const ledgerStore = tx.objectStore("ledger_entries");
    const ledgerId = `LEDG-PUR-${Date.now()}`;
    const entry: LedgerEntry = {
      id: ledgerId,
      accountType: "Supplier Ledger",
      entityId: purchase.supplierId,
      entityName: purchase.supplierName,
      description: `Purchase Stock Invoice Ref ${purchase.id.slice(-8).toUpperCase()}`,
      debit: 0,
      credit: purchase.total,
      balance: 0,
      createdAt: purchase.createdAt
    };
    ledgerStore.put(entry);
  });
}
