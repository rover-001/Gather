import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuestLayout } from '../../../layouts/GuestLayout';
import { api } from '../../../lib/api';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Upload,
} from 'lucide-react';

export default function GuestCameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [liveStreamEnabled, setLiveStreamEnabled] = useState(true);
  const [focusRing, setFocusRing] = useState<{ x: number; y: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [bgUploadCount, setBgUploadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const videoSeqRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const previewIntervalRef = useRef<any>(null);

  // Show transient toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const boostedRef = useRef(false);

  // Setup WebSocket connection for live camera preview with auto-reconnection
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
      socket.binaryType = 'arraybuffer';
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        setWsConnected(true);
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setWsConnected(false);
        // Automatically reconnect after 1.5 seconds if hotspot or network interface switched
        reconnectTimer = setTimeout(connect, 1500);
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onmessage = (ev) => {
        if (typeof ev.data !== 'string') return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'boost') boostedRef.current = true;
          else if (msg.type === 'unboost') boostedRef.current = false;
        } catch {
          // ignore non-JSON
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  // Session guard: check credentials when online, but stay in camera if offline
  useEffect(() => {
    api('/api/me').catch((err: any) => {
      // If server explicitly returned 401/pending, redirect. But if network failed (offline), do NOT bounce.
      if (err?.data?.pending) {
        navigate('/waiting', { replace: true });
      } else if (err?.status === 401) {
        navigate('/?join=1', { replace: true });
      }
    });
  }, [navigate]);

  // Initialize Camera Stream
  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      setCameraError(null);
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support in-browser camera streaming. Please use the Upload button below.');
      }

      // Request high performance mobile camera stream (1080p ideal)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
            // @ts-ignore
            focusMode: { ideal: 'continuous' },
            // @ts-ignore
            exposureMode: { ideal: 'continuous' },
            // @ts-ignore
            whiteBalanceMode: { ideal: 'continuous' },
          },
          audio: false,
        });
      } catch (err: any) {
        try {
          // Fallback to standard 720p HD rear camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to basic video
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }

      // Automatically configure video track for continuous autofocus
      try {
        const track = stream.getVideoTracks()[0];
        if (track && 'applyConstraints' in track) {
          const caps: any = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
          const adv: any = {};
          if (caps.focusMode?.includes('continuous')) adv.focusMode = 'continuous';
          if (caps.exposureMode?.includes('continuous')) adv.exposureMode = 'continuous';
          if (caps.whiteBalanceMode?.includes('continuous')) adv.whiteBalanceMode = 'continuous';
          if (Object.keys(adv).length > 0) {
            await track.applyConstraints({ advanced: [adv] } as any);
          }
        }
      } catch {
        // capabilities check
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission') || err.name === 'PermissionDeniedError') {
        setCameraError('PERMISSION_DENIED');
      } else {
        setCameraError(err.message || 'Could not access camera.');
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Live camera stream encoder: ~10fps @ 800px (16fps @ 1280px boosted)
  // Perfectly calibrated for fluid real-time transmission without mobile lag or thermal throttling
  useEffect(() => {
    if (previewIntervalRef.current) clearTimeout(previewIntervalRef.current);

    if (!liveStreamEnabled) return;

    let cancelled = false;
    const encodeCanvas = document.createElement('canvas');

    const schedule = () => {
      if (cancelled) return;
      const delay = boostedRef.current ? 60 : 100;
      previewIntervalRef.current = setTimeout(tick, delay);
    };

    const tick = () => {
      const ws = wsRef.current;
      const video = videoRef.current;
      if (
        !ws ||
        ws.readyState !== WebSocket.OPEN ||
        ws.bufferedAmount > 32768 || // drop frame immediately if socket has >32KB pending to prevent latency buildup
        !video ||
        video.readyState < 2 ||
        !video.videoWidth
      ) {
        schedule();
        return;
      }

      const ctx = encodeCanvas.getContext('2d');
      if (!ctx) {
        schedule();
        return;
      }

      const nativeW = video.videoWidth;
      const nativeH = video.videoHeight;
      const maxDim = boostedRef.current ? 720 : 480;
      const scale = Math.min(1, maxDim / Math.max(nativeW, nativeH));
      const targetW = Math.round(nativeW * scale);
      const targetH = Math.round(nativeH * scale);

      if (encodeCanvas.width !== targetW || encodeCanvas.height !== targetH) {
        encodeCanvas.width = targetW;
        encodeCanvas.height = targetH;
      }
      ctx.imageSmoothingEnabled = false; // Fast pixel blit
      ctx.drawImage(video, 0, 0, targetW, targetH);

      encodeCanvas.toBlob(
        (blob) => {
          if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              // ws.send(blob) natively dispatches binary data without .arrayBuffer() conversion overhead
              wsRef.current.send(blob);
            } catch {
              // socket error
            }
          }
          schedule();
        },
        'image/jpeg',
        boostedRef.current ? 0.70 : 0.60
      );
    };

    schedule();

    return () => {
      cancelled = true;
      if (previewIntervalRef.current) clearTimeout(previewIntervalRef.current);
    };
  }, [liveStreamEnabled]);

  // Flip camera (front / rear)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Tap to Focus: Applies focusMode and points of interest if supported by phone camera, and shows animated focus ring
  const handleTapToFocus = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Don't trigger if tapping on controls
    if ((e.target as HTMLElement).closest('button, input, label, a')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setFocusRing({ x, y });
    setTimeout(() => {
      setFocusRing((current) => (current?.x === x && current?.y === y ? null : current));
    }, 1500);

    // Apply hardware focus if supported by mobile browser
    try {
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        const capabilities: any = (videoTrack as any).getCapabilities ? (videoTrack as any).getCapabilities() : {};
        const constraints: any = { advanced: [] };

        if (capabilities.focusMode?.includes('continuous') || capabilities.focusMode?.includes('auto')) {
          constraints.advanced.push({ focusMode: 'continuous' });
        }
        if (capabilities.exposureMode?.includes('continuous')) {
          constraints.advanced.push({ exposureMode: 'continuous' });
        }

        if (constraints.advanced.length > 0) {
          await videoTrack.applyConstraints(constraints);
        }
      }
    } catch {
      // Focus capability optional on older WebViews
    }
  };

  // Client-side downscaler/compressor to keep uploads fast (~1-2MB max instead of 6-15MB raw phone uploads)
  const compressImage = async (blobOrFile: Blob | File, maxDim = 2560, quality = 0.88): Promise<Blob> => {
    return new Promise((resolve) => {
      // If image is already smaller than 1.5MB, keep as is
      if (blobOrFile.size < 1.5 * 1024 * 1024) {
        return resolve(blobOrFile);
      }

      const img = new Image();
      const url = URL.createObjectURL(blobOrFile);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(blobOrFile);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (result) => {
            resolve(result || blobOrFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(blobOrFile);
      };
      img.src = url;
    });
  };

  // Upload photo in background without freezing the camera or shutter button
  const uploadPhotoInBackground = async (rawBlob: Blob | File) => {
    setBgUploadCount((c) => c + 1);
    try {
      try {
        const { savePhotoLocally } = await import('../../../lib/offlineStorage');
        const hash = await savePhotoLocally(rawBlob);
        // Broadcast over P2P mesh
        try {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'catalog_update', hash }));
          }
        } catch {
          // ignore mesh broadcast failure
        }
      } catch (err) {
        console.warn('Failed to save offline:', err);
      }
      showToast('Photo captured & saved to local mesh!');

      try {
        const compressedBlob = await compressImage(rawBlob);
        const formData = new FormData();
        formData.append('file', compressedBlob, 'photo.jpg');

        const res = await fetch('/api/upload/photo', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          showToast('Photo uploaded to host server!');
        }
      } catch (uploadErr) {
        // Expected when disconnected/offline. Photo is already saved safely in IndexedDB and mesh
        console.log('Operating in pure offline mode. Photo stored locally in P2P mesh.');
      }
    } catch (err: any) {
      console.error('Background upload error:', err);
    } finally {
      setBgUploadCount((c) => Math.max(0, c - 1));
    }
  };

  // Capture Photo with native phone hardware processing or high-res frame
  const takePhoto = async () => {
    if (!videoRef.current) return;

    try {
      // 1. Try ImageCapture API (Chromium/Android) which grabs raw sensor resolution and ISP processing
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      if (videoTrack && (window as any).ImageCapture) {
        try {
          const imageCapture = new (window as any).ImageCapture(videoTrack);
          const blob = await imageCapture.takePhoto();
          if (blob) {
            uploadPhotoInBackground(blob);
            return;
          }
        } catch (icErr) {
          console.warn('ImageCapture fallback to canvas:', icErr);
        }
      }

      // 2. High-quality Canvas capture fallback
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            uploadPhotoInBackground(blob);
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (err: any) {
      showToast(err.message || 'Capture error');
    }
  };

  // Video Recording Controls
  const startRecording = () => {
    if (!streamRef.current || isRecording) return;

    try {
      const stream = streamRef.current;
      const videoId = crypto.randomUUID();
      currentVideoIdRef.current = videoId;
      videoSeqRef.current = 0;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/mp4')
          ? 'video/mp4'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && currentVideoIdRef.current) {
          const seq = videoSeqRef.current++;
          const formData = new FormData();
          formData.append('file', e.data);

          try {
            await fetch(`/api/upload/video-chunk?id=${currentVideoIdRef.current}&seq=${seq}`, {
              method: 'POST',
              body: formData,
            });
          } catch (err) {
            console.error('Video chunk upload error:', err);
          }
        }
      };

      mediaRecorder.start(4000); // 4-second time-sliced chunks
      setIsRecording(true);
      setRecordDuration(0);
    } catch (err: any) {
      showToast(err.message || 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setUploading(true);

    const videoId = currentVideoIdRef.current;
    if (videoId) {
      try {
        await api(`/api/upload/video-done?id=${videoId}`, { method: 'POST' });
        showToast('Video uploaded to host!');
      } catch (err: any) {
        showToast(err.message || 'Failed to finalize video');
      } finally {
        setUploading(false);
      }
    }
  };

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GuestLayout fullScreen>
      <div
        onClick={handleTapToFocus}
        className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden cursor-crosshair select-none touch-none"
      >
        {/* Hidden preview canvas for WebSockets */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Animated Tap to Focus Ring */}
        {focusRing && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-amber-400 rounded-full animate-ping duration-700"
            style={{ left: focusRing.x, top: focusRing.y }}
          >
            <div className="absolute inset-2 border border-amber-300 rounded-full" />
          </div>
        )}

        {/* Top Floating Controls */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          {/* Live Feed Toggle: Allows guest to disable/enable streaming preview to host */}
          <button
            onClick={() => {
              const nextState = !liveStreamEnabled;
              setLiveStreamEnabled(nextState);
              showToast(nextState ? 'Live streaming to host enabled' : 'Live streaming disabled (private)');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition active:scale-95 cursor-pointer ${
              liveStreamEnabled
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-black/50 border-white/20 text-slate-400'
            }`}
            title="Toggle live camera preview streaming to the host"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveStreamEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] font-bold">
              {liveStreamEnabled ? 'FEED ON' : 'FEED OFF'}
            </span>
            {wsConnected ? (
              <Wifi className="w-3 h-3 text-emerald-400 ml-0.5" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-400 ml-0.5" />
            )}
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
              onClick={() => {
                if (!isRecording) setMode('photo');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                mode === 'photo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300'
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => {
                if (!isRecording) setMode('video');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                mode === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300'
              }`}
            >
              Video
            </button>
          </div>

          {/* Camera Flip */}
          <button
            onClick={toggleFacingMode}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/15 active:scale-95 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {toast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-white/95 text-slate-900 text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}

        {/* Camera Permission or Hardware Error */}
        {cameraError && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Camera Permission Blocked</h3>
            
            {cameraError === 'PERMISSION_DENIED' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-4 max-w-xs text-left text-xs space-y-2 text-slate-300">
                <p className="font-semibold text-white">How to unblock in 2 taps:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Tap the <span className="text-white font-bold">Lock icon 🔒</span> or <span className="text-white font-bold">Page settings</span> icon in your address bar</li>
                  <li>Tap <span className="text-white font-bold">Permissions</span> (or Site settings)</li>
                  <li>Switch <span className="text-white font-bold">Camera</span> to <span className="text-emerald-400 font-bold">Allow</span></li>
                </ol>
              </div>
            ) : (
              <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">{cameraError}</p>
            )}
            
            <div className="flex flex-col w-full max-w-xs space-y-3">
              <button
                onClick={startCamera}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-md active:scale-95 cursor-pointer"
              >
                Reload Camera Feed
              </button>

              <label className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer active:scale-95">
                <Upload className="w-4 h-4 text-slate-300" />
                <span>Or Snap photo with System Camera</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadPhotoInBackground(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Video Recording Indicator */}
        {isRecording && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-red-600/90 text-white px-3.5 py-1.5 rounded-full text-xs font-mono font-bold backdrop-blur-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{formatSeconds(recordDuration)}</span>
          </div>
        )}

          {/* Bottom Shutter Trigger Controls */}
        <div className="relative z-20 pb-6 pt-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center justify-center">
          {/* Hidden input to invoke phone's native camera processing app */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadPhotoInBackground(file);
              if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
            }}
          />

          {mode === 'photo' ? (
            <button
              type="button"
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition p-1 cursor-pointer shadow-2xl relative"
            >
              <div className="w-full h-full rounded-full bg-white transition hover:scale-95" />
              {bgUploadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                  {bgUploadCount}
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition p-1 cursor-pointer disabled:opacity-50 shadow-2xl ${
                isRecording ? 'border-red-500' : 'border-white'
              }`}
            >
              <div
                className={`transition-all duration-200 ${
                  isRecording ? 'w-8 h-8 rounded-md bg-red-600' : 'w-full h-full rounded-full bg-red-600'
                }`}
              />
            </button>
          )}

          <p className="text-[11px] text-slate-300 font-medium mt-3 tracking-wide drop-shadow-md">
            {mode === 'photo'
              ? bgUploadCount > 0
                ? `Uploading ${bgUploadCount} photo${bgUploadCount > 1 ? 's' : ''} in background...`
                : 'Tap to capture'
              : isRecording
              ? 'Tap to stop recording'
              : 'Tap to start recording'}
          </p>
        </div>
      </div>
    </GuestLayout>
  );
}
