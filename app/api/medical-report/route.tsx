import { db } from "@/config/db";
import openai from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the transcript, generate a structured report with the following fields:

sessionId: a unique session identifier

agent: the medical specialist name (e.g., "General Physician AI")

user: name of the patient or "Anonymous" if not provided

timestamp: current date and time in ISO format

chiefComplaint: one-sentence summary of the main health concern

summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations

symptoms: list of symptoms mentioned by the user

duration: how long the user has experienced the symptoms

severity: mild, moderate, or severe

medicationsMentioned: list of any medicines mentioned

recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the result in this JSON format:
{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}
`
export async function POST(req: NextRequest) {
    const {sessionId, sessionDetails, message} = await req.json();
    try{
     
        const userInput="AI Doctor Agent: "+JSON.stringify(sessionDetails)+'Conversation: '+JSON.stringify(message);
        const completion = await openai.chat.completions.create({
            model: 'mistralai/mistral-small-3.2-24b-instruct-2506:free',
            messages: [

                {role: 'system', content: REPORT_GEN_PROMPT},
              {
                role: 'user',
                content: userInput    }, 
            ],
          });
           
          const rawResp=completion.choices[0].message
            //@ts-ignore
          const Resp=rawResp.content.trim().replace('```json', '').replace('```', ''); 
          const JSONResp=JSON.parse(Resp);
          const res=await db.update (SessionChatTable).set({
                report: JSONResp,
          }).where(eq(SessionChatTable.sessionId, sessionId))
         return NextResponse.json(JSONResp);
       
    }catch(e) {
        console.error(e);
        return new Response('Error generating medical report', { status: 500 });
    }
}