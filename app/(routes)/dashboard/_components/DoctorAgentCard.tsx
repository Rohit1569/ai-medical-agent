import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

export type doctorAgent={
    id: number;
    specialist: string;
    description: string;
    image: string;
    agentPrompt: string;
    voiceId?: string; 
}

type Props = {
    doctorAgent: doctorAgent;
};
function DoctorAgentCard( {doctorAgent} :Props) {
  return (
    <div  >
     <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} className="w-full h-[250px] object-cover rounded-xl" />
    <h2 className="font-bold ">{doctorAgent.specialist}</h2>
    <h2 className="line-clamp-2 text-sm text-gray-500">{doctorAgent.description}</h2>
    <button className="mt-2 px-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-between">
      <span>Start Consultation</span> 
      <IconArrowRight />
    </button>
    </div>
    
  );
}
export default DoctorAgentCard;