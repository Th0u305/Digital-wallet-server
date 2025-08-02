import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, Role } from "../user/user.interface";
import { IAgent } from "./agent.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider : { type : String, required: true },
    providerId : { type : String, required: true}
},{
    versionKey : false,
    timestamps : false,
    _id : false
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
    walletId : { type : Schema.Types.ObjectId , ref : "wallet"},
    nidNumber : { type : String , unique : true, required: true},
    commissionRate : { type : Number, default : 0.5},
    tradeLicenseNumber : { type : String}  
},{
    versionKey : false,
    timestamps : true
})

export const Agent = model<IAgent>("agent", agentSchema)