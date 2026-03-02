import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Shield,
    Zap,
    Lock,
    CheckCircle,
    ArrowRight,
    Wallet,
    Smartphone,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdVideo() {
    const [scene, setScene] = useState(0);
    const [balance, setBalance] = useState(100);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setScene(1), 3000),  // Branding -> Plans
            setTimeout(() => setScene(2), 9000),  // Plans -> Growth Reveal ($100 to $1,590)
            setTimeout(() => { // Start profit counter for Scene 2
                const interval = setInterval(() => {
                    setBalance(prev => {
                        if (prev >= 1590) {
                            clearInterval(interval);
                            return 1590;
                        }
                        return prev + (Math.random() * 25 + 5);
                    });
                }, 60)
            }, 10000),
            setTimeout(() => setScene(3), 22000), // Result -> Final CTA
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const handleRecord = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 60, width: 1920, height: 1080 },
                audio: false
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fintrivox-ad-${Date.now()}.webm`;
                a.click();
                setIsRecording(false);
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Track time
            const startTime = Date.now();
            const timer = setInterval(() => {
                setRecordingTime(Math.round((Date.now() - startTime) / 1000));
            }, 1000);

            // Stop recording when stream ends (user clicks "Stop sharing")
            stream.getVideoTracks()[0].onended = () => {
                clearInterval(timer);
                mediaRecorder.stop();
            };

        } catch (err) {
            console.error("Recording failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#020203] flex items-center justify-center overflow-hidden font-sans text-white select-none z-[9999]">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Record Action Button (Smaller & Discreet) */}
            <div className="absolute bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
                {!isRecording ? (
                    <div className="flex flex-col items-end gap-2 group">
                        <p className="text-[8px] text-white/40 uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Record Ad</p>
                        <button
                            onClick={handleRecord}
                            className="w-10 h-10 bg-blue-600/40 hover:bg-blue-600 backdrop-blur-md text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white/10"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </button>
                        {/* Mobile Help Note */}
                        <div className="md:hidden text-[7px] text-white/30 uppercase tracking-tighter text-right leading-tight max-w-[80px]">
                            Tap phone's screen recorder to save on mobile
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-600 text-white px-3 py-1.5 rounded-full font-bold shadow-xl flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-[10px] tabular-nums">{recordingTime}s</span>
                    </div>
                )}
            </div>

            {/* iPhone Frame Mockup */}
            <div className="relative w-[320px] h-[650px] bg-black rounded-[50px] border-[8px] border-[#1a1a1c] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-1 ring-white/10 scale-90 md:scale-100 z-50">
                {/* iPhone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-[60] flex items-center justify-center">
                    <div className="w-8 h-1 bg-[#1a1a1c] rounded-full mr-2" />
                    <div className="w-1.5 h-1.5 bg-[#1a1a1c] rounded-full" />
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-[#0a0c10] overflow-hidden flex flex-col items-center justify-center p-5 pt-10">

                    {/* Scene 0: Branding */}
                    {scene === 0 && (
                        <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">
                                Fintri<span className="text-blue-500">vox</span>
                            </h1>
                            <p className="text-[9px] text-slate-500 tracking-[0.4em] uppercase font-bold">
                                Global Finance Standard
                            </p>
                        </div>
                    )}

                    {/* Scene 1: Investment Tiers */}
                    {scene === 1 && (
                        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <div className="text-center space-y-1 mb-4">
                                <h2 className="text-xl font-bold tracking-tight italic">Elite Yields.</h2>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Select Your Growth Path</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {[
                                    { name: "Starter", min: "$100", ret: "0.5% Daily", color: "border-white/5 bg-white/5", icon: Smartphone },
                                    { name: "Growth", min: "$1,000", ret: "0.8% Daily", color: "border-blue-500/40 bg-blue-600/10", active: true, icon: Zap },
                                    { name: "Elite", min: "$10,000", ret: "1.5% Daily", color: "border-white/5 bg-white/5", icon: Shield }
                                ].map((p, i) => (
                                    <div key={i} className={`px-4 py-3 rounded-xl border ${p.color} flex items-center justify-between transition-all duration-500`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.active ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-800'}`}>
                                                <p.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{p.name}</h3>
                                                <p className="text-[11px] font-black leading-tight">{p.min}+ Plan</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black tracking-tight ${p.active ? 'text-blue-400 italic underline decoration-blue-400/20 underline-offset-4' : 'text-slate-300'}`}>
                                                {p.ret}
                                            </p>
                                            <p className="text-[8px] text-slate-500 uppercase font-medium">Daily ROI</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-[8px] text-slate-500 italic text-center px-4 leading-relaxed font-medium">
                                    *Secured by institutional-grade liquidity protocols for consistent daily output.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Scene 2: The Profit Growth Visualization */}
                    {scene === 2 && (
                        <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                            <div className="text-center space-y-1">
                                <div className="w-10 h-0.5 bg-blue-600 rounded-full mx-auto mb-3" />
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-blue-500/20 underline-offset-4">Wealth Growth.</h2>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold italic">Compound Returns Visualized</p>
                            </div>

                            <div className="relative w-full px-2">
                                <div className="absolute inset-0 bg-blue-600/10 blur-[40px] rounded-full scale-125 opacity-60" />

                                <div className="relative bg-[#0d0f14]/90 border border-white/5 p-5 rounded-[2rem] backdrop-blur-3xl shadow-3xl ring-1 ring-white/10 flex flex-col items-center">
                                    <div className="flex items-center gap-1.5 mb-3 text-[8px] text-slate-500 font-bold uppercase tracking-[0.25em]">
                                        <Wallet className="w-2.5 h-2.5 text-blue-500" /> Wallet Balance
                                    </div>
                                    <div className="text-5xl font-black tracking-tighter text-white tabular-nums italic">
                                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="flex items-center gap-1 mt-4 text-green-400 font-black text-[10px] bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 items-center">
                                        <TrendingUp className="w-2.5 h-2.5" />
                                        +{((balance - 100) / 100 * 100).toFixed(1)}% YIELD ACHIEVED
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
                                {[
                                    { text: "Verified Audit", icon: CheckCircle },
                                    { text: "Instant Deposit", icon: Zap },
                                    { text: "256-bit Secure", icon: Lock },
                                    { text: "24/7 Support", icon: Check }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[8px] text-slate-400 font-bold uppercase tracking-tight bg-white/5 p-2 rounded-lg border border-white/5">
                                        <item.icon className="w-2.5 h-2.5 text-blue-500" /> {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scene 3: Final CTA */}
                    {scene === 3 && (
                        <div className="w-full flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black leading-none italic tracking-tighter uppercase">
                                    START <br />
                                    <span className="text-blue-500">EARNING</span> <br />
                                    TODAY
                                </h2>
                                <p className="text-[10px] text-slate-500 tracking-[0.3em] uppercase font-black italic">
                                    Join the Global Elite
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-6 w-full px-2">
                                <Button size="lg" className="w-full h-14 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl shadow-blue-500/20 border-b-4 border-blue-800 transition-all active:translate-y-1 active:border-b-0 group overflow-hidden">
                                    <span className="relative z-10 font-black italic tracking-tight flex items-center gap-2">
                                        OPEN ACCOUNT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-4 opacity-50">
                                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest leading-none bg-slate-800 px-2 py-1 rounded">SSL SECURE</div>
                                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest leading-none bg-slate-800 px-2 py-1 rounded">REGULATED</div>
                                    </div>
                                    <div className="text-base font-black tracking-[0.15em] text-white/30 uppercase italic border-t border-white/5 pt-4">
                                        WWW.FINTRIVOX.COM
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Reflection Shine Overlay */}
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-10 z-[100]" />
        </div>
    );
}
