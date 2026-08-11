import { useState, type ReactNode } from 'react';
import { ShieldAlert, Sigma, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

function fConvex(x: number): number {
  return 0.15 * x * x;
}

function fConcave(x: number): number {
  return -0.15 * x * x + 3;
}

export default function JensenInequalityPage() {
  const [a, setA] = useState(-3);
  const [b, setB] = useState(3);
  const [p, setP] = useState(0.5);
  const [mode, setMode] = useState<'convex' | 'concave'>('convex');

  const f = mode === 'convex' ? fConvex : fConcave;
  const ex = p * a + (1 - p) * b;
  const efx = p * f(a) + (1 - p) * f(b);
  const fex = f(ex);
  const jensenGap = mode === 'convex' ? efx - fex : fex - efx;

  const WIDTH = 600;
  const HEIGHT = 400;
  const PADDING = { top: 30, right: 40, bottom: 50, left: 60 };
  const X_MIN = -5;
  const X_MAX = 5;
  const Y_MIN = -1;
  const Y_MAX = 4;

  function sx(x: number): number {
    return PADDING.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (WIDTH - PADDING.left - PADDING.right);
  }
  function sy(y: number): number {
    return HEIGHT - PADDING.bottom - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (HEIGHT - PADDING.top - PADDING.bottom);
  }

  const curvePath = Array.from({ length: 200 }, (_, i) => {
    const x = X_MIN + (i / 199) * (X_MAX - X_MIN);
    return `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(f(x))}`;
  }).join(' ');

  const chordPath = `M ${sx(a)} ${sy(f(a))} L ${sx(b)} ${sy(f(b))}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十一章 · EM 算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Jensen 不等式</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Jensen 不等式是 EM 构造证据下界并证明似然单调性的核心工具。它描述凸函数或凹函数在期望值处的不等关系。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sigma className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">定理</h2>
        </div>
        <FormulaCard
          title="Jensen 不等式"
          formula={
            <KaTeX
              math={String.raw`\text{若 } f \text{ 是凸函数，则 } \mathbb{E}[f(X)] \ge f(\mathbb{E}[X])`}
              display
            />
          }
          description="当相关期望存在且 X 的取值位于 f 的定义域内时成立。若 f 在该区间严格凸，等号当且仅当 X 几乎处处为常数；凹函数的不等号方向相反。"
        />

        <p className="text-gray-700 mt-4">
          在 EM 算法中，我们利用对数函数是凹函数这一性质，通过 Jensen 不等式构造观测似然的下界（ELBO），
          然后交替优化这个下界。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示</h2>
        <p className="text-gray-700 mb-4">
          调整两个取值 a、b 及其概率 p，观察 E[f(X)] 与 f(E[X]) 的关系。
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <ControlRow label={`取值 a: ${a.toFixed(1)}`}>
            <Slider aria-label="随机变量取值 a" value={[a]} min={-4.5} max={4.5} step={0.1} onValueChange={(v) => setA(v[0])} />
          </ControlRow>
          <ControlRow label={`取值 b: ${b.toFixed(1)}`}>
            <Slider aria-label="随机变量取值 b" value={[b]} min={-4.5} max={4.5} step={0.1} onValueChange={(v) => setB(v[0])} />
          </ControlRow>
          <ControlRow label={`P(X=a): ${p.toFixed(2)}`}>
            <Slider aria-label="随机变量取值 a 的概率" value={[p]} min={0} max={1} step={0.01} onValueChange={(v) => setP(v[0])} />
          </ControlRow>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('convex')}
            aria-pressed={mode === 'convex'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'convex' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            凸函数 f(x)=0.15x²
          </button>
          <button
            type="button"
            onClick={() => setMode('concave')}
            aria-pressed={mode === 'concave'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'concave' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            凹函数 f(x)=-0.15x²+3
          </button>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[360px]"
            style={{ maxHeight: 400 }}
            role="img"
            aria-labelledby="jensen-chart-title jensen-chart-desc"
          >
            <title id="jensen-chart-title">Jensen 不等式的两点分布示意图</title>
            <desc id="jensen-chart-desc">展示 {mode === 'convex' ? '凸' : '凹'}函数、端点弦、期望函数值与函数在期望处的值。</desc>
            <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} fill="#f9fafb" />
            {[-4, -2, 0, 2, 4].map((x) => (
              <line key={`vx-${x}`} x1={sx(x)} y1={PADDING.top} x2={sx(x)} y2={HEIGHT - PADDING.bottom} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {[0, 1, 2, 3].map((y) => (
              <line key={`hy-${y}`} x1={PADDING.left} y1={sy(y)} x2={WIDTH - PADDING.right} y2={sy(y)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            <line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
            <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
            {[-4, -2, 0, 2, 4].map((x) => (
              <text key={`lx-${x}`} x={sx(x)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">{x}</text>
            ))}
            {[0, 1, 2, 3].map((y) => (
              <text key={`ly-${y}`} x={PADDING.left - 10} y={sy(y) + 4} textAnchor="end" fontSize={12} fill="#4b5563">{y}</text>
            ))}
            <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" fontSize={13} fill="#374151">x</text>
            <text x={20} y={HEIGHT / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${HEIGHT / 2})`}>f(x)</text>

            {/* 函数曲线 */}
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2} />

            {/* 弦 */}
            <path d={chordPath} fill="none" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 4" />

            {/* a 和 b 处 */}
            <circle cx={sx(a)} cy={sy(f(a))} r={5} fill="#ef4444" />
            <circle cx={sx(b)} cy={sy(f(b))} r={5} fill="#ef4444" />

            {/* E[X] 和对应的弦上的点 */}
            <line x1={sx(ex)} y1={PADDING.top} x2={sx(ex)} y2={HEIGHT - PADDING.bottom} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={sx(ex)} cy={sy(efx)} r={5} fill="#f59e0b" />
            <circle cx={sx(ex)} cy={sy(fex)} r={5} fill="#10b981" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> f(a), f(b)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> E[f(X)]</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> f(E[X])</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> f(x)</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-400" /> 弦</span>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1" aria-live="polite">
          <div className="flex justify-between">
            <span className="text-gray-600">E[X] =</span>
            <span className="font-mono font-medium text-gray-700">{ex.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">E[f(X)] =</span>
            <span className="font-mono font-medium text-amber-700">{efx.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">f(E[X]) =</span>
            <span className="font-mono font-medium text-emerald-700">{fex.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jensen 间隙（应 ≥ 0）=</span>
            <span className="font-mono font-medium text-blue-700">{jensenGap.toFixed(6)}</span>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>凸函数满足 E[f(X)] ≥ f(E[X])，凹函数满足 E[f(X)] ≤ f(E[X])。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>对数函数是凹函数，这是 EM 算法构造下界的关键。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>EM 通过 Jensen 不等式得到观测似然的下界 ELBO。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
