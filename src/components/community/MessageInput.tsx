import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  roomId: string;
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: message,
          message_type: 'text'
        });

      if (error) throw error;
      setMessage("");
      toast({
        title: "Message sent!",
        description: "Your wisdom has been shared with the community",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      
      toast({
        title: "Recording...",
        description: "Tap again to send your voice message",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileName = `voice_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          message_type: 'voice',
          voice_url: publicUrl
        });

      if (error) throw error;

      toast({
        title: "Voice message sent!",
        description: "Your message has been shared",
      });
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileName = `crop_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      // Call DeepSeek vision API for analysis
      const { data: analysisData } = await supabase.functions.invoke('deepseek-vision', {
        body: { 
          task: 'crop_analysis',
          image_url: publicUrl
        }
      });

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          message_type: 'image',
          image_url: publicUrl,
          ai_analysis: analysisData?.result
        });

      if (error) throw error;

      toast({
        title: "Image uploaded!",
        description: "AI analysis is being generated",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Failed to upload image",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Share your wisdom with the community..."
        className="resize-none bg-background/50"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Photo
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={recording ? stopRecording : startRecording}
          disabled={uploading}
          className={cn(
            recording && "bg-destructive text-destructive-foreground animate-pulse"
          )}
        >
          <Mic className="h-4 w-4 mr-1" />
          {recording ? 'Stop' : 'Voice'}
        </Button>

        <Button
          onClick={sendMessage}
          disabled={!message.trim() || sending || uploading}
          className="ml-auto bg-gradient-to-r from-primary to-secondary"
        >
          {sending || uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
