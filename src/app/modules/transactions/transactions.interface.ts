import { Types } from "mongoose";

export enum TransactionType {
  ADD_MONEY = "ADD_MONEY",
  WITHDRAW = "WITHDRAW",
  SEND_MONEY = "SEND_MONEY",
  CASH_OUT = "CASH_OUT",
  COMMISSION = "COMMISSION",
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
}

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  SEND = "SEND",
}

export interface SendMoney {
  senderId : Types.ObjectId,
  receiverId : Types.ObjectId,
  amount : number,
  message?: string
}

export interface ITransaction {
  userId: string;
  walletId: string;
  userModel: string;
  // sendMoney? : SendMoney
  amount: number;
  transactionType: TransactionType;
  status?: PAYMENT_STATUS;
  description?: string;
  reference?: string;
}
