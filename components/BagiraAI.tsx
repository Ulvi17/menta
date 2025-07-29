'use client';

import { useRef, useState, useEffect } from 'react';
import { MicrophoneIcon, PhoneIcon } from '@heroicons/react/24/solid';

// Type declarations
declare global {
  interface Window {
    Vapi: any;
    Supabase: {
      createClient: (url: string, key: string) => any;
    };
  }
}

interface BagiraAIProps {
  // Configuration
  vapiPublicKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  channel: string;
  assistantId: string;
  webhookUrl: string;
  
  // UI Customization
  phoneImageSrc?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonColor?: string;
  activeButtonColor?: string;
  
  // Callbacks
  onCallStart?: (callId: string) => void;
  onCallEnd?: () => void;
  onError?: (error: any) => void;
  onFormSubmit?: (formData: any, callId: string) => Promise<void>;
  
  // Modal customization
  modalTitle?: string;
  formFields?: {
    name?: boolean;
    phone?: boolean;
    email?: boolean;
  };
}

const BagiraAI: React.FC<BagiraAIProps> = ({
  vapiPublicKey,
  supabaseUrl,
  supabaseAnonKey,
  channel,
  assistantId,
  webhookUrl,
  phoneImageSrc = "/phone.svg",
  buttonSize = "lg",
  buttonColor = "bg-black/80",
  activeButtonColor = "bg-red-600/80",
  onCallStart,
  onCallEnd,
  onError,
  onFormSubmit,
  modalTitle = "Confirm your booking",
  formFields = { name: true, phone: true, email: true }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [callId, setCallId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const vapiRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);

  // Button size classes
  const buttonSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load Vapi script
        const vapiScript = document.createElement('script');
        vapiScript.type = 'module';
        vapiScript.innerHTML = `
          import Vapi from "https://esm.sh/@vapi-ai/web";
          import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
          
          window.Vapi = Vapi;
          window.Supabase = { createClient };
        `;
        document.head.appendChild(vapiScript);

        // Wait for scripts to load
        setTimeout(() => {
          if (window.Vapi && window.Supabase) {
            vapiRef.current = new window.Vapi(vapiPublicKey);
            supabaseRef.current = window.Supabase.createClient(supabaseUrl, supabaseAnonKey);

            // Set up Vapi event listeners
            vapiRef.current.on('call-start', (call: any) => {
              setIsActive(true);
              setIsLoading(false);
              const currentCallId = call?.id || call?.callId;
              if (currentCallId) {
                setCallId(currentCallId);
                onCallStart?.(currentCallId);
              }
            });

            vapiRef.current.on('call-end', () => {
              setIsActive(false);
              setIsLoading(false);
              onCallEnd?.();
            });

            vapiRef.current.on('error', (error: any) => {
              setIsActive(false);
              setIsLoading(false);
              onError?.(error);
            });

            vapiRef.current.on('message', (msg: any) => {
              const TRIGGER_PHRASE = "please type your phone number below to confirm.";
              if (msg.type === 'transcript' && 
                  msg.role === 'assistant' && 
                  msg.transcriptType === 'final' && 
                  msg.transcript?.toLowerCase().includes(TRIGGER_PHRASE)) {
                setIsModalOpen(true);
              }
            });

            // Set up Supabase Realtime
            supabaseRef.current.channel(channel)
              .on('broadcast', { event: 'call-created' }, ({ payload }: any) => {
                setCallId(payload.callId);
                console.log('🔔 callId via RT:', payload.callId);
              })
              .subscribe((s: string) => {
                if (s === 'SUBSCRIBED') console.log('✅ Supabase listener active');
              });
          }
        }, 1000);

      } catch (error) {
        console.error('Failed to load dependencies:', error);
        onError?.(error);
      }
    };

    loadScripts();
  }, [vapiPublicKey, supabaseUrl, supabaseAnonKey, channel, onCallStart, onCallEnd, onError]);

  const handlePhoneClick = async () => {
    if (isLoading) return;
    if (isActive) {
      setIsLoading(true);
      vapiRef.current?.stop();
      return;
    }
    
    setIsLoading(true);
    try {
      await vapiRef.current?.start(undefined, undefined, assistantId);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      onError?.(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callId) {
      alert('Call ID not captured. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (onFormSubmit) {
        await onFormSubmit(formData, callId);
      } else {
        // Default form submission
        const formDataToSend = new FormData();
        formDataToSend.append('callId', callId);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);

        await fetch(webhookUrl, {
          method: 'POST',
          body: formDataToSend,
          mode: 'no-cors'
        });
      }
      
      alert('Thank you! We have received your info.');
      setFormData({ name: '', phone: '', email: '' });
      setCallId('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Submit error', err);
      alert('Sending failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Phone with Bagira AI integration */}
      <div 
        className={`relative cursor-pointer group transition-all duration-200 ${
          isLoading ? 'pointer-events-none opacity-60' : ''
        }`} 
        onClick={handlePhoneClick}
      >
        <img 
          src={phoneImageSrc}
          alt="Phone illustration" 
          className={`h-48 sm:h-64 lg:h-80 w-auto transition-transform duration-200 ${
            isActive ? 'scale-105' : 'group-hover:scale-105'
          }`}
        />
        {/* Bagira AI overlay on phone */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-full ${buttonSizeClasses[buttonSize]} backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center justify-center ${
            isActive ? activeButtonColor : buttonColor
          }`}>
            {isActive ? (
              <PhoneIcon className={`${iconSizeClasses[buttonSize]} text-white`} />
            ) : (
              <MicrophoneIcon className={`${iconSizeClasses[buttonSize]} text-white`} />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[10000]"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#182a46] p-6 rounded-lg w-90 max-w-md shadow-lg">
            <div className="text-xl font-semibold mb-5 text-center text-white">
              {modalTitle}
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input
                type="hidden"
                value={callId}
                readOnly
              />
              {formFields.name && (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Name"
                  className="w-full p-3 rounded-md border border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                />
              )}
              {formFields.phone && (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Phone (+xxx)"
                  className="w-full p-3 rounded-md border border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                />
              )}
              {formFields.email && (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  className="w-full p-3 rounded-md border border-gray-300 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                />
              )}
              <button
                type="submit"
                disabled={isSubmitting || !callId}
                className="w-full p-3 bg-black text-white font-semibold rounded-md border-none cursor-pointer transition-colors duration-150 hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BagiraAI; 