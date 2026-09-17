import { getOpenAI } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/list";
import { NextRequest, NextResponse } from "next/server";

const doctorKeywords: Record<number, string[]> = {
  1: ["fever", "cold", "flu", "cough", "pain", "headache", "tired", "symptom"],
  2: ["child", "baby", "kid", "infant", "teen"],
  3: ["skin", "rash", "acne", "itch", "eczema", "pimple"],
  4: ["anxiety", "depression", "stress", "mental", "sleep", "panic"],
  5: ["diet", "food", "nutrition", "weight", "meal", "eating"],
  6: ["heart", "chest", "blood pressure", "palpitation"],
  7: ["ear", "nose", "throat", "sinus", "hearing"],
  8: ["bone", "joint", "muscle", "back", "knee", "shoulder", "fracture"],
  9: ["period", "pregnancy", "hormone", "menstrual", "ovary"],
  10: ["tooth", "teeth", "dental", "gum", "mouth"],
};

function getFallbackDoctors(notes: string) {
  const normalizedNotes = notes.toLowerCase();
  const rankedDoctors = AIDoctorAgents.map((doctor) => ({
    doctor,
    score: (doctorKeywords[doctor.id] ?? []).reduce(
      (score, keyword) => score + (normalizedNotes.includes(keyword) ? 1 : 0),
      doctor.id === 1 ? 1 : 0,
    ),
  })).sort((first, second) => second.score - first.score);

  return rankedDoctors.slice(0, 3).map(({ doctor }) => doctor);
}

export async function POST(req: NextRequest) {
  const { notes = "" } = await req.json();
    try {
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

          if (!Array.isArray(suggestedDoctors) || suggestedDoctors.length === 0) {
            throw new Error("The doctor suggestion response was not an array");
          }

          return NextResponse.json(suggestedDoctors.slice(0, 3));
     } catch (error) {
       console.error("Failed to suggest doctors", error);
       return NextResponse.json(getFallbackDoctors(notes));
     }
}