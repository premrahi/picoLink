import { Request , Response } from "express";
import {nanoid}  from "nanoid";
import URL from "../models/url";


export async function handleGenerateShortURL(req:Request , res : Response){

    const body = req.body ; 
    if(!body.url) return res.status(400).json({error:'Url is required!'})

    const shortID = nanoid(8) ;
    await URL.create({
        shortId : shortID,
        redirectURL: body.url,
        visitHistory:[] ,
    })


    return res.json({id:shortID})
}