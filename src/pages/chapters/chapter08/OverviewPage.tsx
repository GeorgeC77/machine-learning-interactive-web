import { ShieldAlert, BookOpen, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第八章 · 泛化
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">泛化</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          训练误差最小化只是手段，真正的目标是让模型在未见过的新数据上表现良好。
          本章介绍偏差-方差权衡、过拟合与欠拟合，以及现代深度学习中的双下降现象。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么泛化重要？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          机器学习模型通过最小化训练损失来学习参数。然而，训练误差小并不保证测试误差也小。
          当模型在训练集上表现很好、但在测试集上表现很差时，我们称它发生了<strong>过拟合</strong>；
          当模型连训练集都无法很好拟合时，我们称它发生了<strong>欠拟合</strong>。
        </p>
        <p className="text-gray-700 mb-4">
          理论上的泛化误差是对未知数据分布取期望；有限测试集只能给出它的独立估计。
          测试集不应参与模型选择，否则这个估计也会产生乐观偏差，模型选择应使用独立验证集或交叉验证。
        </p>

        <FormulaCard
          title="期望风险（泛化误差）"
          formula={
            <KaTeX
              math={String.raw`R(\theta) = \mathbb{E}_{(x,y)\sim D}\left[\bigl(y - h_\theta(x)\bigr)^2\right],\qquad
              \hat R_S(\theta)=\frac1n\sum_{i=1}^{n}\bigl(y_i-h_\theta(x_i)\bigr)^2`}
              display
            />
          }
          description="R 是未知分布上的期望风险，R̂ 是给定样本上的经验风险。泛化研究二者的差距；独立测试误差是 R 的有限样本估计。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">完成本章后，你应该能够</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">区分期望风险、训练误差、验证误差与独立测试误差。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">在平方损失假设下解释噪声、偏差²与方差的分解。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">识别插值阈值，并说明双下降不是所有模型上的普遍保证。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">从 Hoeffding 不等式和联合界推导有限假设类的样本复杂度。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">本章内容</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">偏差-方差权衡</h3>
            <p className="text-sm text-gray-700">
              把平方损失下的期望预测误差分解为偏差、方差与不可约噪声，理解模型复杂度如何影响泛化。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">双下降现象</h3>
            <p className="text-sm text-gray-700">
              当模型参数超过样本数后，测试误差可能再次下降，挑战经典的 U 型曲线。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">样本复杂度</h3>
            <p className="text-sm text-gray-700">
              用 Hoeffding 不等式与联合界等工具，定量刻画训练样本数与泛化误差的关系。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>泛化能力指模型在未见过数据上的表现。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>过拟合：训练误差小，测试误差大；欠拟合：训练误差也大。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>偏差-方差权衡帮助我们理解并选择合适的模型复杂度。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
