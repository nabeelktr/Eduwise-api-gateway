
import 'dotenv/config'

interface ItokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
}

export const generateTokenOptions = () => {

    const accessExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
    const refreshExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)

    const accessTokenOptions: ItokenOptions = {
        expires: new Date(Date.now() + accessExpire * 60 * 1000),
        maxAge: accessExpire * 60 * 1000,
        httpOnly: true,
        sameSite: "lax"
    } 
    const refreshTokenOptions: ItokenOptions = {
        expires: new Date(Date.now() + refreshExpire * 24 * 60 * 60 * 1000),
        maxAge: refreshExpire * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax"
    } 

    // only set true in production
    if (process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;
    }

    return {accessTokenOptions, refreshTokenOptions}
    
}