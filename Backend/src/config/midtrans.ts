import dotenv from "dotenv";
import logger from "../utils/logger";
import midtransClient from "midtrans-client";
dotenv.config();

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY!;

if (!serverKey || !clientKey) {
  logger.warn("⚠️ Midtrans credentials not configured");
} else {
  logger.info("📦 Midtrans configuration successfully");
}

export const snap = serverKey
  ? new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    })
  : null;

export const coreApi = serverKey
  ? new midtransClient.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    })
  : null;

export interface MidtransTransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  customer_details?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    billing_address?: {
      first_name: string;
      last_name?: string;
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
}

export const createSnapTransaction = async (
  params: MidtransTransactionParams
): Promise<string> => {
  if (!snap) {
    throw new Error("Midtrans is not configured");
  }

  try {
    const transaction = await snap.createTransaction(params);
    return transaction.token;
  } catch (error) {
    logger.error("Midtrans Snap transaction creation error:");
    throw new Error("Failed to create Midtrans transaction");
  }
};

export const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean => {
  if (!serverKey) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  return hash === signatureKey;
};
