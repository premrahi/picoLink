import { Request } from "express" ;
import geoip from "geoip-lite" ;
import { IVisit } from "../models/url" ;
import { Timestamp } from "mongodb";
import { timeStamp } from "node:console";


function getClientIp(req:Request) : string {
    const forwarded = req.headers["x-forwarded-for"] ;
    if(typeof forwarded === "string" && forwarded.length>0){
        // x-forwarded-for can be comma separated list; the first entry is the client
        return forwarded.split(',')[0].trim() ;
    }
    return req.ip || req.socket.remoteAddress || "" ;
}

function detectDevice(userAgent:string):IVisit["device"] {
    const ua = userAgent.toLowerCase() ;
    if(/tablet|ipad/.test(ua)) return "tablet" ;
    if(/mobile|android|iphone/.test(ua)) return "mobile" ;
    if(ua.length === 0) return "unknown" ;

    return "desktop"; 
}

export function buildVisitRecord(req:Request) : IVisit {
    const ip = getClientIp(req) ;
    const geo = ip ? geoip.lookup(ip) : null ;

    const referrerHeader = req.headers.referer || req.headers.referrer ;
    const referrer = typeof referrerHeader === "string" && referrerHeader.length >0 ? referrerHeader:"direct" ;


    return {
        timeStamp:Date.now() ,
        country: geo?.country || undefined ,
        region :geo?.region || undefined ,
        city: geo?.city || undefined ,
        referrer,
        device : detectDevice(req.headers["user-agent"] || ""),
    };
}