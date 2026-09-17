import { getOpenAI } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
     try{
        const {notes}=await req.json();
        const completion = await getOpenAI().chat.completions.create({
            model: 'mistralai/mistral-small-3.2-24b-instruct-2506:free',
            messages: [

                {role: 'system', content:JSON.stringify(AIDoctorAgents)},
              {
                role: 'user',
                content: 'User Notes/Symptoms:'+notes+', Depends on user notes and symptoms, Please suggest list of doctors , Return Object in the JSON only'            }, 
            ],
          });
           
          const rawResp=completion.choices[0].message
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
          const Resp=rawResp.content.trim().replace('```json', '').replace('```', ''); 
          const JSONResp=JSON.parse(Resp);
          return NextResponse.json(JSONResp)
 
     }catch(e){
       return NextResponse.json(e);
     }
}