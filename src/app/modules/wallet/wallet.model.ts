import { model, Schema } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      // This now refers to the 'userModel' field and dynamically chose collection
      ref: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      //  two model names
      enum: ["user", "agent"],
    },
    balance: { type: Number,required: true, min: 0, default: 50 },
    walletStatus: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
    transactionId : [{
      type : Schema.Types.ObjectId,
      ref : "transaction"
    }]
  },
  { timestamps: true, versionKey: false }
);

export const Wallet = model<IWallet>("wallet", walletSchema)
