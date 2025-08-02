import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
}

export interface IWallet {
  userId: Types.ObjectId; // Reference to the User
  balance: number;
  userModel : string
  walletStatus?: WalletStatus;
  transactionId? : Types.ObjectId[],
  message?: string
  success?: string
}
