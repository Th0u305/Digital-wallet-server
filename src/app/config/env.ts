import dotenv from "dotenv"

dotenv.config()

interface EnvConfig {
    SESSION_SECRET : string,
    PORT : string,
    DB_URL : string,
    NODE_ENV : "development" | "production"
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES : string,
    BCRYPT_SALT_ROUND: string,
    SUPER_ADMIN_PASSWORD : string,
    SUPER_ADMIN_EMAIL : string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRES: string,
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CALLBACK_URL: string
    EXPRESS_SESSION_SECRET: string
    FRONTEND_URL: string

    
    SMTP_FROM: string
    SMTP_USER: string
    SMTP_PORT: string
    SMTP_HOST: string
    SMTP_PASS: string


    REDIS_PORT : string
    REDIS_HOST : string
    REDIS_PASSWORD : string
    REDIS_USERNAME : string
}


const loadEnvVariables = (): EnvConfig =>{
    const requiredEnvVariables : string[] = ["SESSION_SECRET", "PORT", "DB_URL", "NODE_ENV", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "BCRYPT_SALT_ROUND", 
                                            "SUPER_ADMIN_PASSWORD" , "SUPER_ADMIN_EMAIL","JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES", 
                                            "GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CALLBACK_URL", "EXPRESS_SESSION_SECRET", 
                                            "FRONTEND_URL",
                                            "SMTP_PASS", "SMTP_FROM", "SMTP_USER", "SMTP_PORT", "SMTP_HOST",
                                            "REDIS_PORT", "REDIS_HOST", "REDIS_PASSWORD", "REDIS_USERNAME"]

    requiredEnvVariables.forEach((key)=>{
        if (!process.env[key]) {
            throw new Error(`Missing required env variable ${key}`)
        }
    })

    return {
        SESSION_SECRET : process.env.SESSION_SECRET as string,
        PORT : process.env.PORT as string,
        DB_URL : process.env.DB_URL as string,
        NODE_ENV : process.env.NODE_ENV as "development" | "production",
        JWT_ACCESS_SECRET : process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES : process.env.JWT_ACCESS_EXPIRES as string,
        BCRYPT_SALT_ROUND : process.env.BCRYPT_SALT_ROUND as string,
        SUPER_ADMIN_PASSWORD : process.env.SUPER_ADMIN_PASSWORD as string,
        SUPER_ADMIN_EMAIL : process.env.SUPER_ADMIN_EMAIL as string,
        JWT_REFRESH_SECRET : process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES : process.env.JWT_REFRESH_EXPIRES as string,
        GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL as string,
        EXPRESS_SESSION_SECRET : process.env.EXPRESS_SESSION_SECRET as string,
        FRONTEND_URL : process.env.FRONTEND_URL as string,

        SMTP_PASS : process.env.SMTP_PASS as string,
        SMTP_FROM : process.env.SMTP_FROM as string,
        SMTP_USER : process.env.SMTP_USER as string,
        SMTP_PORT : process.env.SMTP_PORT as string,
        SMTP_HOST : process.env.SMTP_HOST as string,


        REDIS_PORT : process.env.REDIS_PORT as string,
        REDIS_HOST : process.env.REDIS_HOST as string,
        REDIS_PASSWORD : process.env.REDIS_PASSWORD as string,
        REDIS_USERNAME : process.env.REDIS_USERNAME as string,
    }
}

export const envVars: EnvConfig = loadEnvVariables()