import { Link } from 'react-router-dom';
import { Brain, Calculator, ShieldAlert, ArrowRight, Scale } from 'lucide-react';

const roadmapItems = [
  { label: '生成式 vs 判别式', path: '/ch04/generative-vs-discriminative', icon: Scale, desc: '两种建模思路的本质区别', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { label: '高斯判别分析', path: '/ch04/gaussian-discriminant-analysis', icon: Calculator, desc: '假设每类数据服从多元高斯', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: '朴素贝叶斯', path: '/ch04/naive-bayes', icon: Brain, desc: '条件独立性假设与文本分类', color: 'bg-violet-100 text-violet-700 border-violet-300' },
];

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <Scale className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          生成学习算法：从数据分布出发进行分类
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          与逻辑回归等判别式方法不同，生成学习算法会对每个类别的数据分布建模，
          然后通过贝叶斯定理推断类别。我们将学习高斯判别分析（GDA）和朴素贝叶斯。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Generative vs Discriminative */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">生成式 vs 判别式</h2>
        <p className="text-gray-700 mb-4">
          在监督学习中，我们要建模 <strong>p(y | x)</strong>，即给定输入 x 时标签 y 的条件概率。
          判别式方法直接学习这个条件分布；生成式方法则反过来，分别学习 <strong>p(x | y)</strong> 和 <strong>p(y)</strong>，再用贝叶斯定理得到 p(y | x)。
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">判别式方法</h3>
            <p className="text-sm text-gray-700">
              直接建模决策边界。例如逻辑回归、Softmax 回归。
              优点：直接优化分类目标，数据充足时通常能达到更低的渐近误差、更高的分类准确率。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">生成式方法</h3>
            <p className="text-sm text-gray-700">
              建模每类数据的分布。例如 GDA、朴素贝叶斯。
              优点：可以生成新样本、处理缺失数据、在小数据上有时更有优势。
            </p>
          </div>
        </div>
      </section>

      {/* Chapter roadmap */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">本章学习路线</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {roadmapItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col p-5 rounded-xl border ${item.color.replace('bg-', 'border-').split(' ')[2]} bg-white hover:shadow-sm transition-all`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${item.color.split(' ')[0]} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color.split(' ')[1]}`} />
                </div>
                <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-grow">{item.desc}</p>
              <div className="flex items-center text-sm font-medium text-blue-600">
                开始学习 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">学习提示</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          生成模型和判别模型各有千秋。理解它们的区别，能帮助你在实际问题上做出更好的建模选择：
          当你只关心分类准确率且数据充足时，判别式方法往往更直接；当你需要理解数据如何产生、或者数据较少时，生成式方法可能更合适。
        </p>
      </section>
    </div>
  );
}
