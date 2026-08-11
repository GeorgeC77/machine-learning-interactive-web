import { ShieldAlert, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十章 · 聚类
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">聚类与 K-means 算法</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          聚类是无监督学习中最基础的问题之一：在没有标签的情况下，把数据分成若干组，
          使组内样本在选定的表示与距离下较为相似。K-means 通过交替优化平方欧氏距离目标来构造这种划分。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">学习目标</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-3">写出 K-means 目标函数，并解释分配与更新两个步骤。</li>
          <li className="rounded-lg border border-gray-200 p-3">说明目标单调不增的条件，以及局部最优和初始化依赖。</li>
          <li className="rounded-lg border border-gray-200 p-3">识别特征缩放、异常值和簇形状对结果的影响。</li>
          <li className="rounded-lg border border-gray-200 p-3">用业务约束、肘部法或轮廓系数辅助选择 K，并谨慎解释聚类。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">本章内容</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">10.1 K-means 算法</h3>
            <p className="text-sm text-gray-700">
              用 K-means++ 或样本点初始化质心，反复执行分配与更新，直到稳定。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">失真函数</h3>
            <p className="text-sm text-gray-700">
              K-means 目标是最小化每个样本到其所属质心的距离平方和。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">坐标下降视角</h3>
            <p className="text-sm text-gray-700">
              把簇分配视为离散变量、质心视为连续变量，交替精确优化两个变量块。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">局部最优</h3>
            <p className="text-sm text-gray-700">
              结果依赖初始化；K-means++ 与多次启动可降低得到较差局部解的风险，但不能保证全局最优。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <FormulaCard
          title="失真函数"
          formula={
            <KaTeX
              math={String.raw`J(c, \mu) = \sum_{i=1}^n \bigl\|x^{(i)} - \mu_{c^{(i)}}\bigr\|^2`}
              display
            />
          }
          description="其中 c^(i)∈{1,…,K} 是第 i 个样本的簇编号，μ_j 是第 j 个质心。在固定平局与空簇规则下，每个有效步骤都使 J 单调不增。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">何时适合使用 K-means？</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-800 mb-2">较适合</h3>
            <p>数值特征可用欧氏距离比较，簇大致紧凑、凸且尺度相近，并且 K 有合理先验或可解释的候选范围。</p>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <h3 className="font-semibold text-rose-800 mb-2">需谨慎</h3>
            <p>不同量纲未缩放、存在明显异常值、簇呈非凸形状或密度差异很大时，平方距离目标可能给出误导性划分。</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          肘部法和轮廓系数只是选择 K 的诊断工具，不会自动发现唯一“真实”类别；最终划分还应结合稳定性、领域知识与使用目的评估。
        </p>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>聚类结果取决于数据表示、距离度量与算法假设，并不天然等同于真实类别。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>K-means 通过分配和更新两个步骤迭代优化失真函数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>算法可能收敛到局部解；特征缩放、K-means++ 和多次启动都是实践中的关键步骤。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
