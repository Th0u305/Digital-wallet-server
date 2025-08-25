import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IUser, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import { Agent } from "../modules/agent/agent.model";
import { Encrypt } from "../utils/encrypt";


const validateCredentials =  (userOrAgent: Partial<IUser>, password: string) => {

    const isGoogleAuthenticated = userOrAgent?.auths?.provider === "google"

    if (isGoogleAuthenticated && !userOrAgent.password) {
        return { error: "You have authenticated through google. If you want to login with credentials, then at first login with google and set a password for your gmail and then you can login with email and password" };
    }

    const isPasswordMatched = Encrypt.compare(password, userOrAgent.password as string)

    if (!isPasswordMatched) {
        return { error: "Incorrect password." };
    }

    return { user: userOrAgent };
};


passport.use(
    new LocalStrategy({

        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,

    }, async (req, email: string, password: string, done) => {

        try {

            const { role } = req.body;

            if (!role) {
                return done(null, false, { message: "Please select your role." });
            }

            let entity; // This will hold either the user or the agent

            if (role.toUpperCase() !== Role.AGENT) {

                entity = await User.findOne({ email })

            } else if (role.toUpperCase() === Role.AGENT) {

                entity = await Agent.findOne({ email })

            } else {
                return done(null, false, { message: "Invalid role specified." });
            }
            
            if (!entity) {
                return done(null, false, { message: "No account found with this email" });
            }

            const validationResult =  validateCredentials(entity, password);

            if (validationResult.error) {
                return done(null, false, { message: validationResult.error });
            }

            return done(null, validationResult.user);

        } catch (error) {
            return done(error);
        }
    })
);

// Google strategy

passport.use(
    new GoogleStrategy(
        {
            clientID : envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL : envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) =>{

            try {
                const email = profile?.emails?.[0].value

                if (!email) {
                    return done(null,false, {message : "No email found"} )
                }

                let user = await User.findOne({email})

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture : profile?.photos?.[0]?.value,
                        role: Role.USER,
                        isVerified : false,
                        auths : {
                                provider : "google",
                                providerId : profile.id
                        }
                    })    
                }
                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    )
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void)=>{
    done(null, user._id)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser( async(id : string, done: any)=>{
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        done(error)
    }
})