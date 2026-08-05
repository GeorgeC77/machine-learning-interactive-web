import { Link } from 'react-router-dom';
import { LineChart, FunctionSquare, Sparkles, Layers, ShieldAlert, ArrowRight, GitBranch } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

const roadmapItems = [
  { label: '指数族分布', path: '/ch03/exponential-family', icon: FunctionSquare, desc: '统一描述多种概率分布', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { label: '构建 GLM', path: '/ch03/building-glm', icon: Sparkles, desc: '三个假设与一般形式', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: '最小二乘作为 GLM', path: '/ch03/ols-as-glm', icon: LineChart, desc: '高斯分布导出线性回归', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { label: '逻辑回归作为 GLM', path: '/ch03/logistic-as-glm', icon: GitBranch, desc: '伯努利分布导出 sigmoid', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { label: 'Softmax 作为 GLM', path: '/ch03/softmax-as-glm', icon: Layers, desc: '多项分布导出多分类', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          广义线性模型：统一回归与分类的框架
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          广义线性模型（GLM）把线性回归、逻辑回归、Softmax 回归等不同算法纳入同一个理论框架。
          通过指数族分布和三个简单假设，我们能系统理解这些模型之间的联系。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* What is GLM */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么要学 GLM？</h2>
        <p className="text-gray-700 mb-4">
          在前两章中，我们分别学习了线性回归和逻辑回归。它们看起来很不相同：一个预测连续值，一个预测离散类别；一个用平方误差，一个用交叉熵。
          但 GLM 揭示了一个惊人的事实：它们只是同一套框架下的不同选择。
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">统一视角</h3>
            <p className="text-sm text-gray-700">
              线性回归、逻辑回归、Softmax 回归、泊松回归等都可以看作 GLM 的特例，只需选择不同的指数族分布。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">系统设计</h3>
            <p className="text-sm text-gray-700">
              面对新问题时，GLM 告诉我们如何根据响应变量的类型选择模型，而不是死记硬背算法公式。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">理论优雅</h3>
            <p className="text-sm text-gray-700">
              三个简洁假设就能导出参数估计、优化目标和推断方法，大量减少记忆负担。
            </p>
          </div>
        </div>

        <FormulaCard
          title="GLM 的核心形式"
          formula={
            <KaTeX
              math={String.raw`p(y; \eta) = b(y) \exp\bigl(\eta^T T(y) - a(\eta)\bigr)`}
              display
            />
          }
          description="指数族分布是 GLM 的基石。通过选择不同的充分统计量 T(y)、对数配分函数 a(η) 和基准函数 b(y)，我们可以得到高斯、伯努利、泊松、多项等多种分布。"
        />
      </section>

      {/* Three assumptions */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">GLM 的三个假设</h2>
        <p className="text-gray-700 mb-4">
          给定输入 x 和参数 θ，GLM 对响应变量 y 的分布做出以下三个假设：
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-gray-900">y | x; θ 服从指数族分布</h3>
              <p className="text-sm text-gray-700 mt-1">
                响应变量的条件分布属于某个指数族，自然参数 η 可能与 x 和 θ 有关。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-gray-900">给定 x，目标是预测 T(y) 的期望</h3>
              <p className="text-sm text-gray-700 mt-1">
                模型的输出 h(x) = E[T(y) | x; θ]。对于普通回归 T(y)=y；对于分类问题 T(y) 是指示向量。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-gray-900">自然参数 η 与输入线性相关</h3>
              <p className="text-sm text-gray-700 mt-1">
                η = θᵀx。这是"线性"二字的来源：即使输出经过非线性响应函数变换，对自然参数的建模仍是线性的。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">本章学习路线</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          GLM 是连接前面章节的重要桥梁。学完本章后，你会发现线性回归和逻辑回归不再是两个孤立的算法，
          而是同一套设计原则在不同分布假设下的自然产物。这种统一视角也是理解更高级模型（如神经网络、概率图模型）的基础。
        </p>
      </section>
    </div>
  );
}
