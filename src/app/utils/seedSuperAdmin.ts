import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import { UserServices } from "../modules/user/user.service";
import { Encrypt } from "./encrypt";

export const seedSuperAdmin = async () =>{
    try {
        const isSuperAdminExists = await User.findOne({email : envVars.SUPER_ADMIN_EMAIL})
        if (isSuperAdminExists) {
            return
        }

        const hashedPassword = await Encrypt.CreateSuperAdmin()
        const authProvider: IAuthProvider = {
            provider : "credentials",
            providerId : envVars.SUPER_ADMIN_EMAIL
        }
        const payload: IUser = {
            name : "Admin",
            role : Role.ADMIN,
            email : envVars.SUPER_ADMIN_EMAIL,
            password : hashedPassword,
            phone : "",
            isVerified : true,
            auths : authProvider
        }

        await UserServices.createUserWithWallet(payload)

        // await User.create(payload)

    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
    }
}