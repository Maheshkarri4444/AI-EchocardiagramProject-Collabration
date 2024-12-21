import { useEffect, useRef, useState } from 'react';
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
  const [maskGif, setMaskGif] = useState<string | null>(null);
  const [ecgGif, setEcgGif] = useState<string | null>(null);

  useEffect(() => {
    if (isProcessing) {
      if (maskGif) URL.revokeObjectURL(maskGif);
      if (ecgGif) URL.revokeObjectURL(ecgGif);
      setMaskGif(null);
      setEcgGif(null);
      return;
    }

    if (!isProcessing && analysisResult) {
      const fetchResources = async () => {
        try {
          // Fetch mask GIF
          const maskResponse = await fetch(`http://127.0.0.1:5000/get-video/mask`);
          if (!maskResponse.ok) {
            throw new Error('Failed to fetch mask GIF');
          }
          const maskBlob = await maskResponse.blob();
          const maskUrl = URL.createObjectURL(maskBlob);
          setMaskGif(maskUrl);

          // Fetch ECG GIF
          const ecgResponse = await fetch(`http://127.0.0.1:5000/get-video/ecg`);
          if (!ecgResponse.ok) {
            throw new Error('Failed to fetch ECG GIF');
          }
          const ecgBlob = await ecgResponse.blob();
          const ecgUrl = URL.createObjectURL(ecgBlob);
          setEcgGif(ecgUrl);
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      };

      fetchResources();
    }

    return () => {
      if (maskGif) URL.revokeObjectURL(maskGif);
      if (ecgGif) URL.revokeObjectURL(ecgGif);
    };
  }, [isProcessing, analysisResult]);

  const endDiastolicVolume = 134.44;
  const endSystolicVolume = 73.28;

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-8">
        <div className="w-1/2 space-y-2">
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
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Segmented Mask</h3>
          <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
            {isProcessing ? (
              <LoadingAnimation />
            ) : maskGif ? (
              <img
                src={maskGif}
                alt="Segmented Mask"
                className="absolute inset-0 object-contain w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Click "Process Video" to start
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">ECG GIF</h3>
          <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
            {isProcessing ? (
              <LoadingAnimation />
            ) : ecgGif ? (
              <img
                src={ecgGif}
                alt="ECG GIF"
                className="absolute inset-0 object-contain w-full h-full"
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
          <div className="w-1/3">
            <CardiacMetrics 
              ejectionFraction={analysisResult.ejectionFraction}
              endDiastolicVolume={endDiastolicVolume}
              endSystolicVolume={endSystolicVolume}
            />
          </div>
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

// import { useEffect, useRef, useState } from 'react';
// import { LoadingAnimation } from './LoadingAnimation';
// import { CardiacMetrics } from './CardiacMetrics';
// import { DiagnosisSection } from './DiagnosisSection';
// import { HeartVideo } from './HeartVideo';

// interface ResultViewProps {
//   inputVideo: string;
//   outputVideo: string | null;
//   isProcessing: boolean;
//   order: number;
//   analysisResult: {
//     ejectionFraction: number;
//     problem: string;
//     cause: string;
//     cure: string;
//   } | null;
// }

// export function ResultView({ 
//   inputVideo, 
//   outputVideo, 
//   isProcessing, 
//   order,
//   analysisResult 
// }: ResultViewProps) {
//   const inputVideoRef = useRef<HTMLVideoElement>(null);
//   const outputVideoRef1 = useRef<HTMLVideoElement>(null);
//   const [maskVideo, setMaskVideo] = useState<string | null>(null);
//   const [ecgGif, setEcgGif] = useState<string | null>(null);

//   useEffect(() => {
//     if (isProcessing) {
//       if (maskVideo) URL.revokeObjectURL(maskVideo);
//       if (ecgGif) URL.revokeObjectURL(ecgGif);
//       setMaskVideo(null);
//       setEcgGif(null);
//       return;
//     }

//     if (!isProcessing && analysisResult) {
//       const fetchResources = async () => {
//         try {
//           // Fetch mask video
//           const maskResponse = await fetch(`http://127.0.0.1:5000/get-video/mask`);
//           if (!maskResponse.ok) {
//             throw new Error('Failed to fetch mask video');
//           }
//           const maskBlob = await maskResponse.blob();
//           const maskUrl = URL.createObjectURL(maskBlob);
//           setMaskVideo(maskUrl);

//           // Fetch ECG GIF
//           const ecgResponse = await fetch(`http://127.0.0.1:5000/get-video/ecg`);
//           if (!ecgResponse.ok) {
//             throw new Error('Failed to fetch ECG GIF');
//           }
//           const ecgBlob = await ecgResponse.blob();
//           const ecgUrl = URL.createObjectURL(ecgBlob);
//           setEcgGif(ecgUrl);
//         } catch (error) {
//           console.error('Error fetching resources:', error);
//         }
//       };

//       fetchResources();
//     }

//     return () => {
//       if (maskVideo) URL.revokeObjectURL(maskVideo);
//       if (ecgGif) URL.revokeObjectURL(ecgGif);
//     };
//   }, [isProcessing, analysisResult]);

//   useEffect(() => {
//     const inputVid = inputVideoRef.current;
//     const outputVid1 = outputVideoRef1.current;

//     if (!inputVid || !outputVid1 || !maskVideo) return;

//     const handlePlay = () => {
//       inputVid.play().catch(console.error);
//       outputVid1.play().catch(console.error);
//     };

//     const handlePause = () => {
//       inputVid.pause();
//       outputVid1.pause();
//     };

//     const handleTimeUpdate = () => {
//       if (Math.abs(inputVid.currentTime - outputVid1.currentTime) > 0.1) {
//         outputVid1.currentTime = inputVid.currentTime;
//       }
//     };

//     inputVid.addEventListener('play', handlePlay);
//     inputVid.addEventListener('pause', handlePause);
//     inputVid.addEventListener('timeupdate', handleTimeUpdate);

//     return () => {
//       inputVid.removeEventListener('play', handlePlay);
//       inputVid.removeEventListener('pause', handlePause);
//       inputVid.removeEventListener('timeupdate', handleTimeUpdate);
//     };
//   }, [inputVideo, maskVideo]);

//   const endDiastolicVolume = 134.44;
//   const endSystolicVolume = 73.28;

//   return (
//     <div className="space-y-8">
//       <div className="flex justify-center gap-8">
//         <div className="w-1/2 space-y-2">
//           <h3 className="font-medium text-gray-700">Input Video</h3>
//           <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
//             <video
//               ref={inputVideoRef}
//               src={inputVideo}
//               className="absolute inset-0 object-contain w-full h-full"
//               controls
//               autoPlay
//               loop
//               muted
//               playsInline
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-8">
//         <div className="space-y-2">
//           <h3 className="font-medium text-gray-700">Segmented Video</h3>
//           <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
//             {isProcessing ? (
//               <LoadingAnimation />
//             ) : maskVideo ? (
//               <video
//                 ref={outputVideoRef1}
//                 src={maskVideo}
//                 className="absolute inset-0 object-contain w-full h-full"
//                 controls
//                 autoPlay
//                 loop
//                 muted
//                 playsInline
//               />
//             ) : (
//               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
//                 Click "Process Video" to start
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="space-y-2">
//           <h3 className="font-medium text-gray-700">ECG GIF</h3>
//           <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-video">
//             {isProcessing ? (
//               <LoadingAnimation />
//             ) : ecgGif ? (
//               <img
//                 src={ecgGif}
//                 alt="ECG GIF"
//                 className="absolute inset-0 object-contain w-full h-full"
//               />
//             ) : (
//               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
//                 Click "Process Video" to start
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {!isProcessing && analysisResult && (
//         <>
//           <div className="w-1/3">
//             <CardiacMetrics 
//               ejectionFraction={analysisResult.ejectionFraction}
//               endDiastolicVolume={endDiastolicVolume}
//               endSystolicVolume={endSystolicVolume}
//             />
//           </div>
//           <DiagnosisSection 
//             ejectionFraction={analysisResult.ejectionFraction}
//             problem={analysisResult.problem}
//             cause={analysisResult.cause}
//             cure={analysisResult.cure}
//           />
//           <HeartVideo />
//         </>
//       )}
//     </div>
//   );
// }

