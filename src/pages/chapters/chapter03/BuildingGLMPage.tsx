import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Sparkles, GitBranch, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function BuildingGLMPage() {
  const [model, setModel] = useState<'gaussian' | 'bernoulli' | 'poisson'>('gaussian');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第三章 · 广义线性模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">构建 GLM</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          GLM 通过三个简单假设，把输入特征、自然参数和响应变量的分布联系起来。一旦接受这三个假设，
          具体的预测函数和优化目标就会自动推导出来。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Three assumptions */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">GLM 的三个假设</h2>
        </div>
        <p className="text-gray-700 mb-6">
          假设我们有一个训练集，输入为 <KaTeX math={String.raw`x \in \mathbb{R}^{n+1}`} />（含 x₀ = 1 截距项），输出为 <KaTeX math={String.raw`y`} />，参数为 <KaTeX math={String.raw`\theta`} />。
          GLM 对 <KaTeX math={String.raw`y \mid x; \theta`} /> 做出如下假设：
        </p>

        <div className="space-y-6">
          <AssumptionCard
            number={1}
            title="条件分布属于指数族"
            content={
              <>
                <KaTeX math={String.raw`y \mid x; \theta \sim \text{ExponentialFamily}(\eta)`} />。
                即给定 x 和 θ，响应变量服从某个以 η 为自然参数的指数族分布。
              </>
            }
          />
          <AssumptionCard
            number={2}
            title="预测目标是充分统计量的期望"
            content={
              <>
                我们要预测 <KaTeX math={String.raw`h(x) = \mathbb{E}[T(y) \mid x; \theta]`} />。
                对于普通回归 <KaTeX math={String.raw`T(y) = y`} />；对于 k 类分类 <KaTeX math={String.raw`T(y)`} /> 是 one-hot 指示向量
                （严格地说只需去掉冗余分量的 k−1 维，详见 Softmax 一节）。
              </>
            }
          />
          <AssumptionCard
            number={3}
            title="自然参数与输入线性相关"
            content={
              <>
                <KaTeX math={String.raw`\eta = \theta^T x`} />。
                这是 GLM 中"线性"的来源：自然参数是输入特征的线性组合。
              </>
            }
          />
        </div>
      </section>

      {/* Derivation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">从假设到预测函数</h2>
        </div>
        <p className="text-gray-700 mb-4">
          由指数族分布的性质可知，对数配分函数 a(η) 的导数等于充分统计量的期望：
        </p>

        <FormulaCard
          title="期望与对数配分函数的关系"
          formula={
            <KaTeX
              math={String.raw`\mathbb{E}[T(y) \mid x; \theta] = \frac{\partial a(\eta)}{\partial \eta}`}
              display
            />
          }
          description="这个等式是 GLM 推导的关键一步。"
        />

        <p className="text-gray-700 mb-4">
          结合第三个假设 <KaTeX math={String.raw`\eta = \theta^T x`} />，我们得到 GLM 的预测函数：
        </p>

        <FormulaCard
          title="GLM 预测函数"
          formula={
            <KaTeX
              math={String.raw`h(x) = \mathbb{E}[T(y) \mid x; \theta] = g(\theta^T x)`}
              display
            />
          }
          description={
            <>
              其中 <KaTeX math={String.raw`g(\eta) = a'(\eta)`} /> 称为<strong>响应函数</strong>（response function），
              它的反函数 <KaTeX math={String.raw`g^{-1}`} /> 称为<strong>连接函数</strong>（link function）。
            </>
          }
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">响应函数 g</h3>
            <p className="text-sm text-gray-700">
              把自然参数 η 映射为预测目标 <KaTeX math={String.raw`\mathbb{E}[T(y)]`} />。
              例如 Sigmoid、恒等函数、softmax。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">连接函数 g⁻¹</h3>
            <p className="text-sm text-gray-700">
              把预测目标映射回自然参数 η。例如 logit 函数 <KaTeX math={String.raw`\log\frac{\phi}{1-\phi}`} /> 是 Sigmoid 的反函数。
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
          <strong>记号说明：</strong>这里沿用部分机器学习课程中的记号，把 <KaTeX math={String.raw`\eta \to \mathrm{E}[y \mid x]`} /> 称为 response function；
          在很多统计学教材中，link function 通常定义为 <KaTeX math={String.raw`g(\mu) = \eta`} />，方向相反，阅读其他资料时请注意记号差异。
          当连接函数恰好把均值参数映回自然参数（即 <KaTeX math={String.raw`g^{-1}(\mu) = \eta`} />）时，称为<strong>正则连接函数</strong>（canonical link）：
          高斯→恒等、伯努利→logit、泊松→log 都属于这一类。
        </div>
      </section>

      {/* Interactive response function demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：分布决定响应函数</h2>
        <p className="text-gray-700 mb-4">
          选择一种分布，观察 GLM 推导出的响应函数和连接函数。同一个线性得分 <KaTeX math={String.raw`\theta^T x`} /> 经过不同响应函数后，得到完全不同的预测含义。
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'gaussian', label: '高斯分布 → 线性回归', activeClass: 'bg-violet-600 text-white' },
            { key: 'bernoulli', label: '伯努利分布 → 逻辑回归', activeClass: 'bg-rose-600 text-white' },
            { key: 'poisson', label: '泊松分布 → 泊松回归', activeClass: 'bg-amber-600 text-white' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setModel(m.key as typeof model)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                model === m.key
                  ? m.activeClass
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <ResponseFunctionExplorer model={model} />
      </section>

      {/* Learning objective */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">参数估计：最大似然</h2>
        <p className="text-gray-700 mb-4">
          GLM 的参数通常通过最大似然估计得到。给定 m 个独立同分布的训练样本，对数似然为：
        </p>

        <FormulaCard
          title="GLM 的对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = \sum_{i=1}^{m} \log p\bigl(y^{(i)} \mid x^{(i)}; \theta\bigr)`}
              display
            />
          }
          description="对于指数族分布，这个对数似然通常是凹函数，可以用梯度上升或牛顿法求解。"
        />

        <p className="text-gray-700 mb-4">梯度为：</p>

        <FormulaCard
          title="GLM 的梯度"
          formula={
            <KaTeX
              math={String.raw`\nabla_\theta \ell(\theta) = \sum_{i=1}^{m} \bigl(y^{(i)} - h_\theta(x^{(i)})\bigr) x^{(i)}`}
              display
            />
          }
          description="这个形式与逻辑回归完全一致！注意它针对 T(y) = y 的标量情形（回归、二分类）；对 Softmax 多分类，应逐参数写作 ∇_{θ_j}ℓ = Σ(y_j − p_j)x。这也是 GLM 统一框架的美妙之处。"
        />
      </section>

      {/* Design recipe */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">GLM 设计 recipe</h2>
        <p className="text-gray-700 mb-4">
          当你遇到一个新的监督学习问题时，可以按下面步骤选择 GLM：
        </p>

        <div className="space-y-3">
          <RecipeStep number={1} text="确定响应变量 y 的类型：连续值、二分类、多分类、计数等。" />
          <RecipeStep number={2} text="为 y 选择合适的指数族分布：高斯、伯努利、多项、泊松等。" />
          <RecipeStep number={3} text="根据分布确定响应函数 g 和连接函数 g⁻¹。" />
          <RecipeStep number={4} text="假设 η = θᵀx，写出预测函数 h(x) = g(θᵀx)。" />
          <RecipeStep number={5} text="用最大似然估计或梯度法求解参数 θ。" />
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
            <span>GLM 的三个假设把分布选择、预测目标和线性建模联系在一起。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>响应函数 g 是对数配分函数 a(η) 的导数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
            <span>最大似然估计的梯度形式统一为 (y − h)x，便于统一实现和理解。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function ResponseFunctionExplorer({ model }: { model: 'gaussian' | 'bernoulli' | 'poisson' }) {
  const info = {
    gaussian: {
      distribution: '高斯分布',
      modelName: '普通最小二乘 / 线性回归',
      responseFn: "g(\\eta) = \\eta",
      linkFn: "g^{-1}(\\mu) = \\mu",
      prediction: "h(x) = \\theta^T x",
      color: '#8b5cf6',
      note: '响应函数是恒等函数，预测值可以取任意实数。',
    },
    bernoulli: {
      distribution: '伯努利分布',
      modelName: '逻辑回归',
      responseFn: "g(\\eta) = \\frac{1}{1 + e^{-\\eta}}",
      linkFn: "g^{-1}(\\phi) = \\log\\frac{\\phi}{1-\\phi}",
      prediction: "h(x) = \\frac{1}{1 + e^{-\\theta^T x}}",
      color: '#e11d48',
      note: '响应函数是 Sigmoid，把线性得分压缩到 (0, 1) 区间作为概率。',
    },
    poisson: {
      distribution: '泊松分布',
      modelName: '泊松回归',
      responseFn: "g(\\eta) = e^{\\eta}",
      linkFn: "g^{-1}(\\lambda) = \\log\\lambda",
      prediction: "h(x) = e^{\\theta^T x}",
      color: '#d97706',
      note: '响应函数是指数函数，保证预测计数 λ 始终为正。',
    },
  }[model];

  const points = useMemo(() => {
    const data: { x: number; y: number }[] = [];
    if (model === 'gaussian') {
      for (let x = -5; x <= 5; x += 0.2) data.push({ x, y: x });
    } else if (model === 'bernoulli') {
      for (let x = -5; x <= 5; x += 0.1) data.push({ x, y: 1 / (1 + Math.exp(-x)) });
    } else {
      for (let x = -3; x <= 3; x += 0.1) data.push({ x, y: Math.exp(x) });
    }
    return data;
  }, [model]);

  const width = 560;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 45, left: 60 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xMin = model === 'poisson' ? -3 : -5;
  const xMax = model === 'poisson' ? 3 : 5;
  const yMin = model === 'gaussian' ? -5 : 0;
  const yMax = model === 'poisson' ? 20 : model === 'gaussian' ? 5 : 1;

  const xScale = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) => padding.top + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(Math.max(yMin, Math.min(p.y, yMax)))}`)
    .join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-3">{info.modelName}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-500">分布</span>
              <span className="font-medium text-gray-900">{info.distribution}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-500">响应函数 g</span>
              <span className="font-medium text-gray-900"><KaTeX math={info.responseFn} /></span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-500">连接函数 g⁻¹</span>
              <span className="font-medium text-gray-900"><KaTeX math={info.linkFn} /></span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-500">预测函数</span>
              <span className="font-medium text-gray-900"><KaTeX math={info.prediction} /></span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">{info.note}</p>
        </div>

        <div>
          <div className="text-center text-sm text-gray-600 mb-2">响应函数 g(η) 曲线</div>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
            {/* grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = yMin + t * (yMax - yMin);
              return (
                <line key={`h-${t}`} x1={padding.left} y1={yScale(y)} x2={padding.left + innerW} y2={yScale(y)} stroke="#e5e7eb" strokeDasharray="3,3" />
              );
            })}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const x = xMin + t * (xMax - xMin);
              return (
                <line key={`v-${t}`} x1={xScale(x)} y1={padding.top} x2={xScale(x)} y2={padding.top + innerH} stroke="#e5e7eb" strokeDasharray="3,3" />
              );
            })}
            {/* axes */}
            <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#6b7280" strokeWidth={1.5} />
            {/* x ticks */}
            {[xMin, xMin / 2, 0, xMax / 2, xMax].map((x) => (
              <g key={x}>
                <line x1={xScale(x)} y1={padding.top + innerH} x2={xScale(x)} y2={padding.top + innerH + 5} stroke="#6b7280" />
                <text x={xScale(x)} y={padding.top + innerH + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x.toFixed(1).replace(/\.0$/, '')}</text>
              </g>
            ))}
            {/* y ticks */}
            {[yMin, yMax / 2, yMax].map((y) => (
              <g key={y}>
                <line x1={padding.left - 5} y1={yScale(y)} x2={padding.left} y2={yScale(y)} stroke="#6b7280" />
                <text x={padding.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y.toFixed(yMax === 1 ? 1 : 0)}</text>
              </g>
            ))}
            <text x={padding.left + innerW / 2} y={height - 8} textAnchor="middle" fontSize={12} fill="#374151">η（自然参数）</text>
            <text x={18} y={padding.top + innerH / 2} textAnchor="middle" fontSize={12} fill="#374151" transform={`rotate(-90, 18, ${padding.top + innerH / 2})`}>g(η)</text>
            {/* curve */}
            <path d={pathD} fill="none" stroke={info.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function AssumptionCard({ number, title, content }: { number: number; title: string; content: ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-700 mt-1 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function RecipeStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}
