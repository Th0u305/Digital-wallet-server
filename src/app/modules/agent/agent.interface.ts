import { Types } from "mongoose";
import { IAuthProvider, IsActive, Role, WalletStatus } from "../user/user.interface";

export interface AgentProfile{
    nidNumber : string
    commissionRate? : number
    tradeLicenseNumber? : string
}

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
    walletStatus? : WalletStatus
    auths : IAuthProvider
    role : Role
    agentInfo : AgentProfile
}