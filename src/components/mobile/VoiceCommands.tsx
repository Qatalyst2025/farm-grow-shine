import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandsProps {
  onCommand?: (command: string) => void;
}

export const VoiceCommands = ({ onCommand }: VoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcriptText = result[0].transcript;
        setTranscript(transcriptText);

        if (result.isFinal) {
          handleCommand(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice command error",
          description: "Please try again",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Process common farming commands
    if (lowerCommand.includes('take photo') || lowerCommand.includes('capture')) {
      toast({
        title: "Voice command recognized",
        description: "Opening camera...",
      });
      onCommand?.('camera');
    } else if (lowerCommand.includes('apply loan') || lowerCommand.includes('get loan')) {
      toast({
        title: "Voice command recognized",
        description: "Opening loan application...",
      });
      onCommand?.('loan');
    } else if (lowerCommand.includes('marketplace') || lowerCommand.includes('sell crops')) {
      toast({
        title: "Voice command recognized",
        description: "Opening marketplace...",
      });
      onCommand?.('marketplace');
    } else if (lowerCommand.includes('my crops') || lowerCommand.includes('view crops')) {
      toast({
        title: "Voice command recognized",
        description: "Showing your crops...",
      });
      onCommand?.('crops');
    } else {
      toast({
        title: "Command not recognized",
        description: `Try: "Take photo", "Apply loan", "View marketplace"`,
      });
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice commands not supported",
        description: "Your browser doesn't support voice commands",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say a command like 'Take photo' or 'Apply loan'",
      });
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">Voice Commands</h4>
          <p className="text-xs text-muted-foreground">
            {isListening ? (
              <span className="text-primary font-medium">{transcript || 'Listening...'}</span>
            ) : (
              'Tap mic to use voice commands'
            )}
          </p>
        </div>
        <Button
          size="icon"
          variant={isListening ? "default" : "outline"}
          onClick={toggleListening}
          className={`touch-manipulation ${isListening ? 'animate-pulse' : ''}`}
        >
          {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
      </div>
    </Card>
  );
};
