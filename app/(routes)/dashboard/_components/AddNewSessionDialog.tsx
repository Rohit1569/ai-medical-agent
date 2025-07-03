'use client'
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import DoctorAgentCard, { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorsCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
function AddNewSessionDialog(){
    const [note,setNote]=useState<string>('')
    const [loading,setLoading]=useState(false) ;
    const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
     const router = useRouter();
    const [seletedDoctor,setSelectedDoctor]=useState<doctorAgent>();
     
    const OnClickNext =async()=>{
      setLoading(true)
       const result=await axios.post('/api/suggest-doctors', {
            notes: note
        });
        console.log(result.data);
        setSuggestedDoctors(result.data);
        setLoading(false)        
    }

    const OnStartConsultation=async()=>{
       setLoading(true);
      const result=await axios.post('/api/session-chat', {
        notes: note,
        seletedDoctor: seletedDoctor
      });
      if(result.data?.sessionId){
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      }
      setLoading(false);
    }
    return (
      <Dialog>
        <DialogTrigger>
          <button className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
            + Start a Consultation
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Basic Details</DialogTitle>
            <DialogDescription>
              {!suggestedDoctors.length ? (
                <div>
                  <h2>Add Symptoms or Any Other Details</h2>
                  <Textarea
                    placeholder="Add Details Here"
                    className="h-[200px] mt-1"
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                <h2>Select the doctor</h2>
                <div className="grid grid-cols-3 gap-5">
                  {/* Suggested Doctors */}
                  {suggestedDoctors.map((doctor,index)=>(
                    <SuggestedDoctorsCard doctorAgent={doctor} key={index } setSelectedDoctor={()=>setSelectedDoctor(doctor)}
                    //@ts-ignore
                    seletedDoctor={seletedDoctor}/>
                  ))}
                </div>
              </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <button className="mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                Cancel
              </button>
            </DialogClose>
            {!suggestedDoctors.length ? (
              <button
                onClick={OnClickNext}
                disabled={!note || loading}
                className={`flex items-center gap-2 mt-4 px-6 py-2 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  note ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button onClick={OnStartConsultation} className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                Start Consultation
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog> 
    );
    

}

export default AddNewSessionDialog