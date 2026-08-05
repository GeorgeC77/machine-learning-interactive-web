import { useState, useMemo } from 'react';
import { FunctionSquare, ShieldAlert, BookOpen, ChevronRight , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function ExponentialFamilyPage() {
  const [dist, setDist] = useState<'bernoulli' | 'gaussian' | 'poisson'>('bernoulli');
  const [eta, setEta] = useState(0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第三章 · 广义线性模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">指数族分布</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          指数族分布是 GLM 的数学基础。通过统一的参数化形式，我们可以把高斯分布、伯努利分布、泊松分布等常见分布放在同一个框架下研究。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Definition */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">指数族分布的一般形式</h2>
        </div>
        <p className="text-gray-700 mb-4">
          如果一个概率分布可以写成下面的形式，就称它属于<strong>指数族分布</strong>（exponential family）：
        </p>

        <FormulaCard
          title="指数族分布"
          formula={
            <KaTeX
              math={String.raw`p(y; \eta) = b(y) \exp\bigl(\eta^T T(y) - a(\eta)\bigr)`}
              display
            />
          }
          description={
            <>
              其中 <KaTeX math={String.raw`\eta`} /> 是<strong>自然参数</strong>（natural parameter），
              <KaTeX math={String.raw`T(y)`} /> 是<strong>充分统计量</strong>（sufficient statistic），
              <KaTeX math={String.raw`a(\eta)`} /> 是<strong>对数配分函数</strong>（log partition function），
              <KaTeX math={String.raw`b(y)`} /> 是<strong>基准函数</strong>（base measure）。
            </>
          }
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2">对数配分函数 a(η) 的作用</h3>
            <p className="text-sm text-gray-700">
              它保证分布归一化：离散情形下概率质量之和为 1，连续情形下概率密度积分为 1。同时对 η 求导可以得到充分统计量的期望：
              <KaTeX math={String.raw`\frac{\partial a}{\partial \eta} = \mathbb{E}[T(y)]`} />。
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2">自然参数 η 的角色</h3>
            <p className="text-sm text-gray-700">
              η 是分布的"核心旋钮"。在 GLM 中，我们假设 η 与输入特征成线性关系：
              <KaTeX math={String.raw`\eta = \theta^T x`} />。
            </p>
          </div>
        </div>
      </section>

      {/* Bernoulli */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FunctionSquare className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">例一：伯努利分布</h2>
        </div>
        <p className="text-gray-700 mb-4">
          伯努利分布描述只有两种结果的随机变量，例如抛硬币、邮件是否为垃圾邮件。其概率质量函数为：
        </p>

        <FormulaCard
          title="伯努利分布"
          formula={
            <KaTeX
              math={String.raw`p(y; \phi) = \phi^y (1 - \phi)^{1-y}, \quad y \in \{0, 1\}`}
              display
            />
          }
          description="其中 φ 是 y=1 的概率。"
        />

        <p className="text-gray-700 mb-4">把它改写成指数族形式：</p>

        <FormulaCard
          title="伯努利分布的指数族形式"
          formula={
            <KaTeX
              math={String.raw`p(y; \eta) = \exp\bigl(y \eta - \log(1 + e^{\eta})\bigr)`}
              display
            />
          }
          description={
            <>
              因此 <KaTeX math={String.raw`T(y) = y`} />，
              <KaTeX math={String.raw`a(\eta) = \log(1 + e^{\eta})`} />，
              <KaTeX math={String.raw`b(y) = 1`} />。
              并且 <KaTeX math={String.raw`\phi = \frac{1}{1 + e^{-\eta}}`} /> 正是 Sigmoid 函数。
            </>
          }
        />
      </section>

      {/* Gaussian */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FunctionSquare className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">例二：高斯分布</h2>
        </div>
        <p className="text-gray-700 mb-4">
          高斯分布是线性回归误差假设的基础。设方差 σ² 固定为 1，概率密度函数为：
        </p>

        <FormulaCard
          title="高斯分布（固定方差）"
          formula={
            <KaTeX
              math={String.raw`p(y; \mu) = \frac{1}{\sqrt{2\pi}} \exp\Bigl(-\frac{1}{2}(y - \mu)^2\Bigr)`}
              display
            />
          }
          description="展开后可以得到指数族形式。"
        />

        <FormulaCard
          title="高斯分布的指数族形式"
          formula={
            <KaTeX
              math={String.raw`p(y; \eta) = \frac{1}{\sqrt{2\pi}} \exp\Bigl(y\eta - \frac{1}{2}\eta^2 - \frac{1}{2}y^2\Bigr)`}
              display
            />
          }
          description={
            <>
              因此 <KaTeX math={String.raw`T(y) = y`} />，
              <KaTeX math={String.raw`a(\eta) = \frac{1}{2}\eta^2`} />，
              <KaTeX math={String.raw`b(y) = \frac{1}{\sqrt{2\pi}} \exp(-\frac{1}{2}y^2)`} />。
              并且 <KaTeX math={String.raw`\mu = \eta`} />。
            </>
          }
        />
      </section>

      {/* Interactive Demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：改变自然参数 η</h2>
        <p className="text-gray-700 mb-4">
          选择一种分布，拖动 η 滑块，观察概率分布如何变化。
          演示中的泊松分布同样属于指数族：η = log λ，a(η) = e^η，b(y) = 1/y!——这正是图中 λ = e^η 的由来。
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'bernoulli', label: '伯努利' },
            { key: 'gaussian', label: '高斯（固定方差）' },
            { key: 'poisson', label: '泊松' },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setDist(d.key as typeof dist);
                setEta(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dist === d.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            自然参数 η = <span className="font-mono text-blue-700">{eta.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={eta}
            onChange={(e) => setEta(Number(e.target.value))}
            className="w-full accent-blue-600"
          />

          <DistributionPlot dist={dist} eta={eta} />
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
          <ChevronRight className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>指数族分布统一了多种常见概率分布的表示形式。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>自然参数 η、充分统计量 T(y)、对数配分函数 a(η) 是三个关键角色。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>伯努利分布对应 Sigmoid，高斯分布对应恒等函数，这为 GLM 推导埋下伏笔。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function DistributionPlot({ dist, eta }: { dist: 'bernoulli' | 'gaussian' | 'poisson'; eta: number }) {
  if (dist === 'bernoulli') {
    const phi = 1 / (1 + Math.exp(-eta));
    return <BernoulliPlot phi={phi} />;
  }

  if (dist === 'gaussian') {
    return <GaussianPlot mu={eta} sigma={1} />;
  }

  return <PoissonPlot lambda={Math.exp(eta)} />;
}

function BernoulliPlot({ phi }: { phi: number }) {
  const p0 = 1 - phi;
  const p1 = phi;
  const maxH = 160;

  return (
    <div className="mt-6">
      <div className="flex items-end justify-center gap-12 h-48">
        <div className="flex flex-col items-center">
          <div
            className="w-20 bg-blue-400 rounded-t transition-all duration-200"
            style={{ height: `${p0 * maxH}px` }}
          />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-gray-700">y = 0</div>
            <div className="text-lg font-bold text-blue-700">{p0.toFixed(4)}</div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-20 bg-emerald-500 rounded-t transition-all duration-200"
            style={{ height: `${p1 * maxH}px` }}
          />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-gray-700">y = 1</div>
            <div className="text-lg font-bold text-emerald-700">{p1.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GaussianPlot({ mu, sigma }: { mu: number; sigma: number }) {
  const points = useMemo(() => {
    const data: { x: number; y: number }[] = [];
    for (let x = mu - 4; x <= mu + 4; x += 0.1) {
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      data.push({ x, y });
    }
    return data;
  }, [mu, sigma]);

  const width = 560;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xMin = mu - 4;
  const xMax = mu + 4;
  const yMax = 0.45;

  const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => padding.top + innerH - (y / yMax) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
    .join(' ');

  return (
    <div className="mt-6">
      <div className="text-center text-sm text-gray-600 mb-2">
        均值 μ = {mu.toFixed(2)}，方差 σ² = {sigma.toFixed(1)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: 260 }}>
        {/* axes */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#9ca3af" strokeWidth={1.5} />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#9ca3af" strokeWidth={1.5} />
        {/* x ticks */}
        {[mu - 3, mu - 2, mu - 1, mu, mu + 1, mu + 2, mu + 3].map((x) => (
          <g key={x}>
            <line x1={xScale(x)} y1={padding.top + innerH} x2={xScale(x)} y2={padding.top + innerH + 5} stroke="#9ca3af" />
            <text x={xScale(x)} y={padding.top + innerH + 18} textAnchor="middle" fontSize={10} fill="#6b7280">
              {x.toFixed(1)}
            </text>
          </g>
        ))}
        {/* y ticks */}
        {[0, 0.2, 0.4].map((y) => (
          <g key={y}>
            <line x1={padding.left - 5} y1={yScale(y)} x2={padding.left} y2={yScale(y)} stroke="#9ca3af" />
            <text x={padding.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#6b7280">
              {y.toFixed(1)}
            </text>
          </g>
        ))}
        {/* curve */}
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {/* mean line */}
        <line x1={xScale(mu)} y1={padding.top} x2={xScale(mu)} y2={padding.top + innerH} stroke="#6d28d9" strokeWidth={1.5} strokeDasharray="6,4" />
        <text x={xScale(mu) + 5} y={padding.top + 12} fontSize={10} fill="#6d28d9">μ</text>
      </svg>
    </div>
  );
}

function PoissonPlot({ lambda }: { lambda: number }) {
  // 上界随 λ 自适应（均值 + 5 倍标准差），避免大 λ 时右尾被截断
  const maxK = Math.max(10, Math.ceil(lambda + 5 * Math.sqrt(lambda)));
  const probs = useMemo(() => {
    const arr: { k: number; p: number }[] = [];
    for (let k = 0; k <= maxK; k++) {
      arr.push({ k, p: (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k) });
    }
    return arr;
  }, [lambda, maxK]);

  const visible = probs.filter((d) => d.p > 0.0001);
  const maxP = Math.max(...visible.map((d) => d.p));

  return (
    <div className="mt-6">
      <div className="text-center text-sm text-gray-600 mb-2">
        λ = e<sup>η</sup> = {formatLambda(lambda)}
      </div>
      <div className="flex items-end justify-center gap-1 h-48 px-4">
        {visible.map(({ k, p }) => (
          <div key={k} className="flex-1 flex flex-col items-center min-w-[18px]">
            <div
              className="w-full bg-blue-500 rounded-t transition-all duration-200"
              style={{ height: `${(p / maxP) * 160}px` }}
              title={`P(y=${k})=${p.toFixed(4)}`}
            />
            <div className="text-xs text-gray-600 mt-1">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function formatLambda(lambda: number): string {
  if (lambda === 0) return '0';
  if (lambda >= 1000 || lambda < 0.001) return lambda.toExponential(2);
  if (Number.isInteger(lambda)) return String(lambda);
  return String(parseFloat(lambda.toFixed(3)));
}
