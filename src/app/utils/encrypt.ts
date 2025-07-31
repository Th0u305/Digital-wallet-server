import bcryptjs from "bcryptjs"
import { envVars } from "../config/env"


const CreateSuperAdmin = () =>{
    return bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))
}

const hashPassword = async (pass: string) =>{
    return await bcryptjs.hash(pass, Number(envVars.BCRYPT_SALT_ROUND))
}

const compare = async (pass: string, userPassword: string) =>{
    return await bcryptjs.compare(pass, userPassword)
}

export const Encrypt = {
    CreateSuperAdmin,
    hashPassword,
    compare
}
