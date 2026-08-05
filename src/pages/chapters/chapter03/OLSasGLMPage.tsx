import { ShieldAlert, LineChart, GitBranch, CheckCircle2, ArrowRight , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OLSasGLMPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第三章 · 广义线性模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">普通最小二乘作为 GLM</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          我们已经学过线性回归。现在从 GLM 的视角重新看它：只需选择高斯分布和恒等响应函数，
          就能自然导出最小二乘目标。
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
            content="高斯分布"
            detail={String.raw`y \mid x \sim \mathcal{N}(\mu, \sigma^2)`}
            color="violet"
          />
          <FlowArrow />
          <FlowCard
            step={2}
            title="确定响应函数"
            content="恒等函数"
            detail={String.raw`g(\eta) = \eta`}
            color="emerald"
          />
          <FlowArrow />
          <FlowCard
            step={3}
            title="写出预测函数"
            content="线性假设"
            detail={String.raw`h(x) = \theta^T x`}
            color="blue"
          />
          <FlowArrow />
          <FlowCard
            step={4}
            title="最大似然"
            content="最小二乘"
            detail={String.raw`\min \sum (h - y)^2`}
            color="amber"
          />
        </div>
      </section>

      {/* Choice of distribution */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <LineChart className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">选择分布：高斯分布</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在线性回归中，响应变量 <KaTeX math={String.raw`y`} /> 是连续值。我们选择高斯分布作为其条件分布，并假设方差固定为 <KaTeX math={String.raw`\sigma^2`} />。
        </p>

        <FormulaCard
          title="高斯分布"
          formula={
            <KaTeX
              math={String.raw`p(y; \mu) = \frac{1}{\sqrt{2\pi}\sigma} \exp\Bigl(-\frac{1}{2\sigma^2}(y - \mu)^2\Bigr)`}
              display
            />
          }
          description="其中均值 μ 是我们要预测的参数。"
        />

        <p className="text-gray-700 mb-4">
          通过配方法，可以把高斯分布写成标准指数族形式。为简单起见，设 <KaTeX math={String.raw`\sigma^2 = 1`} />：
        </p>

        <FormulaCard
          title="对应指数族参数"
          formula={
            <KaTeX
              math={String.raw`\eta = \mu, \quad T(y) = y, \quad a(\eta) = \frac{1}{2}\eta^2, \quad b(y) = \frac{1}{\sqrt{2\pi}} e^{-y^2/2}`}
              display
            />
          }
          description="自然参数 η 恰好就是高斯分布的均值。"
        />
      </section>

      {/* Response function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">响应函数：恒等函数</h2>
        </div>
        <p className="text-gray-700 mb-4">
          根据 GLM 的推导，响应函数是对数配分函数的导数：
        </p>

        <FormulaCard
          title="响应函数"
          formula={
            <KaTeX
              math={String.raw`g(\eta) = \frac{\partial a(\eta)}{\partial \eta} = \frac{\partial}{\partial \eta}\Bigl(\frac{1}{2}\eta^2\Bigr) = \eta`}
              display
            />
          }
          description="对于高斯分布，响应函数是恒等函数。"
        />

        <p className="text-gray-700 mb-4">
          因此 GLM 的预测函数为：
        </p>

        <FormulaCard
          title="线性回归的假设函数"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = g(\theta^T x) = \theta^T x`}
              display
            />
          }
          description="这正是线性回归的假设函数！"
        />
      </section>

      {/* MSE derivation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">导出最小二乘目标</h2>
        <p className="text-gray-700 mb-4">
          给定 m 个样本，最大似然估计要求最大化：
        </p>

        <FormulaCard
          title="高斯假设下的对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = \sum_{i=1}^{m} \log p\bigl(y^{(i)} \mid x^{(i)}; \theta\bigr) = \sum_{i=1}^{m} \Bigl(-\frac{1}{2}(y^{(i)} - \theta^T x^{(i)})^2 + \text{const}\Bigr)`}
              display
            />
          }
          description="忽略与 θ 无关的常数项。"
        />

        <p className="text-gray-700 mb-4">
          最大化对数似然等价于最小化平方误差：
        </p>

        <FormulaCard
          title="最小二乘代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = \frac{1}{2m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr)^2`}
              display
            />
          }
          description="这就是我们在第一章反复使用的最小二乘代价函数。"
        />

        <div className="bg-violet-50 rounded-lg p-4 border border-violet-200 mt-4">
          <h3 className="font-semibold text-violet-800 mb-2">关键洞察</h3>
          <p className="text-sm text-gray-700">
            最小二乘并不是凭空选择的损失函数，而是<strong>高斯分布假设 + 最大似然估计</strong>的自然结果。
            如果假设误差服从高斯分布，最大化似然就等价于最小化平方误差。
          </p>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-violet-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>线性回归对应 GLM 中的高斯分布假设。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>高斯分布的响应函数是恒等函数，因此 h(x) = θᵀx。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>最大似然估计自然导出最小二乘代价函数。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function FlowCard({ step, title, content, detail, color }: { step: number; title: string; content: string; detail: string; color: 'violet' | 'emerald' | 'blue' | 'amber' }) {
  const colors = {
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
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
