import { getOpenAI } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
      const { notes } = await req.json();
      const completion = await getOpenAI().chat.completions.create({
            model: 'mistralai/mistral-small-3.2-24b-instruct-2506:free',
            messages: [

                {role: 'system', content:JSON.stringify(AIDoctorAgents)},
              {
                role: 'user',
                content: 'User Notes/Symptoms:'+notes+', Depends on user notes and symptoms, Please suggest list of doctors , Return Object in the JSON only'            }, 
            ],
          });
           
          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error("The doctor suggestion response was empty");
          }

          const responseText = content
            .replace(/^```json\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const suggestedDoctors = JSON.parse(responseText);

          if (!Array.isArray(suggestedDoctors)) {
            throw new Error("The doctor suggestion response was not an array");
          }

          return NextResponse.json(suggestedDoctors);
     } catch (error) {
       console.error("Failed to suggest doctors", error);
       return NextResponse.json(AIDoctorAgents);
     }
}