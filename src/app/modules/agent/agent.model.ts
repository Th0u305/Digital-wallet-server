import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, Role, WalletStatus } from "../user/user.interface";
import { AgentProfile, IAgent } from "./agent.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider : { type : String, required: true },
    providerId : { type : String, required: true}
},{
    versionKey : false,
    timestamps : false,
    _id : false
})

const agentInfo = new Schema<AgentProfile>({
    nidNumber : { type : String , required : true , unique : true},
    commissionRate : { type : Number, default : 0.5},
    tradeLicenseNumber : { type : String, unique: true}
},{
    _id : false,
    timestamps : false,
    versionKey : false
})

const agentSchema = new Schema<IAgent>({
    name : { 
        type : String ,
        required : true,
    },
    email : {
        type : String ,
        required : true,
        unique : true
    },
    password : { type : String },
    role : {
        type : String,
        enum : Object.values(Role),
        default : Role.AGENT
    },
    phone : { type : String , required : true , unique : true},
    picture : { type : String },
    address : { type : String , required : true},
    auths : authProviderSchema,
    isDeleted : { type : Boolean, default : false },
    isActive : {
        type : String,
        enum : Object.values(IsActive),
        default : IsActive.ACTIVE
    },
    isVerified : { type : Boolean, default : true},
    walletStatus : {
        type : String,
        enum : Object.values(WalletStatus),
        default : WalletStatus.ACTIVE
    },
    agentInfo : agentInfo    
},{
    versionKey : false,
    timestamps : true
})

export const Agent = model<IAgent>("agent", agentSchema)