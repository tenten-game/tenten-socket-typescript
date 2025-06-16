import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { config } from "../../config/env.config";

const jwtSecret: string = config.jwtSecret || '';

interface AuthenticatedRequest extends Request {
    decoded?: string | JwtPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers['x-access-token'] || req.query.token || req.body.token

    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }
    const p = new Promise<string | JwtPayload>(
        (resolve, reject): void => {
            jwt.verify(token, jwtSecret, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined): void => {
                if(err) reject(err)
                else if(decoded) resolve(decoded)
                else reject(new Error('Invalid token'))
            })
        }
    )

    const onError = (error: Error): void => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    p.then((decoded: string | JwtPayload): void => {
        req.decoded = decoded
        next()
    }).catch(onError)
    
}
