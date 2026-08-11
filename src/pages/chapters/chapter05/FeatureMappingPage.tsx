import { useState, useMemo } from 'react';
import type { MouseEvent, Dispatch, SetStateAction } from 'react';
import { ShieldAlert, Map, CheckCircle2, Lightbulb , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

const SAMPLE_DATA = [
  { x: 0.2, y: 0.2, label: 1 },
  { x: 0.3, y: 0.7, label: -1 },
  { x: 0.7, y: 0.3, label: -1 },
  { x: 0.8, y: 0.8, label: 1 },
  { x: 0.5, y: 0.5, label: 1 },
  { x: 0.15, y: 0.85, label: -1 },
  { x: 0.85, y: 0.15, label: -1 },
];

export default function FeatureMappingPage() {
  const [points, setPoints] = useState(SAMPLE_DATA);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Compute quadratic features for each point: [x^2, y^2, sqrt(2)*xy]
  const mappedPoints = useMemo(() => {
    return points.map((p) => ({
      ...p,
      f1: p.x * p.x,
      f2: p.y * p.y,
      f3: Math.SQRT2 * p.x * p.y,
    }));
  }, [points]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第五章 · 核方法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">特征映射</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          当数据在原始空间中线性不可分时，可以通过特征映射将其变换到更高维的空间，
          从而在新空间中用线性方法解决问题。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Motivation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么需要特征映射？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          有些问题在原始输入空间中无法用直线（或超平面）分开。例如下图中的 XOR-like 数据：
          同一标签的点位于对角位置，任何直线都无法将它们分开。
        </p>
        <p className="text-gray-700 mb-4">
          但如果我们把每个点 <KaTeX math={String.raw`x = (x_1, x_2)`} /> 映射到更高维的空间，例如：
        </p>

        <FormulaCard
          title="二次特征映射"
          formula={
            <KaTeX
              math={String.raw`\phi(x) = \begin{bmatrix} x_1^2 \\ x_2^2 \\ \sqrt{2}\, x_1 x_2 \end{bmatrix}`}
              display
            />
          }
          description="通过引入平方项和交叉项，原本线性不可分的数据可能在新空间中变得线性可分。注意：本章的 φ(x) 表示特征映射，与第四章 GDA 中表示类别先验的 φ 无关。"
        />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：从二维到三维</h2>
        <p className="text-gray-700 mb-4">
          左图是原始二维空间，右图是经过二次特征映射后的三维空间。
          点击左图中的点可高亮显示；点击左图空白处可添加新点。
        </p>
        <FeatureMappingDemo
          points={points}
          mappedPoints={mappedPoints}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          setPoints={setPoints}
        />
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>标签 +1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span>标签 -1</span>
          </div>
        </div>
      </section>

      {/* Common mappings */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Map className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">常见的特征映射</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">多项式映射</h3>
            <p className="text-sm text-gray-700 mb-2">
              把原始特征的所有二次项、三次项加入特征向量。
            </p>
            <KaTeX math={String.raw`\phi(x) = [1, x_1, x_2, x_1^2, x_1 x_2, x_2^2]`} display />
            <p className="text-xs text-gray-500 mt-2">
              系数可按核函数约定缩放（例如本章演示使用 [x₁², x₂², √2 x₁x₂]，恰对应 K(x,z) = (xᵀz)²）。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">高斯/RBF 映射</h3>
            <p className="text-sm text-gray-700 mb-2">
              隐式映射到无限维空间，后面会详细讲解。
            </p>
            <KaTeX math={String.raw`K(x, z) = \exp\!\left(-\frac{\|x - z\|^2}{2\sigma^2}\right)`} display />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>特征映射把原始输入变换到更高维的特征空间。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>在特征空间中，原本线性不可分的数据可能变得线性可分。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>多项式映射是最直观的例子，RBF 映射则更为强大。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

interface Point {
  x: number;
  y: number;
  label: number;
  f1: number;
  f2: number;
  f3: number;
}

function FeatureMappingDemo({
  points,
  mappedPoints,
  selectedPoint,
  setSelectedPoint,
  setPoints,
}: {
  points: { x: number; y: number; label: number }[];
  mappedPoints: Point[];
  selectedPoint: number | null;
  setSelectedPoint: (idx: number | null) => void;
  setPoints: Dispatch<SetStateAction<{ x: number; y: number; label: number }[]>>;
}) {
  const width = 520;
  const height = 320;
  const padding = 40;
  const plotSize = Math.min(width, height) - 2 * padding;
  const plotLeft = (width - plotSize) / 2;
  const plotTop = (height - plotSize) / 2;
  const [addLabel, setAddLabel] = useState(1);

  const xScale = (x: number) => plotLeft + x * plotSize;
  const yScale = (y: number) => plotTop + (1 - y) * plotSize;

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // 先把 CSS 像素坐标换算到 viewBox 坐标系，再换算到数据坐标
    const sx = (e.clientX - rect.left) * (width / rect.width);
    const sy = (e.clientY - rect.top) * (height / rect.height);
    const x = (sx - plotLeft) / plotSize;
    const y = 1 - (sy - plotTop) / plotSize;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      setPoints((prev) => [...prev, { x, y, label: addLabel }]);
    }
  };

  // 3D projection: simple isometric-ish projection
  const project3D = (p: Point) => {
    const cx = width / 2;
    const cy = height / 2 + 20;
    const scale = 180;
    // axes: f1 right-down, f2 left-down, f3 up
    const px = cx + scale * (p.f1 * 0.8 - p.f2 * 0.6);
    const py = cy - scale * (p.f3 * 0.9 - p.f1 * 0.25 - p.f2 * 0.25);
    return { x: px, y: py };
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="md:col-span-2 flex justify-center gap-3">
        <button
          onClick={() => setAddLabel(1)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            addLabel === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          添加 +1 点
        </button>
        <button
          onClick={() => setAddLabel(-1)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            addLabel === -1 ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          添加 -1 点
        </button>
        <button
          onClick={() => {
            setPoints(SAMPLE_DATA);
            setSelectedPoint(null);
          }}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          重置
        </button>
      </div>

      {/* Original 2D space */}
      <div>
        <h3 className="text-center text-sm font-semibold text-gray-700 mb-2">原始二维空间</h3>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto bg-white rounded-lg border border-gray-200"
          role="group"
          aria-label="原始二维特征空间；点击绘图区可添加点，已有点可用鼠标或键盘选择"
          onClick={handleSvgClick}
        >
          <title>原始二维特征空间</title>
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={xScale(0)} y1={yScale(t)} x2={xScale(1)} y2={yScale(t)} stroke="#e5e7eb" />
              <line x1={xScale(t)} y1={yScale(0)} x2={xScale(t)} y2={yScale(1)} stroke="#e5e7eb" />
            </g>
          ))}
          {/* axes */}
          <line x1={xScale(0)} y1={yScale(0)} x2={xScale(1)} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
          <line x1={xScale(0)} y1={yScale(0)} x2={xScale(0)} y2={yScale(1)} stroke="#6b7280" strokeWidth={1.5} />
          <text x={width / 2} y={height - 10} textAnchor="middle" fontSize={11} fill="#4b5563">x₁</text>
          <text x={plotLeft - 20} y={height / 2} textAnchor="middle" fontSize={11} fill="#4b5563">x₂</text>
          {/* points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={xScale(p.x)}
              cy={yScale(p.y)}
              r={selectedPoint === i ? 8 : 6}
              fill={p.label === 1 ? '#10b981' : '#f43f5e'}
              stroke={selectedPoint === i ? '#1f2937' : 'white'}
              strokeWidth={selectedPoint === i ? 3 : 2}
              className="cursor-pointer transition-all"
              role="button"
              tabIndex={0}
              aria-label={`选择第 ${i + 1} 个点：x1 ${p.x.toFixed(2)}，x2 ${p.y.toFixed(2)}，标签 ${p.label > 0 ? '正一' : '负一'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoint(selectedPoint === i ? null : i);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPoint(selectedPoint === i ? null : i);
                }
              }}
            />
          ))}
        </svg>
      </div>

      {/* Mapped 3D space */}
      <div>
        <h3 className="text-center text-sm font-semibold text-gray-700 mb-2">映射后的三维空间 φ(x)</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" role="group" aria-label="映射后的三维特征空间">
          <title>映射后的三维特征空间</title>
          {/* draw axes */}
          <line x1={width / 2 - 80} y1={height / 2 + 100} x2={width / 2 + 100} y2={height / 2 + 20} stroke="#9ca3af" strokeWidth={1.5} />
          <line x1={width / 2 - 80} y1={height / 2 + 100} x2={width / 2 - 160} y2={height / 2 + 40} stroke="#9ca3af" strokeWidth={1.5} />
          <line x1={width / 2 - 80} y1={height / 2 + 100} x2={width / 2 - 80} y2={height / 2 - 80} stroke="#9ca3af" strokeWidth={1.5} />
          <text x={width / 2 + 110} y={height / 2 + 20} fontSize={11} fill="#4b5563">x₁²</text>
          <text x={width / 2 - 180} y={height / 2 + 40} fontSize={11} fill="#4b5563">x₂²</text>
          <text x={width / 2 - 75} y={height / 2 - 90} fontSize={11} fill="#4b5563">√2·x₁x₂</text>
          {/* points */}
          {mappedPoints.map((p, i) => {
            const proj = project3D(p);
            return (
              <circle
                key={i}
                cx={proj.x}
                cy={proj.y}
                r={selectedPoint === i ? 8 : 6}
                fill={p.label === 1 ? '#10b981' : '#f43f5e'}
                stroke={selectedPoint === i ? '#1f2937' : 'white'}
                strokeWidth={selectedPoint === i ? 3 : 2}
                className="cursor-pointer transition-all"
                role="button"
                tabIndex={0}
                aria-label={`选择映射后的第 ${i + 1} 个点`}
                onClick={() => setSelectedPoint(selectedPoint === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPoint(selectedPoint === i ? null : i);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>

      {selectedPoint !== null && selectedPoint < points.length && (
        <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200 text-sm">
          <p className="font-medium text-gray-900 mb-1">选中的点</p>
          <p className="text-gray-700">
            原始坐标：x₁ = {points[selectedPoint].x.toFixed(2)}, x₂ = {points[selectedPoint].y.toFixed(2)}, 标签 = {points[selectedPoint].label > 0 ? '+1' : '-1'}
          </p>
          <p className="text-gray-700">
            映射后：φ(x) = ({mappedPoints[selectedPoint].f1.toFixed(3)}, {mappedPoints[selectedPoint].f2.toFixed(3)}, {mappedPoints[selectedPoint].f3.toFixed(3)})
          </p>
        </div>
      )}
    </div>
  );
}
