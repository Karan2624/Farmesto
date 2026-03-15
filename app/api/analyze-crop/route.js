import { inngest } from "@/inngest/client";
import { getAuth } from "@clerk/nextjs/server";

import { data } from "autoprefixer";
import { errorToJSON } from "next/dist/server/render";
import { NextResponse } from "next/server";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try{
        const {userId} = getAuth(req)
        if(!userId) return NextResponse.json({error:"Unauthenticated"},{status:401});
        const formData = await req.formData();
        const imageFile = formData.get("image");
        const lat = formData.get("lat");
        const lng = formData.get("lng");

        if(!imageFile) {
            return NextResponse.json({error: "No image provided"},{status:400});
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type;
        const model = genAI.getGenerativeModel({model : "gemini-3.0-flash"});

        const prompt = `Analyze this crop leaf image. Identify the disease if present. 
    Respond STRICTLY with valid JSON in this exact format, nothing else:
    {
      "disease": "Name of Disease (or 'Healthy')",
      "severity": "High", "Medium", or "Low",
      "isContagious": boolean (true if it can spread to nearby farms easily),
      "confidence": "percentage string",
      "symptoms": ["symptom 1", "symptom 2"],
      "treatment": {
        "organic": "organic treatment plan",
        "chemical": "chemical treatment plan"
      },
      "prevention": ["prevention tip 1", "prevention tip 2"]
    }`;

    const imageParts = [{
        inlineData: {data: buffer.toString("base64"),mimeType}
    }];

    const result = await model.generateContent([prompt,...imageParts]);
    const responseText = result.response.text();
    let diagnosis;
    try{
        const cleanJSONString = responseText.replace(/```json/g,'').replace(/```/g,'').trim();
        diagnosis = JSON.parse(cleanJSONString);
    } catch(err){
        console.log("Faled to parse gemini output",responseText);
        return NextResponse.json({error:"AI returned invalid format. Please try again."},{Status : 500});
    }

    if(diagnosis.isContagious && diagnosis.severity === "High" && lat && lng){
        await inngest.send({
            name : "farmesto/outbreak.detected",
            data: {
                reporterClerkId : userId,
                prevention: diagnosis.prevention,
                severity : diagnosis.severity,
                symptoms : diagnosis.symptoms,
                originatorLat : parseFloat(lat),
                originatorLng : parseFloat(lng),
                radiusKm : 30,
            }
        })
        console.log(`[SYSTEM] High severity ${diagnosis.disease} detected. Triggering community alerts.`);
    }
    return NextResponse.json({success:true,diagnosis});

    } catch(err){
        console.log("AI analysis error : ",err);
        return NextResponse.json({error:"Failed to analyze image"},{status:500});
    }
}