import { model, Schema } from "mongoose";
import { ITransaction, PAYMENT_STATUS, SendMoney, TransactionType } from "./transactions.interface";

const sendMoneySchema = new Schema<SendMoney>(
  {
    senderId : {
      type : Schema.Types.ObjectId,
      ref : "user",
      required: [true , "Sender id is required"],
    },
    receiverId : {
      type : Schema.Types.ObjectId,
      ref : "user",
      required: [true , "Receiver id is required"],
    },
    amount : {
      type : Number,
      required : [true, "Amount is missing"]
    },
    message : {
      type : String,
      trim : true,
      required : [true, "message is required"]
    },
  }, {
    versionKey : false,
    _id : false,
    timestamps : false
  }
)

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String, 
      required: [true, 'User ID is required for a transaction.'],
    //   index: true, 
    },
    walletId: {
      type: String, 
      required: [true, 'Wallet ID is required for a transaction.'],
    //   index: true,
    },
    userModel : {
      type : String,
      required : [true, "userModel is required"]
    },
    sendMoney : sendMoneySchema,
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required.'],
      min: [10, 'Minimum transactions amount is 10'],
    },
    transactionType: {
      type: String,
      enum: {
        values: Object.values(TransactionType),
        message: `This is not a supported transaction type.`,
      },
      required: [true, 'Transaction type is required.'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: '{VALUE} is not a supported transaction status.',
      },
      default: PAYMENT_STATUS.PENDING,
    },
    description: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey : false
  }
);

export const Transaction = model<ITransaction>("transaction", transactionSchema)
