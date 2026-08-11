import { ShieldAlert, BookOpen, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第九章 · 正则化与模型选择
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">正则化与模型选择</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          正则化是控制模型复杂度、缓解过拟合的核心技术；模型选择帮助我们依据验证数据选择合适的偏差—方差折中。
          本章还将介绍优化器带来的隐式正则化，以及贝叶斯视角下的正则化解释。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">区分 L1、L2 正则项的作用，并正确解释正则强度 λ。</li>
          <li className="rounded-lg border border-gray-200 p-3">理解训练算法可能产生隐式偏好，而非只改变收敛速度。</li>
          <li className="rounded-lg border border-gray-200 p-3">用交叉验证选择模型，并把最终测试集保持独立。</li>
          <li className="rounded-lg border border-gray-200 p-3">说明线性高斯模型中 MAP 与 L2 正则化的对应条件。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">9.1 正则化</h3>
            <p className="text-sm text-gray-700">
              在损失函数中加入正则项，通过 L2（权重衰减）、L1（稀疏性）等方式控制模型复杂度。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">9.2 隐式正则化</h3>
            <p className="text-sm text-gray-700">
              优化器、学习率、批量大小等训练超参数本身也会影响模型找到的解，带来隐式偏好。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">9.3 交叉验证</h3>
            <p className="text-sm text-gray-700">
              用留出法、k 折交叉验证和留一法估计验证表现、选择模型复杂度，并用独立测试集做最终评估。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">9.4 贝叶斯视角</h3>
            <p className="text-sm text-gray-700">
              从先验分布到 MAP 估计，理解在线性高斯模型和一致缩放下，高斯系数先验如何导出 L2 正则项。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="正则化损失函数"
          formula={
            <KaTeX
              math={String.raw`J_{\text{reg}}(\theta) = J(\theta) + \lambda R(\theta)`}
              display
            />
          }
          description="通过正则项 R(θ) 表达对模型复杂度的偏好；λ 控制数据拟合与正则约束的权衡，通常应由验证数据而非测试集选择。"
        />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>正则化通过惩罚模型复杂度来缓解过拟合。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>训练过程中的优化器选择也会带来隐式正则化效应。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>交叉验证提供了一种数据驱动的模型选择方法。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在 MAP 框架和匹配的似然、先验、损失缩放下，部分显式正则项可解释为负对数先验。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
