import { useState, useMemo } from 'react';
import { ShieldAlert, Calculator, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function GaussianDiscriminantAnalysisPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第四章 · 生成学习算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">高斯判别分析</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          高斯判别分析（GDA）假设每个类别的数据都服从多元高斯分布。通过估计每类的均值和协方差，
          我们可以推导出分类的决策边界。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Assumptions */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">GDA 的假设</h2>
        </div>
        <p className="text-gray-700 mb-4">
          对于二分类问题，GDA 假设两类数据分别服从均值不同、但协方差相同的高斯分布：
        </p>

        <FormulaCard
          title="类别条件分布"
          formula={
            <KaTeX
              math={String.raw`x \mid y = i \sim \mathcal{N}(\mu_i, \Sigma), \quad i = 0, 1`}
              display
            />
          }
          description="两类共享同一个协方差矩阵 Σ，但均值向量 μ 不同。"
        />

        <p className="text-gray-700 mb-4">
          同时假设类别的先验概率为 φ = P(y = 1)。根据贝叶斯定理，可以计算后验概率：
        </p>

        <FormulaCard
          title="后验概率"
          formula={
            <KaTeX
              math={String.raw`p(y = 1 \mid x) = \frac{p(x \mid y = 1) \, \phi}{p(x \mid y = 0) \, (1 - \phi) + p(x \mid y = 1) \, \phi}`}
              display
            />
          }
          description="分母 p(x) 是两类的全概率。"
        />
      </section>

      {/* Decision boundary */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">决策边界</h2>
        <p className="text-gray-700 mb-4">
          当两类协方差矩阵相同时，GDA 的决策边界是一条直线（在高维空间中是超平面）。
          这是因为比较 <KaTeX math={String.raw`\log p(y=1 \mid x)`} /> 和 <KaTeX math={String.raw`\log p(y=0 \mid x)`} /> 时，二次项会相互抵消。
        </p>

        <FormulaCard
          title="线性决策边界"
          formula={
            <KaTeX
              math={String.raw`\log\frac{p(y=1 \mid x)}{p(y=0 \mid x)} = \theta^T x + b = 0`}
              display
            />
          }
          description="其中 θ 与 μ₁ − μ₀ 有关。当数据近似满足 GDA 的高斯+共享协方差假设时，GDA 与逻辑回归学出的决策边界通常相近；但参数估计路径不同——GDA 先估计 φ、μ、Σ 再组合出后验，逻辑回归则直接拟合 Sigmoid。"
        />

        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mt-4">
          <h3 className="font-semibold text-emerald-800 mb-2">与逻辑回归的联系</h3>
          <p className="text-sm text-gray-700">
            当 GDA 的高斯假设成立时，由 GDA 导出的 p(y=1|x) 恰好具有逻辑回归的形式——Sigmoid 的输入是 x 的线性函数。
            当高斯生成假设不成立时，逻辑回归通常对 p(x|y) 的分布错设更不敏感；但当 GDA 假设近似成立时，GDA 可能有更高的数据效率。
          </p>
        </div>
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：一维 GDA 决策边界</h2>
        <p className="text-gray-700 mb-4">
          拖动滑块调整两类高斯分布的均值、方差和类别先验 φ，观察决策边界（灰色虚线）如何变化。
          决策边界是两类后验概率相等的位置；等价地，它满足 <KaTeX math={String.raw`p(x \mid y=1)\phi = p(x \mid y=0)(1-\phi)`} />。
          只有当两类先验相等时，才退化为两类概率密度相等的位置。
        </p>
        <GDA1DDemo />
      </section>

      {/* Parameter estimation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">参数估计</h2>
        <p className="text-gray-700 mb-4">
          给定训练数据，GDA 的参数可以通过最大似然估计得到：
        </p>

        <FormulaCard
          title="均值估计"
          formula={
            <KaTeX
              math={String.raw`\mu_i = \frac{\sum_{j=1}^{m} \mathbf{1}\{y^{(j)} = i\} \, x^{(j)}}{\sum_{j=1}^{m} \mathbf{1}\{y^{(j)} = i\}}`}
              display
            />
          }
          description="第 i 类样本的均值。"
        />

        <FormulaCard
          title="协方差估计"
          formula={
            <KaTeX
              math={String.raw`\Sigma = \frac{1}{m} \sum_{j=1}^{m} \bigl(x^{(j)} - \mu_{y^{(j)}}\bigr) \bigl(x^{(j)} - \mu_{y^{(j)}}\bigr)^T`}
              display
            />
          }
          description="所有样本到各自类别均值的协方差。"
        />

        <FormulaCard
          title="先验估计"
          formula={
            <KaTeX
              math={String.raw`\phi = \frac{1}{m} \sum_{j=1}^{m} \mathbf{1}\{y^{(j)} = 1\}`}
              display
            />
          }
          description="正类样本所占比例。"
        />
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>GDA 假设每类数据服从高斯分布，且协方差矩阵相同。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>在该假设下，决策边界是线性的，后验概率形式与逻辑回归一致。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>参数可以通过最大似然估计得到。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function GDA1DDemo() {
  const [mu0, setMu0] = useState(-1.5);
  const [mu1, setMu1] = useState(1.5);
  const [sigma, setSigma] = useState(1.0);
  const [phi, setPhi] = useState(0.5);

  // Decision boundary: solve log p(x|y=1) + log phi = log p(x|y=0) + log(1-phi)
  // For same sigma, boundary is x = (mu0 + mu1)/2 + sigma^2/(mu1 - mu0) * log((1-phi)/phi)
  const boundary = useMemo(() => {
    if (Math.abs(mu1 - mu0) < 1e-6) return null;
    return (mu0 + mu1) / 2 + (sigma * sigma) / (mu1 - mu0) * Math.log((1 - phi) / phi);
  }, [mu0, mu1, sigma, phi]);

  const xMin = Math.min(mu0, mu1) - 4 * sigma;
  const xMax = Math.max(mu0, mu1) + 4 * sigma;
  const width = 560;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 45, left: 55 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const gaussian = (x: number, mu: number, s: number) =>
    (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / s, 2));

  const yMax = 1 / (sigma * Math.sqrt(2 * Math.PI));

  const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => padding.top + innerH - (y / yMax) * innerH;

  const steps = 200;
  const curve0 = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      pts.push({ x, y: gaussian(x, mu0, sigma) });
    }
    return pts;
  }, [mu0, sigma, xMin, xMax]);

  const curve1 = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      pts.push({ x, y: gaussian(x, mu1, sigma) });
    }
    return pts;
  }, [mu1, sigma, xMin, xMax]);

  const path0 = curve0.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const path1 = curve1.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类别 0 均值 μ₀ = <span className="font-mono">{mu0.toFixed(1)}</span>
          </label>
          <input type="range" min={-4} max={4} step={0.1} value={mu0} onChange={(e) => setMu0(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类别 1 均值 μ₁ = <span className="font-mono">{mu1.toFixed(1)}</span>
          </label>
          <input type="range" min={-4} max={4} step={0.1} value={mu1} onChange={(e) => setMu1(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标准差 σ = <span className="font-mono">{sigma.toFixed(1)}</span>
          </label>
          <input type="range" min={0.3} max={2} step={0.1} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} className="w-full accent-violet-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            正类先验 φ = <span className="font-mono">{phi.toFixed(2)}</span>
          </label>
          <input type="range" min={0.05} max={0.95} step={0.05} value={phi} onChange={(e) => setPhi(Number(e.target.value))} className="w-full accent-amber-500" />
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = t * yMax;
          return <line key={`h-${t}`} x1={padding.left} y1={yScale(y)} x2={padding.left + innerW} y2={yScale(y)} stroke="#e5e7eb" strokeDasharray="3,3" />;
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const x = xMin + t * (xMax - xMin);
          return <line key={`v-${t}`} x1={xScale(x)} y1={padding.top} x2={xScale(x)} y2={padding.top + innerH} stroke="#e5e7eb" strokeDasharray="3,3" />;
        })}
        {/* axes */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        {/* x ticks */}
        {[xMin, (xMin + xMax) / 2, xMax].map((x) => (
          <g key={x}>
            <line x1={xScale(x)} y1={padding.top + innerH} x2={xScale(x)} y2={padding.top + innerH + 5} stroke="#6b7280" />
            <text x={xScale(x)} y={padding.top + innerH + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x.toFixed(1)}</text>
          </g>
        ))}
        {/* y ticks */}
        {[0, yMax / 2, yMax].map((y) => (
          <g key={y}>
            <line x1={padding.left - 5} y1={yScale(y)} x2={padding.left} y2={yScale(y)} stroke="#6b7280" />
            <text x={padding.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y.toFixed(2)}</text>
          </g>
        ))}
        <text x={padding.left + innerW / 2} y={height - 8} textAnchor="middle" fontSize={12} fill="#374151">x</text>
        <text x={18} y={padding.top + innerH / 2} textAnchor="middle" fontSize={12} fill="#374151" transform={`rotate(-90, 18, ${padding.top + innerH / 2})`}>p(x|y)</text>
        {/* curves */}
        <path d={path0} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path1} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {/* boundary */}
        {boundary !== null && boundary >= xMin && boundary <= xMax && (
          <g>
            <line x1={xScale(boundary)} y1={padding.top} x2={xScale(boundary)} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={2} strokeDasharray="6,4" />
            <text
              x={xScale(boundary) + (boundary - xMin < 0.15 * (xMax - xMin) ? 6 : xMax - boundary < 0.15 * (xMax - xMin) ? -6 : 0)}
              y={padding.top - 6}
              textAnchor={boundary - xMin < 0.15 * (xMax - xMin) ? 'start' : xMax - boundary < 0.15 * (xMax - xMin) ? 'end' : 'middle'}
              fontSize={11}
              fill="#4b5563"
            >
              决策边界 x = {boundary.toFixed(2)}
            </text>
          </g>
        )}
      </svg>

      <div className="flex justify-center gap-6 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded" />
          <span>类别 0 的 p(x|y=0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-emerald-500 rounded" />
          <span>类别 1 的 p(x|y=1)</span>
        </div>
      </div>
    </div>
  );
}
