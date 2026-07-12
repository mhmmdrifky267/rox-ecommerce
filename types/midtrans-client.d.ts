// types/midtrans-client.d.ts
//
// midtrans-client tidak menyediakan definisi TypeScript resmi, dan tidak
// ada juga paket @types/midtrans-client di npm. File ini "mengajari"
// TypeScript bentuk kasar dari package tersebut, supaya tidak error merah.
// Ini praktik umum untuk package lama yang belum migrasi ke TypeScript.

declare module "midtrans-client" {
  type SnapConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  };

  type TransactionDetails = {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: Array<{
      id?: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    enabled_payments?: string[];
  };

  type TransactionResult = {
    token: string;
    redirect_url: string;
  };

  type NotificationResult = {
    order_id: string;
    transaction_status: string;
    fraud_status?: string;
    transaction_id: string;
    gross_amount: string;
    payment_type: string;
  };

  interface SnapInstance {
    createTransaction(params: TransactionDetails): Promise<TransactionResult>;
    transaction: {
      notification(body: unknown): Promise<NotificationResult>;
      status(orderId: string): Promise<NotificationResult>;
    };
  }

  interface SnapConstructor {
    new (config: SnapConfig): SnapInstance;
  }

  interface MidtransClientModule {
    Snap: SnapConstructor;
  }

  const midtransClient: MidtransClientModule;
  export default midtransClient;
}