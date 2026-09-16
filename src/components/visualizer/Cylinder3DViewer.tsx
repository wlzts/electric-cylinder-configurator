import { useEffect, useRef, useState } from 'react';
import { RotateCw, RotateCcw, Maximize2, Loader2 } from 'lucide-react';

interface ModelViewerElement extends HTMLElement {
  src: string;
  autoRotate: boolean;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  jumpCameraToGoal: () => void;
  resetTurntableRotation: (theta?: number) => void;
}

interface ViewerModel {
  id: string;
  label: string;
  file: string;
}

const MODELS: ViewerModel[] = [
  { id: 'coze40', label: 'COZE40 滚珠丝杠型', file: 'models/electric-cylinder.glb?v=7' },
  { id: 'dmc160', label: 'DMC160 同步带型', file: 'models/dmc160.glb?v=7' },
  { id: 'side200', label: '侧移电缸 行程200', file: 'models/side-cylinder.glb?v=1' },
];

export function Cylinder3DViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<ModelViewerElement | null>(null);
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [autoRotate, setAutoRotate] = useState(true);
  const [ready, setReady] = useState(false);

  // 创建 model-viewer 自定义元素（只创建一次）
  useEffect(() => {
    let el: ModelViewerElement | null = null;
    let cancelled = false;
    const host = hostRef.current;

    void import('@google/model-viewer').then(() => {
      if (cancelled || !host) return;
      el = document.createElement('model-viewer') as unknown as ModelViewerElement;
      el.setAttribute('camera-controls', '');
      el.setAttribute('touch-action', 'pan-y');
      // 放开角度钳制，支持真正 360° 环绕和俯仰
      el.setAttribute('min-camera-orbit', '-Infinity 0deg auto');
      el.setAttribute('max-camera-orbit', 'Infinity 180deg auto');
      el.setAttribute('auto-rotate', '');
      el.setAttribute('auto-rotate-delay', '1000');
      el.setAttribute('rotation-per-second', '24deg');
      // 工作室环境光照，让金属材质有反射质感
      el.setAttribute('environment-image', 'neutral');
      el.setAttribute('environment-intensity', '0.55');
      el.setAttribute('shadow-intensity', '0.9');
      el.setAttribute('shadow-softness', '0.15');
      el.setAttribute('exposure', '1.0');
      el.setAttribute('interaction-prompt', 'auto');
      el.setAttribute('interaction-prompt-style', 'wiggle');
      el.setAttribute('loading', 'lazy');
      el.setAttribute('alt', '电缸三维模型');
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.background = '#f5f5f3';
      el.style.setProperty('--poster-color', 'transparent');
      el.src = import.meta.env.BASE_URL + MODELS[0].file;
      el.addEventListener('load', () => setReady(true));
      host.appendChild(el);
      mvRef.current = el;
    });

    return () => {
      cancelled = true;
      if (el && host?.contains(el)) host.removeChild(el);
      mvRef.current = null;
    };
  }, []);

  // 切换型号
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    setReady(false);
    const target = MODELS.find((m) => m.id === modelId);
    if (target) mv.src = import.meta.env.BASE_URL + target.file;
  }, [modelId]);

  // 自动旋转开关
  useEffect(() => {
    if (mvRef.current) mvRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  const handleReset = () => {
    const mv = mvRef.current;
    if (!mv) return;
    mv.cameraOrbit = '0deg 75deg auto';
    mv.cameraTarget = 'auto auto auto';
    mv.fieldOfView = 'auto';
    mv.resetTurntableRotation(0);
    mv.jumpCameraToGoal();
  };

  const handleFullscreen = () => {
    const mv = mvRef.current;
    if (mv?.requestFullscreen) void mv.requestFullscreen();
  };

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-card border border-line bg-[#e9ecef]">
      {/* model-viewer 挂载点 */}
      <div ref={hostRef} className="absolute inset-0" />

      {/* 加载指示 */}
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      )}

      {/* 型号切换 */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => setModelId(m.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              modelId === m.id
                ? 'bg-accent text-white'
                : 'bg-white/85 text-ink border border-line hover:bg-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 右侧竖向工具栏（仿 3DFindIt） */}
      <div className="absolute top-12 right-2 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setAutoRotate((v) => !v)}
          title={autoRotate ? '暂停自动旋转' : '开启自动旋转'}
          aria-label={autoRotate ? '暂停自动旋转' : '开启自动旋转'}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-colors ${
            autoRotate
              ? 'border-accent bg-accent text-white'
              : 'border-line bg-white text-ink hover:bg-[#f0f5ff]'
          }`}
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          title="重置视角"
          aria-label="重置视角"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-sm transition-colors hover:bg-[#f0f5ff]"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleFullscreen}
          title="全屏查看"
          aria-label="全屏查看"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-sm transition-colors hover:bg-[#f0f5ff]"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* 底部操作提示 */}
      <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-2xs text-muted border border-line whitespace-nowrap">
        左键拖拽旋转 · 滚轮缩放 · 右键平移
      </div>
    </div>
  );
}
