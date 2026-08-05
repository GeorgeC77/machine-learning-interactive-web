import { ShieldAlert, TrendingDown, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function LMSInFeatureSpacePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第五章 · 核方法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">特征空间中的 LMS</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          一旦数据被映射到高维特征空间，我们就可以在这个新空间中应用线性算法。
          LMS（最小均方）算法在特征空间中的形式与原始空间几乎完全相同。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Feature space linear model */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">在特征空间中建立线性模型</h2>
        </div>
        <p className="text-gray-700 mb-4">
          设特征映射为 <KaTeX math={String.raw`\phi(x)`} />，则在特征空间中的线性预测为：
        </p>

        <FormulaCard
          title="特征空间中的假设函数"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = \theta^T \phi(x) = \sum_{j=1}^{p} \theta_j \phi_j(x)`}
              display
            />
          }
          description="其中 p 表示特征空间 φ(x) 的维度——它可以远大于输入维度 n，甚至无穷大。"
        />

        <p className="text-gray-700 mb-4">
          与原始空间一样，我们可以定义平方误差代价函数：
        </p>

        <FormulaCard
          title="代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = \frac{1}{2} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr)^2`}
              display
            />
          }
          description="这里的 x 已被 φ(x) 替换，但形式不变。"
        />
      </section>

      {/* LMS update */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">LMS 更新规则</h2>
        <p className="text-gray-700 mb-4">
          梯度下降的更新规则只是把 x 换成 φ(x)：
        </p>

        <FormulaCard
          title="批量梯度下降"
          formula={
            <KaTeX
              math={String.raw`\theta := \theta - \alpha \sum_{i=1}^{m} \bigl(\theta^T \phi(x^{(i)}) - y^{(i)}\bigr) \phi(x^{(i)})`}
              display
            />
          }
          description="每次更新都遍历所有样本，用特征空间中的梯度下降。"
        />

        <FormulaCard
          title="随机梯度下降"
          formula={
            <KaTeX
              math={String.raw`\theta := \theta - \alpha \bigl(\theta^T \phi(x^{(i)}) - y^{(i)}\bigr) \phi(x^{(i)})`}
              display
            />
          }
          description="每次只用一个样本更新参数，适合大规模数据。"
        />
      </section>

      {/* The problem */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">维度问题</h2>
        <p className="text-gray-700 mb-4">
          特征映射虽然强大，但会带来一个严重问题：当特征空间维度很高时，
          参数 <KaTeX math={String.raw`\theta`} /> 的维度也会变得非常大，计算和存储成本急剧上升。
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h3 className="font-semibold text-rose-800 mb-2">多项式映射的维度爆炸</h3>
            <p className="text-sm text-gray-700">
              d 次多项式映射下，n 维输入的特征维度约为 O(n^d)。
              例如 100 维输入做三次多项式映射，特征维度可达约 17.7 万（C(103,3) = 176851）。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">核技巧的动机</h3>
            <p className="text-sm text-gray-700">
              下一节将介绍核技巧：不直接计算 φ(x)，而是通过核函数隐式地计算高维内积，
              从而避免维度爆炸。
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>特征空间中的 LMS 与原始空间形式相同，只是把 x 替换为 φ(x)。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>特征映射可能带来维度爆炸问题。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-1" />
            <span>核技巧可以在不显式计算高维特征的情况下完成训练。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
