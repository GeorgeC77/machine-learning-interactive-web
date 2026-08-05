import { ShieldAlert, BookOpen, CheckCircle2 , Circle} from 'lucide-react';
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
          并通过最大化非高斯性来恢复这些源信号。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
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
              鸡尾酒会问题、ICA 的不确定性、线性变换下的密度、最大似然估计与梯度上升算法。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">交互演示</h3>
            <p className="text-sm text-gray-700">
              在二维非高斯源数据上实时运行 ICA 梯度上升，观察混合信号如何被逐步分离。
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
              math={String.raw`x^{(i)} = A s^{(i)}, \quad s^{(i)} = W x^{(i)}`}
              display
            />
          }
          description="寻找解混矩阵 W，使得恢复出的各分量尽可能统计独立。"
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
            <span>ICA 用于盲源分离，目标是恢复统计独立的源信号。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>ICA 要求独立源中至多一个为高斯分布；多于一个高斯源时旋转不确定性使源不可识别。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>通过最大化似然，可以得到解混矩阵 W 的梯度上升更新规则。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
