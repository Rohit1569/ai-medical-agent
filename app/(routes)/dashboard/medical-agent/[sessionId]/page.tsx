'use client';

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import Vapi from '@vapi-ai/web';
import { toast } from "sonner";

export type SessionDetails = {
  id: number;
  name: string;
  notes: string;
  sessionId: string;
  report: JSON | null;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        const { data } = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
        setSessionDetails(data[0]);
      } catch (error) {
        console.error("Failed to fetch session details", error);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const startCall = async () => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY ?? '';
    if (!apiKey) {
      toast.error('Vapi API key is not configured.');
      return;
    }

    const vapi = new Vapi(apiKey);
    setVapiInstance(vapi);

    const config = {
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
            content:
              sessionDetails?.selectedDoctor.agentPrompt ||
              'You are a helpful AI medical agent. Please assist the user with their medical queries in a friendly and professional manner.',
          },
        ],
      },
    };

    vapi.on('call-start', () => setCallStarted(true));
    vapi.on('call-end', () => setCallStarted(false));
    vapi.on('error', (error) => {
      console.error('Vapi call error', error);
      setCallStarted(false);
      toast.error('The voice call could not stay connected.');
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcript, transcriptType } = message;
        if (transcriptType === 'partial') {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === 'final') {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript('');
          setCurrentRole(null);
        }
      }
    });

    vapi.on('speech-start', () => setCurrentRole('assistant'));
    vapi.on('speech-end', () => setCurrentRole('user'));

    try {
      // @ts-expect-error vapi types do not expose the inline assistant config.
      await vapi.start(config);
    } catch (error) {
      console.error('Failed to start Vapi call', error);
      setCallStarted(false);
      setVapiInstance(null);
      toast.error('Unable to start the voice call.');
    }
  };

  const endCall = async () => {
    setLoading(true);

    try {
     

      if (vapiInstance) {
        vapiInstance.stop();
        vapiInstance.off('call-start');
        vapiInstance.off('call-end');
        vapiInstance.off('message');
        vapiInstance.off('speech-start');
        vapiInstance.off('speech-end');
      }
      await generateReport();
      toast.success('Your report has been generated!');
      router.replace('/dashboard');
    } catch (error) {
      toast.error('Failed to generate report.');
      console.error(error);
    } finally {
      setCallStarted(false);
      setVapiInstance(null);
      setLoading(false);
    }
  };

  const generateReport = async () => {
    const res = await axios.post('/api/medical-report', {
      messages,
      sessionDetails,
      sessionId,
    });
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

      {sessionDetails ? (
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

          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-20 lg:px-52 xl:px-72 max-h-60">
            {messages.slice(-4).map((msg, idx) => (
              <h2 key={idx} className="text-gray-400 p-2">
                {msg.role}: {msg.text}
              </h2>
            ))}
            {liveTranscript && (
              <h2 className="text-lg">{currentRole}: {liveTranscript}</h2>
            )}
          </div>

          <button
            disabled={loading}
            onClick={callStarted ? endCall : startCall}
            className={`flex items-center gap-2 mt-4 px-4 py-2 text-white rounded-md ${
              callStarted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {callStarted ? <PhoneOff /> : <PhoneCall />}
            {callStarted ? 'Disconnect' : 'Start Call'}
          </button>
        </div>
      ) : (
        <div className="text-center text-red-500 mt-10">
          No doctor information found for this session.
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
