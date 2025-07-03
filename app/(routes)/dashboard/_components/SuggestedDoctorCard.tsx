import React from "react";
import { doctorAgent } from "./DoctorAgentCard";
import Image from "next/image";

type Props = {
  doctorAgent: doctorAgent;
  setSelectedDoctor:any;
  seletedDoctor:doctorAgent
};

function SuggestedDoctorsCard({ doctorAgent, setSelectedDoctor,seletedDoctor }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-between gap-2 p-4 border rounded-2xl shadow-sm hover:shadow-md border-blue-500 cursor-pointer transition-shadow ${seletedDoctor?.id==doctorAgent?.id &&'border-blue-500'}`}
      onClick={() => setSelectedDoctor(doctorAgent)} // ✅ Fixed here
    >
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={70}
        height={70}
        className="h-[50px] w-[50px] rounded-full object-cover"
      />
      <h2 className="font-bold text-sm text-center">{doctorAgent.specialist}</h2>
      <p className="text-xs line-clamp-2 text-center">{doctorAgent.description}</p>
    </div>
  );
}

export default SuggestedDoctorsCard;
