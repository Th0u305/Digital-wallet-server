import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

const googlePassportAuthenticate = () => async (req: Request, res: Response, next: NextFunction)=>{

    const redirect = req.query.redirect || "/"
    passport.authenticate("google", { scope : ["profile", "email"] , state : redirect as string})(req, res, next)
}
export default googlePassportAuthenticate;