import { Link } from 'react-router-dom';
import { Map, TrendingDown, Sparkles, Boxes, ShieldAlert, ArrowRight } from 'lucide-react';

const roadmapItems = [
  { label: '特征映射', path: '/ch05/feature-mapping', icon: Map, desc: '把数据变换到高维空间', color: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
  { label: '特征空间中的 LMS', path: '/ch05/lms-in-feature-space', icon: TrendingDown, desc: '在高维空间中使用线性算法', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300' },
  { label: '核技巧', path: '/ch05/kernel-trick', icon: Sparkles, desc: '隐式计算高维内积', color: 'bg-violet-100 text-violet-700', border: 'border-violet-300' },
  { label: '核函数的性质', path: '/ch05/kernel-properties', icon: Boxes, desc: '有效核函数与常见核函数', color: 'bg-amber-100 text-amber-700', border: 'border-amber-300' },
];

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-violet-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          核方法：把线性工具变成非线性工具
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          核方法的核心思想是：先把数据映射到高维特征空间，再在新空间中用线性方法；
          而核技巧让我们无需显式构造这个高维映射，就能完成计算。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Core idea */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <p className="text-gray-700 mb-4">
          很多实际问题不是线性可分的。核方法通过特征映射 <strong>φ(x)</strong> 把输入变换到高维空间，
          使得在新空间中可以用线性分类器或线性回归解决。
        </p>
        <p className="text-gray-700 mb-4">
          直接计算 φ(x) 可能代价高昂甚至不可能（例如无限维映射）。核技巧让我们只通过核函数
          <strong> K(x, z) = φ(x)ᵀφ(z)</strong> 就能隐式地完成高维空间中的内积计算。
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">特征映射</h3>
            <p className="text-sm text-gray-700">
              显式地把 x 变换到 φ(x)。直观但可能导致维度爆炸。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">核技巧</h3>
            <p className="text-sm text-gray-700">
              不显式计算 φ(x)，直接计算 K(x, z)。高效且能处理无限维映射。
            </p>
          </div>
        </div>
      </section>

      {/* Chapter roadmap */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">本章学习路线</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {roadmapItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col p-5 rounded-xl border ${item.border} bg-white hover:shadow-sm transition-all`}
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
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-violet-800 mb-3">学习提示</h3>
        <p className="text-sm text-violet-800 leading-relaxed">
          核方法是机器学习中最优雅的思想之一。学习时可以先从直观的多项式映射入手，
          理解“为什么高维空间能让数据线性可分”；然后再理解核技巧如何把这个过程变得高效。
          最终你会发现，SVM、核 PCA 等算法都建立在这些基础之上。
        </p>
      </section>
    </div>
  );
}
