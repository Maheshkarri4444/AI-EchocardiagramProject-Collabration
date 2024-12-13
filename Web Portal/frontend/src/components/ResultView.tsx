import  { useEffect, useRef, useState } from 'react';
import { LoadingAnimation } from './LoadingAnimation';
import { CardiacMetrics } from './CardiacMetrics';
import { DiagnosisSection } from './DiagnosisSection';
import { HeartVideo } from './HeartVideo';

interface ResultViewProps {
  inputVideo: string;
  outputVideo: string | null;
  isProcessing: boolean;
  order: number;
  analysisResult: {
    ejectionFraction: number;
    problem: string;
    cause: string;
    cure: string;
  } | null;
}

export function ResultView({ 
  inputVideo, 
  outputVideo, 
  isProcessing, 
  order,
  analysisResult 
}: ResultViewProps) {
  const inputVideoRef = useRef<HTMLVideoElement>(null);
  const outputVideoRef = useRef<HTMLVideoElement>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  useEffect(() => {
    // Clear the processed video when processing starts
    if (isProcessing) {
      if (processedVideo) {
        URL.revokeObjectURL(processedVideo);
      }
      setProcessedVideo(null);
      return;
    }

    // Only fetch video when processing is complete and we have analysis results
    if (!isProcessing && analysisResult) {
      const fetchProcessedVideo = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:5000/get-video`,{
            method: 'GET',
            headers: {
              'Content-Type': 'video/mp4',
            },
          });
          console.log("response after fetching: ", response);
          
          if (!response.ok) {
            throw new Error('Failed to fetch processed video');
          }

          const blob = await response.blob();
          console.log("blob is: ",blob)
          const videoUrl = URL.createObjectURL(blob);
          console.log("video url is: ",videoUrl)
          setProcessedVideo(videoUrl);
        } catch (error) {
          console.error('Error fetching processed video:', error);
        }
      };

      fetchProcessedVideo();
    }

    // Cleanup function to revoke object URL
    return () => {
      if (processedVideo) {
        URL.revokeObjectURL(processedVideo);
      }
    };
  }, [isProcessing, analysisResult]);

  useEffect(() => {
    const inputVid = inputVideoRef.current;
    const outputVid = outputVideoRef.current;

    if (!inputVid || !outputVid || !processedVideo) return;

    const handlePlay = () => {
      inputVid.play().catch(console.error);
      outputVid.play().catch(console.error);
    };

    const handlePause = () => {
      inputVid.pause();
      outputVid.pause();
    };

    const handleTimeUpdate = () => {
      if (Math.abs(inputVid.currentTime - outputVid.currentTime) > 0.1) {
        outputVid.currentTime = inputVid.currentTime;
      }
    };

    inputVid.addEventListener('play', handlePlay);
    inputVid.addEventListener('pause', handlePause);
    inputVid.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      inputVid.removeEventListener('play', handlePlay);
      inputVid.removeEventListener('pause', handlePause);
      inputVid.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [inputVideo, processedVideo]);

  const endDiastolicVolume = 134.44;
  const endSystolicVolume = 73.28;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Input Video</h3>
          <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
            <video
              ref={inputVideoRef}
              src={inputVideo}
              className="absolute inset-0 object-contain w-full h-full"
              controls
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Segmentation Result</h3>
          <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
            {isProcessing ? (
              <LoadingAnimation />
            ) : processedVideo ? (
              <video
                ref={outputVideoRef}
                src={processedVideo}
                className="absolute inset-0 object-contain w-full h-full"
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Click "Process Video" to start
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!isProcessing && analysisResult && (
        <>
          <CardiacMetrics 
            ejectionFraction={analysisResult.ejectionFraction}
            endDiastolicVolume={endDiastolicVolume}
            endSystolicVolume={endSystolicVolume}
          />
          <DiagnosisSection 
            ejectionFraction={analysisResult.ejectionFraction}
            problem={analysisResult.problem}
            cause={analysisResult.cause}
            cure={analysisResult.cure}
          />
          <HeartVideo />
        </>
      )}
    </div>
  );
}
