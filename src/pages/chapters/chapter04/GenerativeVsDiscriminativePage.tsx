import { useState } from 'react';
import { ShieldAlert, Scale, CheckCircle2, Circle, Check, X } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function GenerativeVsDiscriminativePage() {
  const [mode, setMode] = useState<'discriminative' | 'generative'>('discriminative');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第四章 · 生成学习算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">生成式 vs 判别式</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          监督学习有两条主要路线：直接学习 p(y|x)，或者分别学习 p(x|y) 和 p(y)。
          理解它们的区别是选择合适模型的第一步。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Core distinction */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">核心区别</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设我们有一个二分类问题，要判断肿瘤是良性（y=0）还是恶性（y=1）。两类方法的区别在于：
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">判别式：直接求 p(y|x)</h3>
            <p className="text-sm text-gray-700">
              直接学习"给定特征后属于哪一类"。
              例如逻辑回归直接估计 <KaTeX math={String.raw`P(y=1 \mid x)`} />。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">生成式：通过 p(x|y)p(y) 求 p(y|x)</h3>
            <p className="text-sm text-gray-700">
              分别学习"良性肿瘤长什么样"和"恶性肿瘤长什么样"，再用贝叶斯定理推断。
            </p>
          </div>
        </div>

        <FormulaCard
          title="贝叶斯定理"
          formula={
            <KaTeX
              math={String.raw`p(y \mid x) = \frac{p(x \mid y) \, p(y)}{p(x)}`}
              display
            />
          }
          description="生成式方法建模 p(x|y) 和 p(y)，然后通过贝叶斯定理得到 p(y|x)。"
          className="mt-6"
        />
      </section>

      {/* Interactive comparison */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互对比：两种建模思路</h2>
        <p className="text-gray-700 mb-4">
          点击切换，看看判别式和生成式分别是如何回答"这个样本属于哪一类"这个问题的。
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('discriminative')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'discriminative'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            判别式思路
          </button>
          <button
            onClick={() => setMode('generative')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'generative'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            生成式思路
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          {mode === 'discriminative' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">1</div>
                <p className="text-gray-700">收集大量带标签数据。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
                <p className="text-gray-700">直接学习 <KaTeX math={String.raw`p(y \mid x)`} />，例如用 Sigmoid 输出概率。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">3</div>
                <p className="text-gray-700">对新样本直接输出类别概率。</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                <strong>特点：</strong>关注点只在决策边界，不关心每类数据具体如何生成。
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">1</div>
                <p className="text-gray-700">对每个类别分别建模 <KaTeX math={String.raw`p(x \mid y)`} />。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">2</div>
                <p className="text-gray-700">估计每类的先验概率 <KaTeX math={String.raw`p(y)`} />。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">3</div>
                <p className="text-gray-700">用贝叶斯定理计算 <KaTeX math={String.raw`p(y \mid x)`} />。</p>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-emerald-800">
                <strong>特点：</strong>不仅分类，还能描述每类数据的分布，甚至可以生成新样本。
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pros and cons */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">优缺点对比</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-blue-800 mb-3">判别式方法</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>通常分类准确率更高，尤其在大数据上。</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>模型更直接，训练和调参相对简单。</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500" />
                <span>通常不能直接生成数据；处理缺失特征往往需要插补、缺失指示变量或专门设计的模型。</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 mb-3">生成式方法</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>可以生成新样本，解释性更强。</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>小数据或半监督场景下可能更有优势。</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-500" />
                <span>需要正确假设数据分布，否则效果不佳。</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>判别式直接学习 p(y|x)，生成式通过 p(x|y)p(y) 间接得到 p(y|x)。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>贝叶斯定理是连接生成式假设与最终分类决策的桥梁。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>接下来两节将分别介绍连续特征上的 GDA 和离散特征上的朴素贝叶斯。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
