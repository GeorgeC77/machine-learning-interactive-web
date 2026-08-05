import { useMemo, useState } from 'react';
import { Layers, Split, FunctionSquare, AlertTriangle, BarChart3, Target } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import InteractiveDemo from '@/components/InteractiveDemo';
import InteractivePanel from '@/components/InteractivePanel';
import { Slider } from '@/components/ui/slider';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const COLOR_DARK = ['#1d4ed8', '#047857', '#b45309'];
const CLASS_LABELS = ['类 1', '类 2', '类 3'];

function softmax(scores: number[]) {
  const maxScore = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - maxScore));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sumExp);
}

export default function MulticlassPage() {
  const [z1, setZ1] = useState(1.0);
  const [z2, setZ2] = useState(0.0);
  const [z3, setZ3] = useState(-0.5);

  const scores = [z1, z2, z3];
  const probs = useMemo(() => softmax(scores), [z1, z2, z3]);
  const predictedClass = probs.indexOf(Math.max(...probs));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第二章 · 分类与逻辑回归
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">多分类与 Softmax 回归</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          当标签不再只有 0/1，而是可以取 K 个离散类别时，Softmax 回归把逻辑回归推广到多分类场景，
          为每个类别输出一个归一化的概率。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* One-vs-all vs Softmax */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Split className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">One-vs-All 与 Softmax</h2>
        </div>

        <p className="text-gray-700 mb-4">
          面对 K 个类别，最直观的想法是训练 K 个独立的二分类器：对第 k 个分类器，把“类 k”当作正类，
          其余所有类统一当作负类。这种方法称为
          <strong> One-vs-All（OvA）</strong>，也叫 One-vs-Rest。
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
            <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              One-vs-All
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>训练 K 个独立的二分类逻辑回归模型。</li>
              <li>每个模型只回答“是否属于类 k”。</li>
              <li>最终取置信度最高的类作为预测结果。</li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <FunctionSquare className="w-5 h-5" />
              Softmax 回归
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>直接建模条件类别分布 <KaTeX math={String.raw`p(y=k \mid x)`} />。</li>
              <li>所有类别的概率天然相加为 1。</li>
              <li>在线性 logits 假设下，交叉熵损失关于参数是凸函数。</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-gray-700 text-sm">
            <strong>什么时候适合用 Softmax？</strong>
            One-vs-All 把每个分类器独立训练，多个二分类器的输出并不保证能拼成一个合法的概率分布；
            而且它在决策时可能忽略类别之间的相互竞争关系。Softmax 把所有类别放在一起比较，
            输出的概率之和恒为 1，更适合类别互斥的“多选一”任务。具体效果仍取决于数据与任务。
          </p>
        </div>

        <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-200 text-sm text-rose-800">
          <strong>注意：</strong>如果数据线性可分且没有正则化，Softmax 的最大似然估计同样可能不存在有限最优解。
          加入正则化或提前停止可以缓解这一问题。
        </div>
      </section>

      {/* Softmax Function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FunctionSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Softmax 函数</h2>
        </div>

        <p className="text-gray-700 mb-4">
          对于输入样本 x，我们为每个类别 k 计算一个线性分数（logit）
          <KaTeX math={String.raw`z_k = \theta_k^\top x`} />，然后用 Softmax 把这些分数转换成概率。
        </p>

        <FormulaCard
          title="Softmax 概率"
          formula={
            <KaTeX
              math={String.raw`p(y = k \mid x) = \frac{\exp(\theta_k^\top x)}{\sum_{j=1}^{K} \exp(\theta_j^\top x)}`}
              display
            />
          }
          description="K 是类别总数，θ_k 是第 k 类的参数向量。分子让分数高的类别获得更大的概率，分母保证所有概率之和为 1。"
        />

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">概率归一化</h4>
            <p className="text-gray-700 text-sm">
              <KaTeX math={String.raw`\sum_{k=1}^{K} p(y = k \mid x) = 1`} />
              ，且每个概率都在 (0, 1) 之间。
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">放大差异</h4>
            <p className="text-gray-700 text-sm">
              指数函数会放大分数之间的差距；分数最高的类别会获得绝对优势的概率。
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">预测规则</h4>
            <p className="text-gray-700 text-sm">
              选择概率最大的类别：
              <KaTeX math={String.raw`\hat{y} = \arg\max_k \, p(y = k \mid x)`} />。
            </p>
          </div>
        </div>
      </section>

      {/* Softmax Cost Function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">Softmax 代价函数</h2>
        </div>

        <p className="text-gray-700 mb-4">
          Softmax 回归使用<strong>交叉熵损失</strong>（Cross-Entropy Loss）来衡量预测概率分布与真实标签之间的差异。
          对于单个样本，损失只关注真实类别对应的那个概率。
        </p>

        <FormulaCard
          title="单个样本的交叉熵损失"
          formula={
            <KaTeX
              math={String.raw`\mathrm{Cost}(h_\theta(x), y) = -\sum_{k=1}^{K} \mathbf{1}\{y = k\} \log p(y = k \mid x)`}
              display
            />
          }
          description="其中 1{y = k} 是指示函数：当样本真实标签为 k 时取 1，否则取 0。因此只有真实类别对应的概率进入损失。"
        />

        <p className="text-gray-700 mt-4 mb-4">
          对整个训练集（共 m 个样本）求平均，得到完整的 Softmax 代价函数：
        </p>

        <FormulaCard
          title="Softmax 回归的代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \sum_{k=1}^{K} \mathbf{1}\{y^{(i)} = k\} \log p(y^{(i)} = k \mid x^{(i)})`}
              display
            />
          }
          description="最小化 J(θ) 等价于让模型输出的概率分布尽可能接近真实标签的 one-hot 分布，也等价于多项分布的最大似然估计。"
        />

        <p className="text-gray-700 mt-4 mb-4">
          对每个类别的参数向量 <em>θ_k</em> 求梯度，可得到与二分类同样简洁的形式：
        </p>

        <FormulaCard
          title="Softmax 代价函数的梯度"
          formula={
            <KaTeX
              math={String.raw`\nabla_{\theta_k} J(\theta) = \frac{1}{m} \sum_{i=1}^{m} \bigl(p(y^{(i)} = k \mid x^{(i)}) - \mathbf{1}\{y^{(i)} = k\}\bigr) \, x^{(i)}`}
              display
            />
          }
          description="预测概率与 one-hot 标签之差乘以特征向量——这正是二分类梯度 (h_θ(x) − y)x 的多分类推广。"
        />

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <h4 className="font-semibold text-rose-800 mb-2">直观理解</h4>
            <p className="text-gray-700 text-sm">
              如果真实类别是 k，模型却把 <KaTeX math={String.raw`p(y = k \mid x)`} /> 预测得很小，
              那么 <KaTeX math={String.raw`-\log p`} /> 会急剧增大，从而对该错误进行强烈惩罚。
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">凸性保证</h4>
            <p className="text-gray-700 text-sm">
              与二分类逻辑回归类似，在线性 logits 假设下，Softmax 的交叉熵代价函数关于参数是凸函数；
              当有限最优解存在或加入正则化时，梯度下降可以稳定收敛到全局最优解。
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveDemo title="交互演示：3 类 Softmax 概率">
        <p className="text-gray-700 mb-4">
          下面有三个类别的分数（logits）<KaTeX math={String.raw`z_k = \theta_k^\top x`} />。
          拖动滑块改变它们的相对大小，观察 Softmax 如何把任意实数分数转换为相加为 1 的概率。
        </p>

        <InteractivePanel
          hint="提示：分数的相对大小决定概率分布。当某个分数明显高于其它分数时，它会获得接近 1 的概率。"
          chart={
            <div className="w-full">
              <svg viewBox="0 0 480 260" className="w-full h-auto" style={{ maxHeight: 320 }}>
                {/* Background grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <line
                    key={t}
                    x1={50}
                    y1={220 - t * 180}
                    x2={430}
                    y2={220 - t * 180}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Axes */}
                <line x1={50} y1={220} x2={430} y2={220} stroke="#374151" strokeWidth={2} />
                <line x1={50} y1={40} x2={50} y2={220} stroke="#374151" strokeWidth={2} />

                {/* Y-axis ticks */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <text
                    key={t}
                    x={40}
                    y={220 - t * 180 + 4}
                    textAnchor="end"
                    fontSize={11}
                    fill="#6b7280"
                  >
                    {t.toFixed(2)}
                  </text>
                ))}

                <text
                  x={20}
                  y={130}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#374151"
                  fontWeight={600}
                  transform="rotate(-90, 20, 130)"
                >
                  概率
                </text>

                {/* Bars */}
                {probs.map((p, idx) => {
                  const barHeight = p * 180;
                  const x = 90 + idx * 120;
                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={220 - barHeight}
                        width={80}
                        height={barHeight}
                        fill={COLORS[idx]}
                        stroke={COLOR_DARK[idx]}
                        strokeWidth={2}
                        rx={6}
                        opacity={0.9}
                      />
                      <text
                        x={x + 40}
                        y={220 - barHeight - 10}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={700}
                        fill={COLOR_DARK[idx]}
                      >
                        {(p * 100).toFixed(1)}%
                      </text>
                      <text
                        x={x + 40}
                        y={240}
                        textAnchor="middle"
                        fontSize={12}
                        fill="#374151"
                        fontWeight={600}
                      >
                        {CLASS_LABELS[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800 font-semibold">
                    当前预测：{CLASS_LABELS[predictedClass]}（概率 {(probs[predictedClass] * 100).toFixed(1)}%）
                  </span>
                </div>
              </div>
            </div>
          }
          controls={
            <div className="space-y-6">
              {[z1, z2, z3].map((z, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    类 {idx + 1} 分数{' '}
                    <KaTeX math={String.raw`z_${idx + 1}`} /> ={' '}
                    <span className="text-blue-700 font-mono">{z.toFixed(1)}</span>
                  </label>
                  <Slider
                    value={[z]}
                    onValueChange={(v) => {
                      if (idx === 0) setZ1(v[0]);
                      else if (idx === 1) setZ2(v[0]);
                      else setZ3(v[0]);
                    }}
                    min={-5}
                    max={5}
                    step={0.1}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    类 {idx + 1} 的 logits（线性分数）
                  </p>
                </div>
              ))}

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold mb-1">Softmax 输出</p>
                <div className="space-y-1 text-sm text-gray-700 font-mono">
                  {probs.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>p(y = {idx + 1} | x)</span>
                      <span>{p.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  三者之和：{probs.reduce((a, b) => a + b, 0).toFixed(4)}
                </p>
              </div>
            </div>
          }
        />

        <div className="mt-6 bg-indigo-50 rounded-lg border border-indigo-200 p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">观察要点</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold mt-0.5">1.</span>
              <span>
                当三个分数相等时，每个类别的概率都接近 <KaTeX math={String.raw`1/3`} />，模型最“不确定”。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold mt-0.5">2.</span>
              <span>
                当某个分数比其它分数大很多时，对应的概率会迅速接近 1，其余概率接近 0。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold mt-0.5">3.</span>
              <span>
                只有分数的相对差异重要：给所有分数同时加上同一个常数，Softmax 输出不变。
              </span>
            </li>
          </ul>
        </div>
      </InteractiveDemo>

      {/* Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">小结</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">1.</span>
            <p className="text-gray-700">
              Softmax 回归是逻辑回归在多分类问题上的自然推广，直接输出条件类别分布 <KaTeX math={String.raw`p(y=k \mid x)`} />。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">2.</span>
            <p className="text-gray-700">
              Softmax 函数 <KaTeX math={String.raw`p(y = k \mid x) = \exp(\theta_k^\top x) / \sum_j \exp(\theta_j^\top x)`} />{' '}
              把任意实数 logits 归一化为概率，且所有概率之和为 1。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">3.</span>
            <p className="text-gray-700">
              Softmax 使用多类交叉熵作为代价函数，等价于多项分布的最大似然估计；在线性 logits 假设下，代价函数关于参数是凸函数，当有限最优解存在或加入正则化时，梯度下降可以稳定收敛到全局最优解。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">4.</span>
            <p className="text-gray-700">
              相比 One-vs-All，Softmax 把 K 个类别放在一起建模，输出的概率更具可比性；在类别互斥的多分类任务中通常是更自然的选择。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
