import z from "zod";
import { PAYMENT_STATUS, TransactionType } from "./transactions.interface";

export const transactionZodValidation = z.object({
    amount : z
        .number()
        .min(10,{ message : 'Minimum transactions amount is 10'}),
    transactionType : z
        .enum(Object.values(TransactionType) as [string]),
    status : z
        .enum(Object.values(PAYMENT_STATUS) as [string])
        .default(PAYMENT_STATUS.PENDING)
        .optional(),
    description : z
        .string()
        .optional(),
    reference : z
        .string()
        .optional()
})

export const sendMoneyUserToUser = z.object({
    amount : z
        .number()
        .min(10,{ message : 'Minimum transactions amount is 10'}),
    transactionType : z
        .enum(Object.values(TransactionType) as [string]),
})