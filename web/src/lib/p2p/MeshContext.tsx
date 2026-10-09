import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MeshPeer } from './mesh';
import { getAllLocalPhotos, type OfflinePhoto, getPeerCatalog } from '../offlineStorage';

interface MeshContextType {
  peers: Record<string, MeshPeer>;
  connectedCount: number;
  offlinePhotos: OfflinePhoto[];
  localId: string;
  refreshPhotos: () => Promise<void>;
  broadcastHash: (hash: string) => void;
  createManualOffer: () => Promise<string>;
  acceptManualOffer: (offerJson: string) => Promise<string>;
  finalizeManualAnswer: (peerId: string, answerJson: string) => Promise<void>;
  scanBluetoothPeers: () => Promise<string | null>;
  isMeshModalOpen: boolean;
  setIsMeshModalOpen: (open: boolean) => void;
}

const MeshContext = createContext<MeshContextType>({
  peers: {},
  connectedCount: 0,
  offlinePhotos: [],
  localId: '',
  refreshPhotos: async () => {},
  broadcastHash: () => {},
  createManualOffer: async () => '',
  acceptManualOffer: async () => '',
  finalizeManualAnswer: async () => {},
  scanBluetoothPeers: async () => null,
  isMeshModalOpen: false,
  setIsMeshModalOpen: () => {}
});

export const useMesh = () => useContext(MeshContext);

export const MeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peers, setPeers] = useState<Record<string, MeshPeer>>({});
  const [offlinePhotos, setOfflinePhotos] = useState<OfflinePhoto[]>([]);
  const [isMeshModalOpen, setIsMeshModalOpen] = useState(false);
  const peersRef = useRef<Record<string, MeshPeer>>({});
  const localIdRef = useRef<string>(
    sessionStorage.getItem('gather_local_peer_id') ||
    (() => {
      const generated = 'peer-' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('gather_local_peer_id', generated);
      return generated;
    })()
  );

  const localId = localIdRef.current;

  const refreshPhotos = async () => {
    const photos = await getAllLocalPhotos();
    setOfflinePhotos(photos);
  };

  useEffect(() => {
    refreshPhotos();
  }, []);

  const attachPeerListeners = (peer: MeshPeer, peerId: string) => {
    peer.onCatalogUpdate = async (_remotePeerId, hashes) => {
      // Check which hashes we don't have and request them over WebRTC DataChannel
      const localCatalog = await getPeerCatalog('local');
      for (const h of hashes) {
        if (!localCatalog.includes(h)) {
          peer.sendMessage({ type: 'request_chunk', hash: h });
        }
      }
    };

    peer.onPhotoReceived = async () => {
      await refreshPhotos();
    };

    peer.onClose = () => {
      delete peersRef.current[peerId];
      setPeers({ ...peersRef.current });
    };
  };

  // Auto-connect to local LAN mesh broker via WebSocket if on same Wi-Fi / Hotspot
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectLAN = () => {
      try {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${proto}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(JSON.stringify({ type: 'join_mesh', peerId: localId }));
        };

        ws.onmessage = async (e) => {
          try {
            const msg = JSON.parse(e.data);

            const connectToPeer = async (remotePeerId: string) => {
              if (peersRef.current[remotePeerId] || remotePeerId === localId) return;
              const peer = new MeshPeer(true, localId, (candidate) => {
                ws?.send(JSON.stringify({
                  type: 'signal',
                  target: remotePeerId,
                  signal: { type: 'candidate', candidate }
                }));
              });
              attachPeerListeners(peer, remotePeerId);
              peersRef.current[remotePeerId] = peer;

              const offer = await peer.pc.createOffer();
              await peer.pc.setLocalDescription(offer);

              ws?.send(JSON.stringify({
                type: 'signal',
                target: remotePeerId,
                signal: offer
              }));
              setPeers({ ...peersRef.current });
            };

            if (msg.type === 'mesh_peers' && Array.isArray(msg.peers)) {
              for (const p of msg.peers) {
                await connectToPeer(p);
              }
            } else if (msg.type === 'peer_joined' && msg.peerId !== localId) {
              await connectToPeer(msg.peerId);
            } else if (msg.type === 'signal') {
              const src = msg.source;
              if (!src) return;

              let peer = peersRef.current[src];
              if (!peer && msg.signal.type === 'offer') {
                peer = new MeshPeer(false, localId, (candidate) => {
                  ws?.send(JSON.stringify({
                    type: 'signal',
                    target: src,
                    signal: { type: 'candidate', candidate }
                  }));
                });
                attachPeerListeners(peer, src);
                peersRef.current[src] = peer;
              }

              if (peer) {
                if (msg.signal.type === 'offer' || msg.signal.type === 'answer') {
                  await peer.pc.setRemoteDescription(new RTCSessionDescription(msg.signal));
                  if (msg.signal.type === 'offer') {
                    const answer = await peer.pc.createAnswer();
                    await peer.pc.setLocalDescription(answer);
                    ws?.send(JSON.stringify({
                      type: 'signal',
                      target: src,
                      signal: answer
                    }));
                  }
                } else if (msg.signal.candidate) {
                  await peer.pc.addIceCandidate(new RTCIceCandidate(msg.signal.candidate));
                }
              }
              setPeers({ ...peersRef.current });
            }
          } catch {
            // non-json or binary frame
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectLAN, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // network offline
      }
    };

    connectLAN();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [localId]);

  const broadcastHash = (hash: string) => {
    Object.values(peersRef.current).forEach(peer => {
      peer.sendMessage({ type: 'catalog_update', peerId: localId, hashes: [hash] });
    });
  };

  // Optical Air-Gapped / QR Code WebRTC Signaling
  const createManualOffer = async (): Promise<string> => {
    const offerPeerId = 'manual-' + Math.random().toString(36).substring(2, 6);
    const peer = new MeshPeer(true, localId, () => {});
    attachPeerListeners(peer, offerPeerId);
    peersRef.current[offerPeerId] = peer;
    setPeers({ ...peersRef.current });

    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);

    // Wait for local ICE candidates to gather so the single QR contains all needed endpoints
    await new Promise<void>((resolve) => {
      if (peer.pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const check = () => {
          if (peer.pc.iceGatheringState === 'complete') {
            peer.pc.removeEventListener('icegatheringstatechange', check);
            resolve();
          }
        };
        peer.pc.addEventListener('icegatheringstatechange', check);
        setTimeout(resolve, 1500); // safety fallback timeout
      }
    });

    return JSON.stringify({
      peerId: offerPeerId,
      source: localId,
      sdp: peer.pc.localDescription
    });
  };

  const acceptManualOffer = async (offerJson: string): Promise<string> => {
    const data = JSON.parse(offerJson);
    const peer = new MeshPeer(false, localId, () => {});
    const remoteId = data.source || data.peerId;
    attachPeerListeners(peer, remoteId);
    peersRef.current[remoteId] = peer;
    setPeers({ ...peersRef.current });

    await peer.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);

    await new Promise<void>((resolve) => {
      if (peer.pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const check = () => {
          if (peer.pc.iceGatheringState === 'complete') {
            peer.pc.removeEventListener('icegatheringstatechange', check);
            resolve();
          }
        };
        peer.pc.addEventListener('icegatheringstatechange', check);
        setTimeout(resolve, 1500);
      }
    });

    return JSON.stringify({
      peerId: remoteId,
      source: localId,
      sdp: peer.pc.localDescription
    });
  };

  const finalizeManualAnswer = async (peerId: string, answerJson: string): Promise<void> => {
    const data = JSON.parse(answerJson);
    const peer = peersRef.current[peerId] || Object.values(peersRef.current)[0];
    if (peer && data.sdp) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      setPeers({ ...peersRef.current });
    }
  };

  // Web Bluetooth LE Peripheral Scanner (navigator.bluetooth)
  const scanBluetoothPeers = async (): Promise<string | null> => {
    if (!('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth is not supported on this browser or platform.');
    }
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'device_information']
      });
      return `${device.name || 'Bluetooth Device'} (${device.id})`;
    } catch (err: any) {
      if (err.name === 'NotFoundError') return null; // user cancelled
      throw err;
    }
  };

  return (
    <MeshContext.Provider value={{
      peers,
      connectedCount: Object.keys(peers).length,
      offlinePhotos,
      localId,
      refreshPhotos,
      broadcastHash,
      createManualOffer,
      acceptManualOffer,
      finalizeManualAnswer,
      scanBluetoothPeers,
      isMeshModalOpen,
      setIsMeshModalOpen
    }}>
      {children}
    </MeshContext.Provider>
  );
};
