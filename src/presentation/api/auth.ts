import jwt from "jsonwebtoken";
import { config } from "../../config/env.config";

const jwtSecret: string = config.jwtSecret || '';

export const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers['x-access-token'] || req.query.token || req.body.token

    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }
    const p = new Promise(
        (resolve, reject): void => {
            jwt.verify(token, jwtSecret, (err: any, decoded: any): void => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    const onError = (error: any): void => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    p.then((decoded)=>{
        req.decoded = decoded
        next()
    }).catch(onError)
    
}
