import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, Upload, FileText, Camera, AlertCircle, Clock, Loader2, Video, StopCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { kycApi } from '@/services/api';

export default function KYC() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieVideo, setSelfieVideo] = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    kycApi.getStatus().then(({ data }) => {
      setKycData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFileUpload = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontImage || !selfieVideo || !documentNumber) {
      alert('Please fill all fields and upload required documents, including the 15s selfie video.');
      return;
    }
    setSubmitting(true);
    try {
      await kycApi.submit({ documentType, documentNumber, frontImage, backImage, selfieVideo });
      await refreshUser();
      const { data } = await kycApi.getStatus();
      setKycData(data);
      alert('KYC documents submitted successfully! You will be notified once reviewed.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  // Normalize: API returns uppercase, AuthContext stores lowercase — compare case-insensitive
  const kycStatus = (kycData?.kycStatus || user?.kycStatus || 'NOT_SUBMITTED').toUpperCase();
  const rejectionReason = kycData?.document?.rejectionReason;

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const { data } = await kycApi.getStatus();
      setKycData(data);
    } catch { }
    setLoading(false);
  };

  const formProps = {
    documentType, setDocumentType,
    documentNumber, setDocumentNumber,
    frontImage, backImage, selfieVideo,
    frontRef, backRef,
    handleFileUpload,
    setFrontImage: (v: string) => setFrontImage(v),
    setBackImage: (v: string) => setBackImage(v),
    setSelfieVideo: (v: string | null) => setSelfieVideo(v),
    handleSubmit, submitting
  };

  if (kycStatus === 'VERIFIED') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">✅ Verified</Badge>
        </div>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-200">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900">Identity Verified!</h2>
            <p className="text-green-700 mt-2 mb-6">
              Your identity has been successfully verified. You now have full access to all platform features.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-left max-w-sm mx-auto">
              {['Make unlimited withdrawals', 'Access all investment plans', 'Higher transaction limits', 'Priority customer support'].map(f => (
                <div key={f} className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycStatus === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-sm px-3 py-1">⏳ Under Review</Badge>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-amber-200">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Documents Under Review</h2>
            <p className="text-gray-600 mt-2 mb-4">
              We've received your verification documents and our compliance team is reviewing them.
            </p>
            <div className="bg-white rounded-xl border border-yellow-200 p-4 text-sm text-left space-y-2 max-w-sm mx-auto mb-5">
              <p className="font-semibold text-gray-800">What happens next?</p>
              <p className="text-gray-600">📋 Your documents are currently being reviewed</p>
              <p className="text-gray-600">⏱ Review typically takes <strong>1–2 business days</strong></p>
              <p className="text-gray-600">📧 You'll receive an email once a decision is made</p>
              <p className="text-gray-600">🔔 A notification will appear in your dashboard</p>
            </div>
            <button
              onClick={refreshStatus}
              className="text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <Badge className="bg-red-100 text-red-700 border-red-200 text-sm px-3 py-1">❌ Rejected</Badge>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">Verification Rejected</h3>
                <p className="text-red-700 mt-1 text-sm">
                  {rejectionReason || 'Your submitted documents did not meet our requirements.'}
                </p>
                <p className="text-red-600 mt-3 text-sm font-medium">
                  Please resubmit with clearer, valid documents. Make sure the document is unexpired and all details are clearly visible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Resubmit your KYC documents below. Ensure photos are clear, well-lit, and the document is not expired.
          </AlertDescription>
        </Alert>
        <KYCForm {...formProps} />
      </div>
    );
  }

  // NOT_SUBMITTED — show benefits + form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
        <p className="text-gray-500">Complete KYC to unlock withdrawals and full platform access</p>
      </div>

      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-blue-800 mb-3">🔓 Why verify your identity?</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            {['Enable withdrawals', 'Higher transaction limits', 'Access all investment plans', 'Protect your account'].map(b => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <KYCForm {...formProps} />
    </div>
  );
}

function KYCForm({ documentType, setDocumentType, documentNumber, setDocumentNumber, frontImage, backImage, selfieVideo, frontRef, backRef, handleFileUpload, setFrontImage, setBackImage, setSelfieVideo, handleSubmit, submitting }: any) {
  const [step, setStep] = useState(1);

  // Video recording states
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      // Use lower resolution/bitrate to keep base64 payload manageable
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
        audio: false  // audio not needed for identity verification, keeps file small
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Pick the best available codec
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 150_000  // 150kbps — keeps 15s clip under ~400KB
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelfieVideo(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      // Collect data every second so we get smaller, more frequent chunks
      mediaRecorder.start(1000);
      setRecording(true);
      setTimeLeft(3);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      alert("Microphone and Camera permission is required to record the selfie verification video.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const retakeVideo = () => {
    setSelfieVideo(null);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center ${s !== 3 ? 'flex-1' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
              {s}
            </div>
            {s !== 3 && (
              <div className={`flex-1 h-1 mx-4 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle>Step 1: Identity Selection</CardTitle>
            <p className="text-sm text-gray-500">Choose the document type you want to verify with.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['passport', 'national_id', 'drivers_license', 'ssn_card'].map(type => (
                <button
                  key={type}
                  onClick={() => setDocumentType(type)}
                  className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${documentType === type ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${documentType === type ? 'text-blue-600' : 'text-gray-400'}`} />
                  {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
            <div>
              <Label>Document Number / ID Number</Label>
              <Input
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                placeholder="Enter your document number"
                className="mt-2"
              />
            </div>
            <Button className="w-full h-12 text-base" onClick={nextStep} disabled={!documentNumber}>
              Next Step: Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader>
            <CardTitle>Step 2: Upload Document Pages</CardTitle>
            <p className="text-sm text-gray-500">Please provide clear photos of your selected document.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Front */}
              <div>
                <Label className="text-base font-semibold">Front of Document</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${frontImage ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                  onClick={() => frontRef.current?.click()}
                >
                  {frontImage ? (
                    <div className="animate-in zoom-in duration-300">
                      <img src={frontImage} alt="Front" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                      <p className="text-sm font-medium text-green-600 mt-3 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Uploaded successfully</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="font-medium text-gray-900">Click to upload front</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setFrontImage)} />
              </div>

              {/* Back */}
              <div>
                <Label className="text-base font-semibold">Back of Document (If Applicable)</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${backImage ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                  onClick={() => backRef.current?.click()}
                >
                  {backImage ? (
                    <div className="animate-in zoom-in duration-300">
                      <img src={backImage} alt="Back" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                      <p className="text-sm font-medium text-green-600 mt-3 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Uploaded successfully</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="font-medium text-gray-900">Click to upload back</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setBackImage)} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-12" onClick={prevStep}>Back</Button>
              <Button className="flex-1 h-12 text-base" onClick={nextStep} disabled={!frontImage}>
                Next Step: Video Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Step 3: Live Face Verification</CardTitle>
            <p className="text-sm text-gray-500">
              Record a quick 3-second video of your face to confirm your identity. No documents needed — just your face.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800 mb-2">📋 Before recording, make sure to:</p>
              <ul className="space-y-1.5 text-sm text-blue-700">
                <li className="flex items-start gap-2"><span className="font-bold mt-0.5">1.</span> <span>Sit in a <strong>well-lit area</strong> — avoid backlighting from windows</span></li>
                <li className="flex items-start gap-2"><span className="font-bold mt-0.5">2.</span> <span>Position your <strong>face inside the oval frame</strong> on screen</span></li>
                <li className="flex items-start gap-2"><span className="font-bold mt-0.5">3.</span> <span>Keep your <strong>full face visible</strong> — remove glasses, hat, or mask</span></li>
                <li className="flex items-start gap-2"><span className="font-bold mt-0.5">4.</span> <span>Look <strong>directly at the camera</strong> and stay still for 3 seconds</span></li>
              </ul>
            </div>
            {/* Camera preview with face oval guide */}
            <div className="mx-auto max-w-sm rounded-xl overflow-hidden bg-black aspect-video relative shadow-lg">
              {!selfieVideo && (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              )}
              {selfieVideo && (
                <video
                  src={selfieVideo}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              )}

              {/* Face oval guide — shown while camera is active but not recorded yet */}
              {!selfieVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-48 rounded-full border-4 border-white border-dashed opacity-70" />
                </div>
              )}

              {!selfieVideo && !recording && (
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Align your face with the oval</span>
                </div>
              )}

              {recording && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 animate-pulse shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                  {timeLeft}s
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!selfieVideo && !recording && (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 h-12 w-full max-w-[200px]">
                  <Video className="w-5 h-5 mr-2" /> Start Recording
                </Button>
              )}
              {recording && (
                <Button onClick={stopRecording} className="bg-gray-800 hover:bg-gray-900 h-12 w-full max-w-[200px]">
                  <StopCircle className="w-5 h-5 mr-2" /> Stop Recording
                </Button>
              )}
              {selfieVideo && (
                <Button onClick={retakeVideo} variant="outline" className="h-12 w-full max-w-[200px]">
                  <RefreshCw className="w-5 h-5 mr-2" /> Retake Video
                </Button>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1 h-12 text-base" onClick={prevStep}>Back</Button>
              <Button
                className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSubmit}
                disabled={submitting || !selfieVideo}
              >
                {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Submit Verification</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
