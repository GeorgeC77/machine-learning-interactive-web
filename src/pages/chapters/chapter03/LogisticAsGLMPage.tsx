import { useMemo, useState } from 'react';
import { ShieldAlert, GitBranch, Activity, CheckCircle2, ArrowRight , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function LogisticAsGLMPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第三章 · 广义线性模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">逻辑回归作为 GLM</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          在第二章中，我们直接引入 Sigmoid 函数进行二分类。现在从 GLM 的视角来看：
          只要选择伯努利分布，Sigmoid 就会自然出现。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Derivation flow */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">GLM 推导流程</h2>
        <div className="grid md:grid-cols-7 gap-4">
          <FlowCard
            step={1}
            title="选择分布"
            content="伯努利分布"
            detail={String.raw`y \in \{0, 1\}`}
            color="rose"
          />
          <FlowArrow />
          <FlowCard
            step={2}
            title="确定响应函数"
            content="Sigmoid"
            detail={String.raw`g(\eta) = \frac{1}{1+e^{-\eta}}`}
            color="emerald"
          />
          <FlowArrow />
          <FlowCard
            step={3}
            title="写出预测函数"
            content="概率输出"
            detail={String.raw`h(x) = \frac{1}{1+e^{-\theta^T x}}`}
            color="blue"
          />
          <FlowArrow />
          <FlowCard
            step={4}
            title="最大似然"
            content="交叉熵"
            detail={String.raw`\min -\sum\bigl[y\log h + (1-y)\log(1-h)\bigr]`}
            color="amber"
          />
        </div>
      </section>

      {/* Interactive sigmoid demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">交互演示：从 η 到概率</h2>
        </div>
        <p className="text-gray-700 mb-4">
          伯努利分布的自然参数 η 是 log-odds。响应函数 Sigmoid 把 η 映射为概率 φ。
        </p>
        <SigmoidExplorer />
      </section>

      {/* Bernoulli choice */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">选择分布：伯努利分布</h2>
        </div>
        <p className="text-gray-700 mb-4">
          二分类问题的标签 <KaTeX math={String.raw`y \in \{0, 1\}`} />。伯努利分布恰好描述这种二元结果：
        </p>

        <FormulaCard
          title="伯努利分布"
          formula={
            <KaTeX
              math={String.raw`p(y; \phi) = \phi^y (1 - \phi)^{1-y}`}
              display
            />
          }
          description="φ 是 y = 1 的概率。"
        />

        <p className="text-gray-700 mb-4">
          把它改写成指数族形式：
        </p>

        <FormulaCard
          title="伯努利分布的指数族参数"
          formula={
            <KaTeX
              math={String.raw`\eta = \log\frac{\phi}{1 - \phi}, \quad T(y) = y, \quad a(\eta) = \log(1 + e^{\eta}), \quad b(y) = 1`}
              display
            />
          }
          description="这里的 η 就是 log-odds，也称为 logit。"
        />
      </section>

      {/* Response function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">响应函数：Sigmoid</h2>
        <p className="text-gray-700 mb-4">
          对数配分函数 <KaTeX math={String.raw`a(\eta) = \log(1 + e^{\eta})`} />，求导得到响应函数：
        </p>

        <FormulaCard
          title="Sigmoid 响应函数"
          formula={
            <KaTeX
              math={String.raw`g(\eta) = \frac{\partial a(\eta)}{\partial \eta} = \frac{1}{1 + e^{-\eta}}`}
              display
            />
          }
          description="这正是 Sigmoid 函数！"
        />

        <p className="text-gray-700 mb-4">
          因此逻辑回归的预测函数为：
        </p>

        <FormulaCard
          title="逻辑回归假设函数"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = \frac{1}{1 + e^{-\theta^T x}}`}
              display
            />
          }
          description="与第二章中的逻辑回归假设完全一致。"
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">连接函数</h3>
            <p className="text-sm text-gray-700">
              Sigmoid 的反函数是 logit：
              <KaTeX math={String.raw`\eta = \log\frac{\phi}{1 - \phi}`} />。
              它把概率映射到整个实数轴。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">概率解释</h3>
            <p className="text-sm text-gray-700">
              <KaTeX math={String.raw`h_\theta(x) = P(y = 1 \mid x; \theta)`} />，
              输出直接是类别的概率。
            </p>
          </div>
        </div>
      </section>

      {/* Cross entropy */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">导出交叉熵损失</h2>
        <p className="text-gray-700 mb-4">
          在伯努利假设下，对数似然为：
        </p>

        <FormulaCard
          title="伯努利假设下的对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = \sum_{i=1}^{m} \Bigl(y^{(i)} \log h_\theta(x^{(i)}) + (1 - y^{(i)}) \log\bigl(1 - h_\theta(x^{(i)})\bigr)\Bigr)`}
              display
            />
          }
          description="最大化这个对数似然，就是最小化交叉熵损失。"
        />

        <p className="text-gray-700 mb-4">
          取负号并除以 m，得到我们熟悉的逻辑回归代价函数：
        </p>

        <FormulaCard
          title="逻辑回归代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \Bigl(y^{(i)} \log h_\theta(x^{(i)}) + (1 - y^{(i)}) \log\bigl(1 - h_\theta(x^{(i)})\bigr)\Bigr)`}
              display
            />
          }
          description="这就是第二章中的交叉熵损失。"
        />
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-rose-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-1" />
            <span>逻辑回归对应 GLM 中的伯努利分布假设。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-1" />
            <span>伯努利分布的对数配分函数求导后自然得到 Sigmoid 函数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-1" />
            <span>最大似然估计导出交叉熵损失，与第二章完全一致。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function SigmoidExplorer() {
  const [eta, setEta] = useState(0);

  const points = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let x = -6; x <= 6; x += 0.1) {
      arr.push({ x, y: 1 / (1 + Math.exp(-x)) });
    }
    return arr;
  }, []);

  const width = 560;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 45, left: 55 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xMin = -6;
  const xMax = 6;
  const yMin = 0;
  const yMax = 1;

  const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => padding.top + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const phi = 1 / (1 + Math.exp(-eta));

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="mb-4">
        <label className="flex justify-between text-sm text-gray-700 mb-1">
          <span>自然参数 η（log-odds）</span>
          <span className="font-mono text-blue-700">η = {eta.toFixed(2)} → φ = {phi.toFixed(3)}</span>
        </label>
        <Slider value={[eta]} min={-6} max={6} step={0.05} onValueChange={(v) => setEta(v[0])} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = yMin + t * (yMax - yMin);
          return <line key={`h-${t}`} x1={padding.left} y1={yScale(y)} x2={padding.left + innerW} y2={yScale(y)} stroke="#e5e7eb" strokeDasharray="3,3" />;
        })}
        {[0, 1 / 3, 2 / 3, 1].map((t) => {
          const x = xMin + t * (xMax - xMin);
          return <line key={`v-${t}`} x1={xScale(x)} y1={padding.top} x2={xScale(x)} y2={padding.top + innerH} stroke="#e5e7eb" strokeDasharray="3,3" />;
        })}
        {/* axes */}
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
        {/* x ticks */}
        {[xMin, -3, 0, 3, xMax].map((x) => (
          <g key={x}>
            <line x1={xScale(x)} y1={padding.top + innerH} x2={xScale(x)} y2={padding.top + innerH + 5} stroke="#6b7280" />
            <text x={xScale(x)} y={padding.top + innerH + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x}</text>
          </g>
        ))}
        {/* y ticks */}
        {[0, 0.5, 1].map((y) => (
          <g key={y}>
            <line x1={padding.left - 5} y1={yScale(y)} x2={padding.left} y2={yScale(y)} stroke="#6b7280" />
            <text x={padding.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y.toFixed(1)}</text>
          </g>
        ))}
        <text x={padding.left + innerW / 2} y={height - 8} textAnchor="middle" fontSize={12} fill="#374151">η（自然参数 / log-odds）</text>
        <text x={16} y={padding.top + innerH / 2} textAnchor="middle" fontSize={12} fill="#374151" transform={`rotate(-90, 16, ${padding.top + innerH / 2})`}>φ = P(y=1)</text>
        {/* threshold line */}
        <line x1={padding.left} y1={yScale(0.5)} x2={padding.left + innerW} y2={yScale(0.5)} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4,4" />
        {/* curve */}
        <path d={pathD} fill="none" stroke="#e11d48" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {/* current point marker */}
        <line x1={xScale(eta)} y1={yScale(0)} x2={xScale(eta)} y2={yScale(phi)} stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="4,3" />
        <line x1={padding.left} y1={yScale(phi)} x2={xScale(eta)} y2={yScale(phi)} stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="4,3" />
        <circle cx={xScale(eta)} cy={yScale(phi)} r={6} fill="#1d4ed8" stroke="#fff" strokeWidth={2} />
      </svg>
      <div className="text-center text-xs text-gray-500 mt-2">
        当 η = 0 时 φ = 0.5；η 越大，模型越确信 y = 1。
      </div>
    </div>
  );
}

function FlowCard({ step, title, content, detail, color }: { step: number; title: string; content: string; detail: string; color: 'rose' | 'emerald' | 'blue' | 'amber' }) {
  const colors = {
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-bold opacity-70 mb-1">步骤 {step}</div>
      <div className="font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-sm font-medium mb-2">{content}</div>
      <div className="text-sm opacity-90">
        <KaTeX math={detail} />
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <ArrowRight className="w-6 h-6 text-gray-400" />
    </div>
  );
}
