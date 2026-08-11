import { useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, ShieldAlert } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function ContinuousStateMDPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">连续状态 MDP</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          很多实际控制问题的状态空间是连续的。本节介绍两种处理连续状态 MDP 的方法：离散化，以及直接使用函数近似表示价值函数。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" aria-hidden="true" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">离散化</h2>
        </div>
        <p className="text-gray-700 mb-4">
          最简单的做法是把连续状态空间划分成若干网格，把每个网格当作一个离散状态，然后对离散化后的 MDP 使用值迭代或策略迭代。
          当实际系统处于某个连续状态时，先找到它所在的网格，再执行该网格对应的最优动作。
        </p>
        <p className="text-gray-700 mb-4">
          然而，这种方法通常把价值函数近似为分段常数。下面用一个已知光滑目标的一维教学例子展示分辨率误差；
          它不是完整的控制环境，而是在隔离观察“状态表示如何限制价值近似”。
        </p>
        <DiscretizationDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">维度灾难</h2>
        <p className="text-gray-700 mb-4">
          假设状态空间维度为 d，每个维度离散成 k 个区间，则离散状态总数为 k^d。这个数字随维度指数增长：
        </p>
        <FormulaCard
          title="状态数随维度指数增长"
          formula={
            <KaTeX
              math={String.raw`|S_\text{discrete}| = k^d`}
              display
            />
          }
          description="例如 10 维状态，每维 100 个区间，将产生 100^10 = 10^{20} 个离散状态，远超现代计算机的存储能力。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：|S_discrete| = k^d'}
        </p>
        <p className="text-gray-700 mt-4">
          因此，离散化通常只适用于低维或结构简单的问题；维度稍高时需要函数近似、采样方法或问题结构利用。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">值函数近似</h2>
        <p className="text-gray-700 mb-4">
          另一种思路是直接用参数化函数来近似价值函数，而不做显式离散化。例如，用线性函数或神经网络表示：
        </p>
        <FormulaCard
          title="值函数近似"
          formula={
            <KaTeX
              math={String.raw`V(s) \approx V_\theta(s) = \theta^T \phi(s)`}
              display
            />
          }
          description="φ(s) 是状态特征。参数共享允许相近状态泛化，但效果取决于特征、函数容量、训练分布与优化。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：V_θ(s) = θ^T φ(s)，或更一般地由神经网络 V_θ(s) 表示'}
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fitted Value Iteration</h2>
        <p className="text-gray-700 mb-4">
          Fitted value iteration 是值迭代在连续状态下的近似版本。其基本思想是：
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>随机采样 n 个连续状态 s^(1), ..., s^(n)。</li>
          <li>对每个采样状态，用模型或模拟器估计 Bellman 最优方程的右端：</li>
        </ol>
        <FormulaCard
          title="目标值"
          formula={
            <KaTeX
              math={String.raw`y_i = \max_a \left[ R(s_i, a) + \gamma \, \mathbb{E}_{s' \sim P(\cdot|s_i,a)}\bigl[V_{\theta_\text{old}}(s')\bigr] \right]`}
              display
            />
          }
          description="期望通常通过从模型中采样 k 个下一状态来近似。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：y_i = max_a [ R(s_i,a) + γ E[V_{θ_old}(s\') | s_i,a] ]'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          然后，通过监督学习（如线性回归）更新参数 θ，使 V_θ(s^(i)) 尽可能接近 y^(i)：
        </p>
        <FormulaCard
          title="监督学习更新"
          formula={
            <KaTeX
              math={String.raw`\theta_\text{new} = \arg\min_\theta \sum_{i=1}^n \bigl(V_\theta(s_i) - y_i\bigr)^2`}
              display
            />
          }
          description="这一步在形式上是回归，但标签由旧价值函数自举产生，会随迭代变化，并非固定的独立同分布监督标签。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：θ_new = argmin_θ Σ_i (V_θ(s_i) − y_i)²'}
        </p>
        <p className="text-gray-700 mt-4">
          一般的 fitted value iteration 不保证收敛；其稳定性取决于函数近似类、采样分布、投影误差和优化方法。如果模型是确定性的，可令 k=1 来简化期望计算。
        </p>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" />
            <span>离散化简单直观，但会遭遇维度灾难，且分段常数近似不够光滑。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" />
            <span>值函数近似用参数化函数直接逼近 V*，避免显式离散化。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" />
            <span>Fitted value iteration 把 Bellman 更新和监督学习结合在一起。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function DiscretizationDemo() {
  const [bins, setBins] = useState(5);

  const width = 560;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const xMin = 1;
  const xMax = 8;
  const yMin = 1;
  const yMax = 5.5;

  function sx(x: number): number {
    return padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
  }

  function sy(y: number): number {
    return height - padding.bottom - ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);
  }

  // 真实函数 y = 0.5 x + 1.5
  function trueY(x: number): number {
    return 0.5 * x + 1.5;
  }

  // 生成带噪声数据点（使用固定种子，避免每次渲染跳动）
  const dataPoints = useMemo(() => {
    return Array.from({ length: 41 }, (_, index) => {
      const x = 1.05 + (index / 40) * 6.9;
      const unitNoise = (((index + 12_345) * 9_301 + 49_297) % 233_280) / 233_280;
      return { x, y: trueY(x) + (unitNoise - 0.5) * 0.4 };
    });
  }, []);

  // 线性回归
  const n = dataPoints.length;
  const mx = dataPoints.reduce((s, p) => s + p.x, 0) / n;
  const my = dataPoints.reduce((s, p) => s + p.y, 0) / n;
  const num = dataPoints.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = dataPoints.reduce((s, p) => s + (p.x - mx) * (p.x - mx), 0);
  const slope = den > 0 ? num / den : 0.5;
  const intercept = my - slope * mx;

  // 用落入区间的样本均值作为该离散状态的代表值。
  function discretizedY(x: number): number {
    const binWidth = (xMax - xMin) / bins;
    const binIdx = Math.min(bins - 1, Math.floor((x - xMin) / binWidth));
    const x0 = xMin + binIdx * binWidth;
    const x1 = x0 + binWidth;
    const pointsInBin = dataPoints.filter((point) =>
      point.x >= x0 && (binIdx === bins - 1 ? point.x <= x1 : point.x < x1),
    );
    const midpoint = xMin + (binIdx + 0.5) * binWidth;
    return pointsInBin.length > 0
      ? pointsInBin.reduce((sum, point) => sum + point.y, 0) / pointsInBin.length
      : trueY(midpoint);
  }

  const evaluationPoints = Array.from({ length: 401 }, (_, index) =>
    xMin + (index / 400) * (xMax - xMin),
  );
  const discreteRmse = Math.sqrt(
    evaluationPoints.reduce((sum, x) => sum + (discretizedY(x) - trueY(x)) ** 2, 0)
      / evaluationPoints.length,
  );
  const linearRmse = Math.sqrt(
    evaluationPoints.reduce(
      (sum, x) => sum + (slope * x + intercept - trueY(x)) ** 2,
      0,
    ) / evaluationPoints.length,
  );

  const truePath = Array.from({ length: 200 }, (_, i) => {
    const x = xMin + (i / 199) * (xMax - xMin);
    return `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(trueY(x))}`;
  }).join(' ');

  const linearPath = Array.from({ length: 200 }, (_, i) => {
    const x = xMin + (i / 199) * (xMax - xMin);
    return `${i === 0 ? 'M' : 'L'} ${sx(x)} ${sy(slope * x + intercept)}`;
  }).join(' ');

  const stepCommands = [`M ${sx(xMin)} ${sy(discretizedY(xMin + 1e-6))}`];
  for (let bin = 0; bin < bins; bin++) {
    const boundary = xMin + ((bin + 1) / bins) * (xMax - xMin);
    const currentValue = discretizedY(boundary - 1e-6);
    stepCommands.push(`L ${sx(boundary)} ${sy(currentValue)}`);
    if (bin < bins - 1) {
      const nextValue = discretizedY(boundary + 1e-6);
      stepCommands.push(`L ${sx(boundary)} ${sy(nextValue)}`);
    }
  }
  const stepPath = stepCommands.join(' ');

  return (
    <div className="space-y-4">
      <ControlRow label={`离散区间数: ${bins}`}>
        <Slider
          aria-label="一维状态空间的离散区间数"
          value={[bins]}
          min={2}
          max={20}
          step={1}
          onValueChange={([value]) => setBins(value)}
        />
      </ControlRow>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[360px]"
          style={{ maxHeight: 300 }}
          role="img"
          aria-labelledby="continuous-value-title continuous-value-description"
        >
          <title id="continuous-value-title">一维连续状态的价值函数近似</title>
          <desc id="continuous-value-description">
            比较 {bins} 个区间的分段常数近似、线性函数近似与已知目标价值函数。
          </desc>
          <rect x={0} y={0} width={width} height={height} fill="#f9fafb" />
          {[2, 3, 4, 5].map((y) => (
            <line key={`hy-${y}`} x1={padding.left} y1={sy(y)} x2={width - padding.right} y2={sy(y)} stroke="#e5e7eb" strokeWidth={1} />
          ))}
          {[2, 4, 6, 8].map((x) => (
            <line key={`vx-${x}`} x1={sx(x)} y1={padding.top} x2={sx(x)} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth={1} />
          ))}
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#374151" strokeWidth={2} />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#374151" strokeWidth={2} />
          {[2, 4, 6, 8].map((x) => (
            <text key={`lx-${x}`} x={sx(x)} y={height - padding.bottom + 20} textAnchor="middle" fontSize={12} fill="#6b7280">{x}</text>
          ))}
          {[2, 3, 4, 5].map((y) => (
            <text key={`ly-${y}`} x={padding.left - 10} y={sy(y) + 4} textAnchor="end" fontSize={12} fill="#6b7280">{y}</text>
          ))}
          <text x={width / 2} y={height - 10} textAnchor="middle" fontSize={13} fill="#374151">x</text>
          <text x={20} y={height / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${height / 2})`}>y</text>

          {/* 数据点 */}
          {dataPoints.map((p, idx) => (
            <circle key={idx} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#2563eb" opacity={0.7} />
          ))}

          {/* 真实函数 */}
          <path d={truePath} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />

          {/* 线性回归 */}
          <path d={linearPath} fill="none" stroke="#10b981" strokeWidth={2} />

          {/* 分段常数离散化 */}
          <path d={stepPath} fill="none" stroke="#ef4444" strokeWidth={2} />
        </svg>
      </div>

      <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 opacity-70" /> 数据点</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-emerald-500" /> 线性回归</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-red-500" /> 分段常数离散化</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-700" /> 真实函数</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm" role="status" aria-live="polite">
        <div className="rounded-lg bg-gray-50 p-3">
          <span className="block text-gray-600">分段常数 RMSE</span>
          <span className="font-mono font-semibold text-red-700">{discreteRmse.toFixed(4)}</span>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <span className="block text-gray-600">线性近似 RMSE</span>
          <span className="font-mono font-semibold text-emerald-700">{linearRmse.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      {children}
    </div>
  );
}
