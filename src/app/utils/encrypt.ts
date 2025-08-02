import bcryptjs from "bcryptjs"
import { envVars } from "../config/env"


const CreateSuperAdmin = async () =>{
    return bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))
}

const hashPassword = (pass: string) =>{
    return  bcryptjs.hash(pass, Number(envVars.BCRYPT_SALT_ROUND))
}

const compare = (pass: string, userPassword: string) =>{
    return  bcryptjs.compare(pass, userPassword)
}

export const Encrypt = {
    CreateSuperAdmin,
    hashPassword,
    compare
}
