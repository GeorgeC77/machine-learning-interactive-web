import { ShieldAlert, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十三章 · 独立成分分析
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">独立成分分析</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          独立成分分析（ICA）是一类盲源分离方法。它假设观测信号是若干统计独立源信号的线性混合，
          并利用非高斯性恢复源信号；该结论依赖独立性、混合矩阵秩和“至多一个高斯源”等可辨识条件。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">区分不相关与统计独立，并比较 PCA 和 ICA 的目标。</li>
          <li className="rounded-lg border border-gray-200 p-3">说明排列、符号与尺度不确定性，以及 ICA 的可辨识条件。</li>
          <li className="rounded-lg border border-gray-200 p-3">从密度变换推导 ICA 似然中的行列式项。</li>
          <li className="rounded-lg border border-gray-200 p-3">理解中心化、白化和 FastICA 固定点更新的作用。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">13.1 独立成分分析</h3>
            <p className="text-sm text-gray-700">
              鸡尾酒会问题、可辨识性、密度变换、最大似然、白化与 FastICA 固定点算法。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">交互演示</h3>
            <p className="text-sm text-gray-700">
              在二维非高斯源数据上实时运行白化 FastICA，并用排列、符号和尺度不变的相关指标衡量分离质量。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="ICA 观测模型"
          formula={
            <KaTeX
              math={String.raw`x_c^{(i)}=A s^{(i)},\qquad \hat s^{(i)}=W x_c^{(i)}`}
              display
            />
          }
          description="在理想方阵、无噪声且 A 可逆时 W=A⁻¹；实际估计只在源的排列、非零尺度与符号变换意义下可恢复。"
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
            <span>ICA 用于盲源分离，目标是恢复统计独立而不只是互不相关的分量。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>ICA 要求独立源中至多一个为高斯分布；多于一个高斯源时旋转不确定性使源不可识别。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>中心化和白化简化了解混问题；FastICA 用非高斯性对比函数进行固定点迭代。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
