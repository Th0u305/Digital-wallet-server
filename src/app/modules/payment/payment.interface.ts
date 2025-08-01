// import { Types } from "mongoose"

// export enum TransactionType {
//   ADD_MONEY = 'add_money',
//   WITHDRAW = 'withdraw',
//   SEND_MONEY = 'send_money',
//   CASH_IN = 'cash_in', // Agent adds money to user wallet
//   CASH_OUT = 'cash_out', // Agent withdraws money from user wallet
//   COMMISSION = 'commission',
// }

// export enum TransactionStatus {
//   PENDING = 'pending',
//   COMPLETED = 'completed',
//   FAILED = 'failed',
//   REVERSED = 'reversed',
// }

// export enum PAYMENT_STATUS{
//     PAID = "PAID",
//     UNPAID = "UNPAID",
//     FAILED = "FAILED",
//     REFUNDED = "REFUNDED",
//     CANCELLED = "CANCELLED"
// }

// export interface IPayment{
//     booking: Types.ObjectId
//     transactionId : string
//     status : PAYMENT_STATUS
//     amount : number,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     paymentGateWayData?: any
//     invoiceUrl? : string
// }