import { useState, useMemo } from 'react';
import { ShieldAlert, Ruler, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

const POINTS = [
  // label +1 in the upper-right region
  { x: 3.5, y: 3.2, label: 1 },
  { x: 4.0, y: 2.8, label: 1 },
  { x: 4.5, y: 3.5, label: 1 },
  { x: 5.0, y: 2.5, label: 1 },
  { x: 3.8, y: 4.0, label: 1 },
  // label -1 in the lower-left region
  { x: 1.0, y: 1.0, label: -1 },
  { x: 1.5, y: 0.6, label: -1 },
  { x: 2.0, y: 1.2, label: -1 },
  { x: 0.8, y: 1.8, label: -1 },
  { x: 2.3, y: 0.5, label: -1 },
];

export default function MarginIntuitionPage() {
  const [w1, setW1] = useState(1.0);
  const [w2, setW2] = useState(1.0);
  const [b, setB] = useState(-4.0);

  // Signed geometric margin for point (x, y)
  const signedValue = (x: number, y: number) =>
    (w1 * x + w2 * y + b) / Math.sqrt(w1 * w1 + w2 * w2);

  const { minMargin, supportVectors } = useMemo(() => {
    let min = Infinity;
    const sv: number[] = [];
    POINTS.forEach((p, i) => {
      const d = p.label * signedValue(p.x, p.y);
      if (d < min) {
        min = d;
        sv.length = 0;
        sv.push(i);
      } else if (Math.abs(d - min) < 1e-6) {
        sv.push(i);
      }
    });
    return { minMargin: min, supportVectors: sv };
  }, [w1, w2, b]);

  // Check if all points are correctly classified
  const allCorrect = POINTS.every((p) => p.label * signedValue(p.x, p.y) > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第六章 · 支持向量机
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">间隔的直观理解</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          支持向量机（SVM）的核心思想是：不仅要正确分类训练样本，还要让决策边界与最近的样本保持最大间隔。
          间隔越大，模型的泛化能力通常越好。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Functional vs geometric margin */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Ruler className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">函数间隔与几何间隔</h2>
        </div>
        <p className="text-gray-700 mb-4">
          对于分类器 <KaTeX math={String.raw`h_{w,b}(x) = w^T x + b`} />，样本 <KaTeX math={String.raw`(x^{(i)}, y^{(i)})`} /> 的函数间隔定义为：
        </p>

        <FormulaCard
          title="函数间隔"
          formula={
            <KaTeX
              math={String.raw`\hat{\gamma}^{(i)} = y^{(i)} (w^T x^{(i)} + b)`}
              display
            />
          }
          description="函数间隔会随 w 的缩放而变化，因此不能很好地衡量真实距离。"
        />

        <p className="text-gray-700 mb-4">
          几何间隔是样本到决策边界的实际距离，对 w 的缩放不变：
        </p>

        <FormulaCard
          title="几何间隔"
          formula={
            <KaTeX
              math={String.raw`\gamma^{(i)} = y^{(i)} \left( \frac{w^T x^{(i)} + b}{\|w\|} \right)`}
              display
            />
          }
          description="分母 ||w|| 对 w 进行了归一化，使间隔具有几何意义。"
        />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：调整决策边界</h2>
        <p className="text-gray-700 mb-4">
          拖动滑块调整决策边界 <KaTeX math={String.raw`w_1 x_1 + w_2 x_2 + b = 0`} />。
          观察几何间隔如何变化，以及哪些点成为了支持向量。
        </p>

        <SVMDemo
          w1={w1}
          w2={w2}
          b={b}
          setW1={setW1}
          setW2={setW2}
          setB={setB}
          minMargin={minMargin}
          supportVectors={supportVectors}
          allCorrect={allCorrect}
        />
      </section>

      {/* Max margin classifier */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">最大间隔分类器</h2>
        <p className="text-gray-700 mb-4">
          SVM 的目标是找到一个决策边界，使得所有训练样本的几何间隔中最小的那个尽可能大：
        </p>

        <FormulaCard
          title="优化目标"
          formula={
            <KaTeX
              math={String.raw`\max_{\gamma, w, b} \; \gamma \quad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge \gamma, \; \|w\| = 1`}
              display
            />
          }
          description="这里 γ 是几何间隔。该问题等价于在约束条件下最小化 ||w||²，是一个凸二次规划问题。"
        />

        <div className={`mt-4 rounded-lg p-4 border ${allCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <p className={`text-sm font-medium ${allCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
            {allCorrect
              ? '当前决策边界能正确分类所有样本。尝试继续调整，使最小几何间隔最大化。'
              : '当前决策边界存在误分类样本（几何间隔为负）。SVM 要求找到完全正确分类且间隔最大的边界。'}
          </p>
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
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>函数间隔随参数缩放变化，几何间隔才是真实的距离。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>SVM 的目标是最大化最小几何间隔。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>只有距离边界最近的点（支持向量）决定最终的决策边界。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function SVMDemo({
  w1,
  w2,
  b,
  setW1,
  setW2,
  setB,
  minMargin,
  supportVectors,
  allCorrect,
}: {
  w1: number;
  w2: number;
  b: number;
  setW1: (v: number) => void;
  setW2: (v: number) => void;
  setB: (v: number) => void;
  minMargin: number;
  supportVectors: number[];
  allCorrect: boolean;
}) {
  const width = 560;
  const height = 400;
  const padding = 40;
  const xMin = 0;
  const xMax = 6;
  const yMin = 0;
  const yMax = 4;

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const norm = Math.sqrt(w1 * w1 + w2 * w2);
  const signedValue = (x: number, y: number) => (w1 * x + w2 * y + b) / norm;

  // Decision boundary: w1*x + w2*y + b = 0  =>  y = -(w1*x + b) / w2
  const decisionPoints: { x: number; y: number }[] = [];
  if (Math.abs(w2) > 1e-6) {
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = -(w1 * x + b) / w2;
      if (y >= yMin && y <= yMax) decisionPoints.push({ x, y });
    }
  }

  // Margin boundaries: distance = minMargin
  const marginOffset = minMargin * norm;
  const marginPos: { x: number; y: number }[] = [];
  const marginNeg: { x: number; y: number }[] = [];
  if (Math.abs(w2) > 1e-6) {
    for (let x = xMin; x <= xMax; x += 0.1) {
      const yPos = -(w1 * x + b - marginOffset) / w2;
      const yNeg = -(w1 * x + b + marginOffset) / w2;
      if (yPos >= yMin && yPos <= yMax) marginPos.push({ x, y: yPos });
      if (yNeg >= yMin && yNeg <= yMax) marginNeg.push({ x, y: yNeg });
    }
  }

  const pathD = decisionPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const pathPos = marginPos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const pathNeg = marginNeg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            w₁ = <span className="font-mono">{w1.toFixed(2)}</span>
          </label>
          <input type="range" min={-3} max={3} step={0.1} value={w1} onChange={(e) => setW1(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            w₂ = <span className="font-mono">{w2.toFixed(2)}</span>
          </label>
          <input type="range" min={-3} max={3} step={0.1} value={w2} onChange={(e) => setW2(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            b = <span className="font-mono">{b.toFixed(2)}</span>
          </label>
          <input type="range" min={-8} max={2} step={0.1} value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 400 }}>
        {/* grid */}
        {[0, 1, 2, 3, 4, 5, 6].map((x) => (
          <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
        ))}
        {[0, 1, 2, 3, 4].map((y) => (
          <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
        ))}
        {/* axes */}
        <line x1={padding} y1={yScale(yMin)} x2={width - padding} y2={yScale(yMin)} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={padding} y1={yScale(yMin)} x2={padding} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />
        {/* ticks */}
        {[0, 1, 2, 3, 4, 5, 6].map((x) => (
          <g key={`xt-${x}`}>
            <line x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMin) + 5} stroke="#6b7280" />
            <text x={xScale(x)} y={yScale(yMin) + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((y) => (
          <g key={`yt-${y}`}>
            <line x1={padding - 5} y1={yScale(y)} x2={padding} y2={yScale(y)} stroke="#6b7280" />
            <text x={padding - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y}</text>
          </g>
        ))}

        {/* margin boundaries (only shown when all points are correctly classified) */}
        {allCorrect && pathPos && <path d={pathPos} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6,4" />}
        {allCorrect && pathNeg && <path d={pathNeg} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6,4" />}

        {/* decision boundary */}
        {pathD && <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={3} />}

        {/* points */}
        {POINTS.map((p, i) => {
          const isSV = supportVectors.includes(i);
          const isMisclassified = p.label * signedValue(p.x, p.y) <= 0;
          return (
            <g key={i}>
              <circle
                cx={xScale(p.x)}
                cy={yScale(p.y)}
                r={isSV ? 9 : 6}
                fill={p.label === 1 ? '#10b981' : '#f43f5e'}
                stroke={isSV ? '#1f2937' : 'white'}
                strokeWidth={isSV ? 3 : 2}
              />
              {isMisclassified && (
                <g stroke="#7f1d1d" strokeWidth={2}>
                  <line x1={xScale(p.x) - 5} y1={yScale(p.y) - 5} x2={xScale(p.x) + 5} y2={yScale(p.y) + 5} />
                  <line x1={xScale(p.x) + 5} y1={yScale(p.y) - 5} x2={xScale(p.x) - 5} y2={yScale(p.y) + 5} />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">最小几何间隔</p>
          <p className={`text-xl font-mono font-bold ${allCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {minMargin.toFixed(3)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">支持向量数量</p>
          <p className="text-xl font-mono font-bold text-blue-600">{supportVectors.length}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">分类状态</p>
          <p className={`text-sm font-bold ${allCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {allCorrect ? '全部分类正确' : '存在误分类'}
          </p>
        </div>
      </div>
    </div>
  );
}
