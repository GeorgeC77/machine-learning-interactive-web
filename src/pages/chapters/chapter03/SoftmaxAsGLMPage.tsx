import { useState } from 'react';
import { ShieldAlert, Layers, CheckCircle2, ArrowRight , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function SoftmaxAsGLMPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第三章 · 广义线性模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Softmax 回归作为 GLM</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          多分类问题可以看作伯努利分布向多个类别的推广——多项分布。选择多项分布作为 GLM 的指数族，
          就能导出 Softmax 回归。
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
            content="多项分布"
            detail={String.raw`y \in \{0,1\}^k, \sum y_j = 1`}
            color="amber"
          />
          <FlowArrow />
          <FlowCard
            step={2}
            title="确定响应函数"
            content="Softmax"
            detail={String.raw`\phi_j = \frac{e^{\eta_j}}{\sum_l e^{\eta_l}}`}
            color="emerald"
          />
          <FlowArrow />
          <FlowCard
            step={3}
            title="写出预测函数"
            content="多类概率"
            detail={String.raw`P(y=j|x) = \frac{e^{\theta_j^T x}}{\sum_l e^{\theta_l^T x}}`}
            color="blue"
          />
          <FlowArrow />
          <FlowCard
            step={4}
            title="最大似然"
            content="多分类交叉熵"
            detail={String.raw`-\sum \sum y_j \log \phi_j`}
            color="rose"
          />
        </div>
      </section>

      {/* Interactive softmax demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">交互演示：Softmax 概率</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设有三个类别，分别有三个线性得分 <KaTeX math={String.raw`z_1, z_2, z_3`} />。Softmax 把这些得分转换为概率。
          拖动滑块观察哪个类别的得分高，概率就接近 1。
        </p>
        <SoftmaxExplorer />
      </section>

      {/* Multinomial */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">选择分布：多项分布</h2>
        <p className="text-gray-700 mb-4">
          对于 k 类分类问题，标签用一个 k 维 one-hot 向量表示：
          <KaTeX math={String.raw`y \in \{0, 1\}^k`} />，且 <KaTeX math={String.raw`\sum_{j=1}^{k} y_j = 1`} />。
          多项分布描述这种多元离散结果：
        </p>

        <FormulaCard
          title="多项分布"
          formula={
            <KaTeX
              math={String.raw`p(y; \phi) = \prod_{j=1}^{k} \phi_j^{y_j}`}
              display
            />
          }
          description="φⱼ 是样本属于第 j 类的概率。"
        />

        <p className="text-gray-700 mb-4">
          由于 <KaTeX math={String.raw`\sum_j \phi_j = 1`} />，k 个参数中只有 k−1 个是自由的。我们可以用 k−1 个自然参数表示：
        </p>

        <FormulaCard
          title="自然参数"
          formula={
            <KaTeX
              math={String.raw`\eta_j = \log\frac{\phi_j}{\phi_k}, \quad j = 1, \dots, k-1`}
              display
            />
          }
          description="以第 k 类为参照类别，相当于约定 η_k = 0（即 e^{η_k} = 1）。"
        />
      </section>

      {/* Softmax */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">导出 Softmax 函数</h2>
        <p className="text-gray-700 mb-4">
          从自然参数反解概率 φ，得到：
        </p>

        <FormulaCard
          title="Softmax 概率"
          formula={
            <KaTeX
              math={String.raw`\phi_j = \frac{e^{\eta_j}}{\sum_{l=1}^{k} e^{\eta_l}}`}
              display
            />
          }
          description="这就是 Softmax 函数。分母中的 e^{η_k} = 1 正来自上面的参照类别约定；参数存在冗余：所有 θ_j 同减任意向量，预测概率不变，因此也常固定 θ_k = 0。"
        />

        <p className="text-gray-700 mb-4">
          在 GLM 中，我们假设每一类有自己的参数向量 θⱼ，因此：
        </p>

        <FormulaCard
          title="Softmax 回归假设"
          formula={
            <KaTeX
              math={String.raw`P(y = j \mid x; \theta) = \frac{e^{\theta_j^T x}}{\sum_{l=1}^{k} e^{\theta_l^T x}}`}
              display
            />
          }
          description="每个类别对应一个线性得分 θⱼᵀx，Softmax 把这些得分转换为概率。"
        />
      </section>

      {/* Cross entropy */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">多分类交叉熵损失</h2>
        <p className="text-gray-700 mb-4">
          与逻辑回归类似，Softmax 回归也可以用最大似然估计。对数似然为：
        </p>

        <FormulaCard
          title="Softmax 对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = \sum_{i=1}^{m} \sum_{j=1}^{k} y_j^{(i)} \log P(y^{(i)} = j \mid x^{(i)}; \theta)`}
              display
            />
          }
          description="只有真实类别对应的 yⱼ = 1 才会贡献一项。"
        />

        <p className="text-gray-700 mb-4">
          取负号后得到多分类交叉熵损失：
        </p>

        <FormulaCard
          title="Softmax 代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \sum_{j=1}^{k} y_j^{(i)} \log \frac{e^{\theta_j^T x^{(i)}}}{\sum_{l=1}^{k} e^{\theta_l^T x^{(i)}}}`}
              display
            />
          }
          description="与第二章多分类中的 Softmax 损失一致。"
        />
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-1" />
            <span>Softmax 回归对应 GLM 中的多项分布假设。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-1" />
            <span>自然参数 ηⱼ 是相对于参照类别的 log-odds。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-1" />
            <span>Softmax 函数是多项分布的响应函数，把线性得分转换为类别概率。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function SoftmaxExplorer() {
  const [scores, setScores] = useState([1, 0, -1]);
  const labels = ['类别 1', '类别 2', '类别 3'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b'];

  const expScores = scores.map((s) => Math.exp(s));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probs = expScores.map((e) => e / sumExp);

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="space-y-5 mb-6">
        {scores.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{labels[i]} 得分 z<sub>{i + 1}</sub></span>
              <span className="font-mono text-gray-900">{s.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={s}
              onChange={(e) => {
                const next = [...scores];
                next[i] = Number(e.target.value);
                setScores(next);
              }}
              className="w-full"
              style={{ accentColor: colors[i] }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {probs.map((p, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="text-sm text-gray-500 mb-1">{labels[i]}</div>
            <div className="text-2xl font-bold" style={{ color: colors[i] }}>
              {(p * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full transition-all duration-200"
                style={{ width: `${p * 100}%`, backgroundColor: colors[i] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowCard({ step, title, content, detail, color }: { step: number; title: string; content: string; detail: string; color: 'amber' | 'emerald' | 'blue' | 'rose' }) {
  const colors = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
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
