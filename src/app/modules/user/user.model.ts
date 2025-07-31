import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role, WalletStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider : { type : String, required: true },
    providerId : { type : String, required: true}
},{
    versionKey : false,
    timestamps : false,
    _id : false
})

const userSchema = new Schema<IUser>({
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
        default : Role.USER
    },
    phone : { type : String },
    picture : { type : String },
    address : { type : String },
    auths : authProviderSchema,
    isDeleted : { type : Boolean, default : false },
    isActive : {
        type : String,
        enum : Object.values(IsActive),
        default : IsActive.ACTIVE
    },
    isVerified : { type : Boolean, default : false},
    walletStatus : {
        type : String,
        enum : Object.values(WalletStatus),
        default : WalletStatus.ACTIVE
    }
},{
    versionKey : false,
    timestamps : true
})

export const User = model<IUser>("user", userSchema)