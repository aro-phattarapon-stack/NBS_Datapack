import { useEffect, useRef, useState } from 'react';
import {
  IdleAnimation,
  SkinViewer,
  WalkingAnimation,
  WaveAnimation,
} from 'skinview3d';
import { PlayerBodyRender, isMojangUuid } from '@/components/portal/PlayerAvatar';

export type Skin3DPose = 'idle' | 'walk' | 'wave';

function applyPoseAnimation(viewer: SkinViewer, pose: Skin3DPose) {
  if (pose === 'walk') {
    const anim = new WalkingAnimation();
    anim.speed = 0.75;
    viewer.animation = anim;
  } else if (pose === 'wave') {
    const anim = new WaveAnimation('right');
    anim.speed = 1.0;
    viewer.animation = anim;
  } else {
    const anim = new IdleAnimation();
    anim.speed = 0.9;
    viewer.animation = anim;
  }
}

interface Skin3DViewerProps {
  name: string;
  uuid?: string;
  width: number;
  height: number;
  pose?: Skin3DPose;
  autoRotate?: boolean;
  zoom?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

/**
 * Interactive WebGL 3D Minecraft Skin Viewer powered by skinview3d.
 * Loads skins through our same-origin /api/skin/:id proxy so WebGL textures
 * never hit CORS issues and PNG export stays 100% taint-free.
 */
export function Skin3DViewer({
  name,
  uuid,
  width,
  height,
  pose = 'idle',
  autoRotate = false,
  zoom = 0.88,
  className = '',
  onCanvasReady,
}: Skin3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<SkinViewer | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const identifier = isMojangUuid(uuid) ? uuid! : name;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let viewer: SkinViewer | null = null;
    try {
      viewer = new SkinViewer({
        canvas,
        width,
        height,
        zoom,
        fov: 42,
        preserveDrawingBuffer: true,
        enableControls: true,
        skin: `/api/skin/${encodeURIComponent(identifier)}`,
      });

      viewer.controls.enableZoom = false;
      viewer.controls.enablePan = false;
      viewer.controls.enableDamping = true;
      viewer.globalLight.intensity = 2.6;
      viewer.cameraLight.intensity = 1.4;
      // Heroic 3/4 starting angle
      viewer.playerObject.rotation.y = 0.38;
      applyPoseAnimation(viewer, pose);
      viewer.autoRotate = autoRotate;
      viewer.autoRotateSpeed = 0.65;

      viewerRef.current = viewer;
      onCanvasReady?.(canvas);
    } catch {
      setWebglFailed(true);
      onCanvasReady?.(null);
    }

    return () => {
      onCanvasReady?.(null);
      if (viewer) {
        viewer.dispose();
      }
      viewerRef.current = null;
    };
  }, [identifier, width, height, zoom]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    applyPoseAnimation(viewer, pose);
  }, [pose]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.autoRotate = autoRotate;
    viewer.autoRotateSpeed = 0.65;
  }, [autoRotate]);

  if (webglFailed) {
    return <PlayerBodyRender name={name} uuid={uuid} variant="portrait" className={className} />;
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        aria-label={`โมเดลสกิน 3D ของ ${name} (ลากเพื่อหมุน 360 องศา)`}
        className="block cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
