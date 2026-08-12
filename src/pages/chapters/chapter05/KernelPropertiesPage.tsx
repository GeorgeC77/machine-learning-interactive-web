import { useState, useMemo } from 'react';
import { ShieldAlert, CheckCircle2, Sigma, Boxes , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function KernelPropertiesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第五章 · 核方法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">核函数的性质</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          并非任意函数都可以成为核函数。有效的核函数必须对应某个特征映射后的内积，
          并且满足一些封闭性质，这让我们能够从简单核函数构造出复杂核函数。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Valid kernels */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Boxes className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">什么是有效核函数？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          一个函数 <KaTeX math={String.raw`K: \mathcal{X} \times \mathcal{X} \to \mathbb{R}`} /> 是有效核函数，
          当且仅当存在一个特征映射 <KaTeX math={String.raw`\phi`} />，使得：
        </p>

        <FormulaCard
          title="有效核函数：定义与判据"
          formula={
            <KaTeX
              math={String.raw`K(x, z) = \phi(x)^T \phi(z)`}
              display
            />
          }
          description="等价地，对任意有限样本集，核矩阵（Gram matrix）都是半正定的。"
        />

        <p className="text-gray-700 mb-4">
          对所有有限样本集，核矩阵（Gram matrix）都半正定，是“该函数能写成某个特征空间内积”的有限样本判据；
          Mercer 定理则在更强的连续性、对称性条件下给出经典的无限维结论。直观上，
          有效核函数计算的是某个特征空间中的合法内积，而不是任意的“相似度”。
        </p>
      </section>

      {/* Closure properties */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sigma className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">核函数的封闭性质</h2>
        </div>
        <p className="text-gray-700 mb-4">
          如果 <KaTeX math={String.raw`K_1`} /> 和 <KaTeX math={String.raw`K_2`} /> 都是有效核函数，那么以下方式构造的也是有效核函数：
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">线性组合</h3>
            <KaTeX math={String.raw`K(x, z) = \alpha K_1(x, z) + \beta K_2(x, z), \quad \alpha, \beta \ge 0`} display />
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">乘积</h3>
            <KaTeX math={String.raw`K(x, z) = K_1(x, z) \cdot K_2(x, z)`} display />
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">缩放</h3>
            <KaTeX math={String.raw`K(x, z) = f(x) \, K_1(x, z) \, f(z)`} display />
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">多项式构造</h3>
            <KaTeX math={String.raw`K(x, z) = p\bigl(K_1(x, z)\bigr)`} display />
            <p className="text-xs text-gray-600 mt-1">其中 p 是系数非负的多项式</p>
          </div>
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h3 className="font-semibold text-rose-800 mb-2">指数构造</h3>
            <KaTeX math={String.raw`K(x, z) = \exp\bigl(K_1(x, z)\bigr)`} display />
            <p className="text-xs text-gray-600 mt-1">由泰勒展开与上述性质推出，是构造高斯核的标准工具</p>
          </div>
        </div>
      </section>

      {/* Common kernels */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">常见核函数</h2>
        <div className="space-y-4">
          <FormulaCard
            title="线性核"
            formula={<KaTeX math={String.raw`K(x, z) = x^T z`} display />}
            description="对应原始输入空间中的内积，等价于不做特征映射。"
          />
          <FormulaCard
            title="多项式核"
            formula={<KaTeX math={String.raw`K(x, z) = (x^T z + c)^d`} display />}
            description="对应 d 次多项式特征映射，c 控制低次项的权重；通常要求 c ≥ 0 才能保证核矩阵半正定。"
          />
          <FormulaCard
            title="高斯核 / RBF 核"
            formula={<KaTeX math={String.raw`K(x, z) = \exp\!\left(-\frac{\|x - z\|^2}{2\sigma^2}\right)`} display />}
            description="σ 控制局部影响范围，对应无限维特征映射。"
          />
        </div>
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：RBF 核的宽度参数</h2>
        <p className="text-gray-700 mb-4">
          高斯核中的 <KaTeX math={String.raw`\sigma`} /> 决定了相似度衰减的速度。
          <KaTeX math={String.raw`\sigma`} /> 越小，核函数越“尖锐”，只把非常近的样本视为相似。
        </p>
        <RBFKernelDemo />
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
            <span>有效核函数必须对应某个特征映射后的内积；对所有有限样本 Gram 矩阵半正定是有限样本判据。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>核函数对非负线性组合、乘积、缩放等操作封闭。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>线性核、多项式核、RBF 核是最常用的三种核函数。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function RBFKernelDemo() {
  const [sigma, setSigma] = useState(0.5);

  const width = 560;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 45, left: 55 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xMin = -3;
  const xMax = 3;
  const center = 0;

  const steps = 200;
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = Math.exp(-Math.pow(x - center, 2) / (2 * sigma * sigma));
      pts.push({ x, y });
    }
    return pts;
  }, [center, sigma, steps, xMax, xMin]);

  const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => padding.top + innerH - y * innerH;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          带宽 σ = <span className="font-mono">{sigma.toFixed(2)}</span>
        </label>
        <input
          type="range"
          aria-label="RBF 核宽度 sigma"
          min={0.1}
          max={2}
          step={0.1}
          value={sigma}
          onChange={(e) => setSigma(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={`h-${t}`}
            x1={padding.left}
            y1={yScale(t)}
            x2={padding.left + innerW}
            y2={yScale(t)}
            stroke="#e5e7eb"
            strokeDasharray="3,3"
          />
        ))}
        {[xMin, -1.5, 0, 1.5, xMax].map((x) => (
          <line
            key={`v-${x}`}
            x1={xScale(x)}
            y1={padding.top}
            x2={xScale(x)}
            y2={padding.top + innerH}
            stroke="#e5e7eb"
            strokeDasharray="3,3"
          />
        ))}
        {/* axes */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        {/* x ticks */}
        {[xMin, -1.5, 0, 1.5, xMax].map((x) => (
          <g key={x}>
            <line x1={xScale(x)} y1={padding.top + innerH} x2={xScale(x)} y2={padding.top + innerH + 5} stroke="#6b7280" />
            <text x={xScale(x)} y={padding.top + innerH + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x.toFixed(1)}</text>
          </g>
        ))}
        {/* y ticks */}
        {[0, 0.5, 1].map((y) => (
          <g key={y}>
            <line x1={padding.left - 5} y1={yScale(y)} x2={padding.left} y2={yScale(y)} stroke="#6b7280" />
            <text x={padding.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y.toFixed(1)}</text>
          </g>
        ))}
        <text x={padding.left + innerW / 2} y={height - 8} textAnchor="middle" fontSize={12} fill="#374151">x - z</text>
        <text x={18} y={padding.top + innerH / 2} textAnchor="middle" fontSize={12} fill="#374151" transform={`rotate(-90, 18, ${padding.top + innerH / 2})`}>K(x, z)</text>
        {/* curve */}
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {/* center marker */}
        <line x1={xScale(center)} y1={padding.top} x2={xScale(center)} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="6,4" />
      </svg>

      <div className="mt-3 text-sm text-gray-600">
        当 x 与 z（中心点）的距离为 0 时，K(x, z) = 1；距离越远，相似度按高斯函数衰减。
      </div>
    </div>
  );
}
