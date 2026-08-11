import { ShieldAlert, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十一章 · EM 算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">EM 算法</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          期望最大化（EM）算法用于一类含隐变量的最大似然问题。精确 EM 交替执行 E-step 与 M-step，
          在满足可计算性和精确更新等条件时使观测数据对数似然单调不减。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">从 Jensen 不等式与 KL 分解推导 ELBO。</li>
          <li className="rounded-lg border border-gray-200 p-3">推导一维 GMM 的责任度、混合权重、均值与方差更新。</li>
          <li className="rounded-lg border border-gray-200 p-3">说明精确 EM 单调性的条件，以及局部解、奇异点和初始化风险。</li>
          <li className="rounded-lg border border-gray-200 p-3">区分精确 EM、变分 EM 与 VAE 的摊销变分推断。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">11.1 高斯混合模型的 EM</h3>
            <p className="text-sm text-gray-700">
              以高斯混合模型为例，直观理解 E-step 与 M-step 的具体更新公式。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">11.2 Jensen 不等式</h3>
            <p className="text-sm text-gray-700">
              EM 收敛性证明的核心数学工具。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">11.3 一般 EM 算法</h3>
            <p className="text-sm text-gray-700">
              通过证据下界（ELBO）理解一般形式的 EM。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">11.4 高斯混合模型再探</h3>
            <p className="text-sm text-gray-700">
              用一般 EM 框架重新推导高斯混合模型的参数更新。
            </p>
          </div>
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200 md:col-span-2">
            <h3 className="font-semibold text-rose-800 mb-2">11.5 变分推断与变分自编码器（可选）</h3>
            <p className="text-sm text-gray-700">
              将 EM 思想推广到由神经网络参数化的复杂模型，介绍变分自编码器（VAE）的基本思想。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="EM 算法"
          formula={
            <KaTeX
              math={String.raw`\text{E: } Q_i^{(t)}(z) := p\bigl(z|x^{(i)};\theta^{(t)}\bigr) \quad \text{M: } \theta^{(t+1)} := \arg\max_\theta \sum_i \mathbb E_{Q_i^{(t)}}\!\left[\log p\bigl(x^{(i)},z;\theta\bigr)\right]`}
              display
            />
          }
          description="在第 t 轮，E-step 令 Q_i 为 θ^(t) 下的精确后验；M-step 固定 Q_i，选择 θ^(t+1) 最大化期望完全数据对数似然（熵项对 θ 为常数）。"
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
            <span>EM 算法用于含有隐变量的最大似然估计。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>E-step 推断隐变量，M-step 更新模型参数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>精确 E-step 与精确 M-step 配合 ELBO 紧致性，可保证观测对数似然单调不减，但不保证全局最优。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
