import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
}

export interface IWallet extends Document {
  userId: Types.ObjectId; // Reference to the User
  balance: number;
  userModel : string
  walletStatus: WalletStatus;
}
