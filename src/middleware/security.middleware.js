import aj from "#config/arcjet.js";
import logger from "#config/logger.js";
import { slidingWindow } from "@arcjet/node";

const securityMiddleware = async(req,res,next)=>{
    try{
        const role = req.user?.role ||'guest';
        let limit;
        let message;

        switch(role){
            case 'admin':
                limit=20
                message = 'admin request limit exceeded(20 per min)'
            break;
            case 'user':
                limit=10
                message = 'admin request limit exceeded(10 per min)'
            break
            case 'guest':
                limit=5
                message = 'admin request limit exceeded(4 per min)'
            break
        }

        const client = aj.withRule(slidingWindow({mode:'LIVE',interval:'1m',max:limit,name:`${role}-rate-limit`}))
        const decision = client.protect(req);
        if((await decision).isDenied && (await decision).reason.isBot()){
            logger.warn('Bot request blocked',{ip:req.ip, userAgent:req.get('User-Agent'),path:req.path})
            return res.status(403).json({error:'Forbiddin',message:'automated reqs not allowed'})
        }
        if((await decision).isDenied && (await decision).reason.isShield()){
            logger.warn('Shield blocked request',{ip:req.ip, userAgent:req.get('User-Agent'),path:req.path,method:req.method})
            return res.status(403).json({error:'Forbiddin',message:'Request blocked by policy '})
        }
        if((await decision).isDenied && (await decision).reason.isRateLimit()){
            logger.warn('Rate limit exceeded',{ip:req.ip, userAgent:req.get('User-Agent'),path:req.path,method:req.method})
            return res.status(403).json({error:'Forbiddin',message:'Too many requests'})
        }

        next();
    }catch(e){
        console.error('Arcjet middleware error',e)
        res.status(500).json({error:'internal server error',message:'something went wrong with security middleware'})
    }
}

export default securityMiddleware