import { ShieldAlert, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十四章 · 自监督学习与基础模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">自监督学习与基础模型</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          本章介绍“广泛数据上的预训练 + 面向任务的适配”范式。自监督学习是重要的预训练方式，但基础模型也可能结合监督、弱监督与偏好数据；
          我们将讨论视觉对比学习和自回归语言模型，并明确评估、数据泄漏与部署边界。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">区分自监督预训练、监督预训练与下游适配。</li>
          <li className="rounded-lg border border-gray-200 p-3">比较线性探测、全量微调、参数高效微调与上下文学习。</li>
          <li className="rounded-lg border border-gray-200 p-3">写出对称 NT-Xent 与自回归 next-token 交叉熵目标。</li>
          <li className="rounded-lg border border-gray-200 p-3">识别增强假设、分布偏移、数据泄漏、生成不可靠性与计算成本。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">14.1 预训练与适配</h3>
            <p className="text-sm text-gray-700">预训练范式、线性探测、全量与参数高效微调、提示适配及可靠评估。</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">14.2 计算机视觉中的预训练</h3>
            <p className="text-sm text-gray-700">监督预训练、数据增强、归一化表示与对称 SimCLR/NT-Xent 损失。</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">14.3 预训练大语言模型</h3>
            <p className="text-sm text-gray-700">因果 Transformer、token 交叉熵、困惑度、解码温度与适配边界。</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="预训练 + 适配"
          formula={
            <KaTeX
              math={String.raw`\hat\theta\in\arg\min_\theta\;\mathbb E_{x\sim\mathcal D_{\rm pre},\,\xi\sim\mathcal A}\!\left[\ell_{\rm pre}(\theta;x,\xi)\right]`}
              display
            />
          }
          description="ξ 表示遮盖、增强或目标构造等随机机制。预训练后可冻结表示、微调参数、训练小型适配模块或通过提示使用模型；具体选择取决于任务与约束。"
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
            <span>基础模型在广泛数据上预训练，再通过训练或提示等方式适配到下游任务。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>视觉对比学习依赖增强定义的“不变性”，错误增强和 false negatives 会改变学习目标。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>自回归语言模型通过因果 next-token 预测训练，但预测高概率 token 不等于保证事实正确。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
