import { BookOpen, CheckCircle2, Circle, ShieldAlert, Target } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';

const topics = [
  ['15.1 马尔可夫决策过程', '状态、动作、转移、奖励、策略与 Bellman 方程。', 'blue'],
  ['15.2 值迭代与策略迭代', '精确动态规划、收敛残差与算法权衡。', 'emerald'],
  ['15.3 学习 MDP 模型', '探索采样、最大似然估计、覆盖率与基于模型的规划。', 'violet'],
  ['15.4 连续状态 MDP', '离散化、维度灾难与 fitted value iteration。', 'amber'],
  ['15.5 两类迭代的关系', '广义策略迭代与修改策略迭代的统一视角。', 'cyan'],
] as const;

const topicStyles = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  violet: 'bg-violet-50 border-violet-200 text-violet-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800',
};

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">从 MDP 到基于模型的决策</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          强化学习研究智能体如何通过与环境交互改进长期决策。本章从已知模型下的精确规划出发，
          再讨论如何从数据学习模型，以及连续状态带来的近似问题。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">完成本章后，你应当能够</h2>
        </div>
        <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
          {[
            '区分状态、动作、转移奖励、策略、回报与价值函数。',
            '写出 Bellman 期望方程和最优方程，并解释其递归含义。',
            '实现值迭代、策略迭代，并用残差判断数值收敛。',
            '从带探索的轨迹估计模型，识别覆盖不足与模型偏差。',
            '解释离散化的维度灾难和 fitted value iteration 的局限。',
            '用修改策略迭代理解值迭代与策略迭代的联系。',
          ].map((goal) => (
            <li key={goal} className="rounded-lg border border-gray-200 p-3">{goal}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">学习路线</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map(([title, description, color]) => (
            <div key={title} className={`rounded-lg p-4 border ${topicStyles[color]}`}>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-700">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">贯穿全章的递归</h2>
        <FormulaCard
          title="Bellman 最优方程"
          formula={
            <KaTeX
              math={String.raw`V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^*(s')\right]`}
              display
            />
          }
          description="一步奖励与下一状态价值构成统一目标；模型已知时可直接规划，模型未知时先从经验估计这些量。"
        />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          学习边界
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '动态规划默认转移与奖励模型已知，不能直接替代未知环境中的数据收集。',
            '从有限数据学习的模型带有统计误差；规划精确并不意味着真实环境表现可靠。',
            '探索、覆盖率、离线分布偏移和安全约束都会影响强化学习系统的可用性。',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
