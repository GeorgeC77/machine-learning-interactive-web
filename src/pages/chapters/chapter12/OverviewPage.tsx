import { ShieldAlert, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十二章 · 主成分分析
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">主成分分析</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          主成分分析（PCA）是一种经典的无监督线性降维方法。它先中心化数值特征，再寻找方差最大的正交方向，
          将数据压缩到低维子空间；尺度选择、异常值和非线性结构会直接影响结果。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">区分中心化、标准化，以及协方差矩阵 PCA 与相关矩阵 PCA。</li>
          <li className="rounded-lg border border-gray-200 p-3">从 Rayleigh 商推导主成分方向与投影方差。</li>
          <li className="rounded-lg border border-gray-200 p-3">计算解释方差比例、低维坐标和重构误差。</li>
          <li className="rounded-lg border border-gray-200 p-3">识别符号不唯一、尺度敏感、异常值敏感和线性假设等边界。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">12.1 主成分分析</h3>
            <p className="text-sm text-gray-700">
              从降维动机出发，介绍预处理、最大化投影方差、特征分解、低维编码、重构与成分数选择。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">交互演示</h3>
            <p className="text-sm text-gray-700">
              在二维相关数据上实时计算主成分，比较 PCA 方向与任意手动方向的投影方差。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="PCA 优化目标"
          formula={
            <KaTeX
              math={String.raw`\max_{\|u\|_2=1} u^T \Sigma u,\qquad \Sigma = \frac{1}{n}\sum_{i=1}^n x_c^{(i)}(x_c^{(i)})^T`}
              display
            />
          }
          description="其中 x_c^(i)=x^(i)−μ。最优方向 u 是 Σ 最大特征值对应的单位特征向量；u 与 −u 表示同一条主轴。"
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
            <span>PCA 是基于中心化数值数据的无监督线性降维方法。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>主成分是协方差矩阵的单位特征向量，并按特征值从大到小排序。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在正交线性投影中，前 k 个主成分同时最大化保留方差并最小化平方重构误差。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
