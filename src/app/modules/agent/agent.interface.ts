import { Types } from "mongoose";
import { IAuthProvider, IsActive, Role } from "../user/user.interface";

export interface IAgent {
    _id?: Types.ObjectId
    name : string;
    email : string;
    password? : string;
    phone: string;
    picture?: string;
    address: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    auths : IAuthProvider
    walletId? : Types.ObjectId
    role : Role
    nidNumber : string
    commissionRate? : number
    tradeLicenseNumber? : string
    success? : string
    message?: string
}