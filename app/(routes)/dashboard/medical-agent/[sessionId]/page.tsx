'use client';

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import Vapi from '@vapi-ai/web';


type SessionDetails = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON | null;
  selectedDoctor: doctorAgent;
  createdOn: string;
  
};

type message = {
  role: string;
  text: string;
}

function MedicalVOiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [messages, setMessages] = useState<message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails();
    }
  }, [sessionId]);

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      const data = result.data;

      if (data.seletedDoctor && !data.selectedDoctor) {
        data.selectedDoctor = data.seletedDoctor;
      }

      setSessionDetails(data);
    } catch (error) {
      console.error("Failed to fetch session details", error);
    }
  };

  const startCall = () => {
    const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY ?? '';
    if (!vapiApiKey) {
      throw new Error("NEXT_PUBLIC_VAPI_API_KEY is not defined");
    }

    const vapi = new Vapi(vapiApiKey);
    setVapiInstance(vapi);

    const vapiAgentConfig = {
      name: 'AI Medical Doctor Voice Agent',
      firstMessage: 'Hello, I am your AI medical agent. How can I assist you today?',
      transcriber: {
        provider: 'assembly-ai',
        language: 'en',
      },
      voice: {
        provider: 'playht',
        voiceId: sessionDetails?.selectedDoctor.voiceId || 'will',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: sessionDetails?.selectedDoctor.agentPrompt ||
              'You are a helpful AI medical agent. Please assist the user with their medical queries in a friendly and professional manner.'
          }
        ]
      }
    };

    //@ts-ignore
    vapi.start(vapiAgentConfig);

    vapi.on('call-start', () => {
      console.log('Call started');
      setCallStarted(true);
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setCallStarted(false);
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcript, transcriptType } = message;
        console.log(`${role}: ${transcript}`);
        if (transcriptType === 'partial') {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === 'final') {
          setMessages((prevMessages) => [
            ...(prevMessages || []),
            { role, text: transcript }
          ]);
          setLiveTranscript('');
          setCurrentRole(null);
        }
      }
    });

    vapi.on('speech-start', () => {
      console.log('Assistant started speaking');
      setCurrentRole("assistant");
    });

    vapi.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setCurrentRole('user');
    });
  };
  

  const endCall = async () => {
    setLoading(true);
    if (!vapiInstance) return;

    vapiInstance.stop();
    vapiInstance.off('call-start');
    vapiInstance.off('call-end');
    vapiInstance.off('message');
    vapiInstance.off('speech-start');
    vapiInstance.off('speech-end');
    setCallStarted(false);
    setVapiInstance(null);

    const result = await GenerateReport();
    setLoading(false);
  };

  const GenerateReport = async () => {
    const res = await axios.post('/api/medical-report', {
      messages: messages,
      sessionDetails: sessionDetails,
      sessionId: sessionId,
    });
    console.log(res.data);
    return res.data;
  };

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex items-center justify-between gap-4 p-4">
        <h2 className="p-1 px-2 border rounded-md gap-2 items-center flex">
          <Circle className={`w-3 h-3 rounded-full ${callStarted ? 'text-green-500' : 'text-red-500'}`} />
          {callStarted ? 'Connected' : 'Not Connected'}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>

      {sessionDetails?.selectedDoctor && (
        <div className="flex flex-col items-center mt-10">
          <Image
            src={sessionDetails.selectedDoctor.image}
            alt={sessionDetails.selectedDoctor.specialist}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg font-semibold">{sessionDetails.selectedDoctor.specialist}</h2>
          <p className="text-sm text-gray-400">AI Medical Agent</p>

          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-20 lg:px-52 xl:px-72">
            {messages?.slice(-4).map((message: message, index) => (
              <h2 key={index} className="text-gray-400 p-2">
                {message.role}: {message.text}
              </h2>
            ))}
            {liveTranscript?.length > 0 && (
              <h2 className="text-lg">
                {currentRole}: {liveTranscript}
              </h2>
            )}
          </div>

          <button
            disabled={loading}
            onClick={callStarted ? endCall : startCall}
            className={`flex gap-2 mt-4 px-4 py-2 text-white rounded-md ${
              callStarted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {callStarted ? <PhoneOff /> : <PhoneCall />}
            {callStarted ? 'Disconnect' : 'Start Call'}
          </button>
        </div>
      )}
    </div>
  );
}

export default MedicalVOiceAgent;
