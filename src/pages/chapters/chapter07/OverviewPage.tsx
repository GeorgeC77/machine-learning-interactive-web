import { Link } from 'react-router-dom';
import { Activity, Network, Layers, GitBranch, Zap, ShieldAlert, ArrowRight } from 'lucide-react';

const roadmapItems = [
  { label: '非线性模型监督学习', path: '/ch07/nonlinear-supervised-learning', icon: Activity, desc: '为什么需要非线性模型', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { label: '神经网络', path: '/ch07/neural-networks', icon: Network, desc: '神经元、激活函数与前向传播', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { label: '现代神经网络模块', path: '/ch07/modern-nn-modules', icon: Layers, desc: '卷积、池化、Dropout 等', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: '反向传播', path: '/ch07/backpropagation', icon: GitBranch, desc: '链式法则与梯度流动', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { label: '训练样本的向量化', path: '/ch07/vectorization', icon: Zap, desc: '矩阵运算与 GPU 加速', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <Network className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          深度学习：从神经元到反向传播
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          深度学习通过多层神经网络学习数据的层次化表示。本章将介绍神经网络的基本结构、
          现代网络模块、反向传播算法以及训练中的向量化技巧。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Core idea */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核心思想</h2>
        <p className="text-gray-700 mb-4">
          在满足连续性、紧致定义域等条件且网络容量足够时，神经网络可以把目标函数逼近到任意给定精度。
          深层网络的强大之处在于：每一层都在前一层的基础上学习更抽象的表示。
        </p>
        <p className="text-gray-700 mb-4">
          训练深度网络需要两个关键要素：
          <strong>反向传播</strong>用于高效计算梯度，<strong>向量化</strong>用于加速批量计算。
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">表示学习</h3>
            <p className="text-sm text-gray-700">
              网络自动从原始数据中学习有用的特征表示，而不需要人工设计特征。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">端到端训练</h3>
            <p className="text-sm text-gray-700">
              从输入到输出的整个模型可以通过反向传播端到端地优化。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">完成本章后，你应该能够</h2>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">解释非线性激活为何能打破多层线性变换的“线性坍塌”。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">按矩阵维度写出全连接层、残差块和批量前向传播。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">沿计算图使用链式法则，手算一层与两层网络的参数梯度。</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 p-4">区分卷积、归一化、残差连接等模块解决的不同问题。</li>
        </ul>
      </section>

      {/* Chapter roadmap */}
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
          学习深度学习时，建议先理解单个神经元和激活函数，再扩展到多层网络；
          然后通过计算图理解反向传播；最后掌握向量化，这是实际训练大规模网络的必备技能。
        </p>
      </section>
    </div>
  );
}
