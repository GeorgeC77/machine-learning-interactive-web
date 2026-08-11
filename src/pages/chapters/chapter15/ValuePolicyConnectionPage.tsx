import { Activity, CheckCircle2, Circle, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';

export default function ValuePolicyConnectionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">值迭代与策略迭代的关系</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          广义策略迭代把“让价值匹配当前策略”和“让策略对当前价值更贪婪”看作两个相互作用的过程；
          修改策略迭代则给出连接两个经典算法的精确定义。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">广义策略迭代（GPI）</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">策略评估方向</h3>
            <p className="text-sm text-gray-700">
              固定 π，使 V 朝 V^π 移动，即减小 V 与 TπV 的不一致。
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-800 mb-2">策略改进方向</h3>
            <p className="text-sm text-gray-700">
              固定 V，使 π 更偏向对 V 的一步前瞻价值较高的动作。
            </p>
          </div>
        </div>
        <p className="text-gray-700 mt-4">
          两个过程不必轮流“完全做完”。只要误差控制得当，它们可以交错、异步甚至同时进行；
          这也是理解截断策略评估、actor–critic 与许多近似算法的有用视角，但具体收敛保证取决于算法假设。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">修改策略迭代的明确定义</h2>
        <p className="text-gray-700">
          为避免“先评估还是先改进”造成歧义，定义如下顺序。给定当前 Vₖ，先选取对它贪婪的策略 πₖ₊₁，
          再固定该策略执行 m 次 Bellman 期望备份：
        </p>
        <FormulaCard
          title="改进后进行 m 步评估"
          formula={
            <KaTeX
              math={String.raw`\pi_{k+1}\in\operatorname{Greedy}(V_k),\qquad V_{k+1}=(T_{\pi_{k+1}})^m V_k`}
              display
            />
          }
          description="Tπ 是固定策略的 Bellman 算子；m 控制一次改进之后投入多少评估计算。"
        />
        <FormulaCard
          title="固定策略 Bellman 算子"
          formula={
            <KaTeX
              math={String.raw`(T_\pi V)(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V(s')\right]`}
              display
            />
          }
          description="确定性策略时，动作求和只保留 a=π(s) 对应的一项。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">两个端点为何成立</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">m = 1：值迭代</h3>
            <p className="text-sm text-gray-700">
              因为 πₖ₊₁ 对 Vₖ 贪婪，所以 Tπₖ₊₁Vₖ=T*Vₖ。因此一次评估备份给出
              Vₖ₊₁=T*Vₖ，恰好是同步值迭代；这个等价性依赖上面明确的“先贪婪、后备份”顺序。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">m → ∞：精确策略评估</h3>
            <p className="text-sm text-gray-700">
              对 γ&lt;1，反复应用 Tπ 收敛到 V^π。于是每次贪婪改进之后都把新策略评估到收敛，
              与标准策略迭代的“评估—改进”循环相同，只是初始策略的产生方式不同。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">计算权衡</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm text-left border-collapse">
            <caption className="sr-only">值迭代、修改策略迭代和策略迭代的计算比较</caption>
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th scope="col" className="p-3">方法</th>
                <th scope="col" className="p-3">每次改进前的评估</th>
                <th scope="col" className="p-3">典型优势</th>
                <th scope="col" className="p-3">主要代价</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100"><th scope="row" className="p-3 font-medium">值迭代</th><td className="p-3">m=1</td><td className="p-3">单轮便宜、实现直接</td><td className="p-3">可能需要更多 sweeps</td></tr>
              <tr className="border-b border-gray-100"><th scope="row" className="p-3 font-medium">修改策略迭代</th><td className="p-3">1&lt;m&lt;∞</td><td className="p-3">可平衡评估和改进</td><td className="p-3">需要选择截断预算</td></tr>
              <tr><th scope="row" className="p-3 font-medium">策略迭代</th><td className="p-3">评估到收敛</td><td className="p-3">外层改进轮数通常少</td><td className="p-3">单轮评估较贵</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-700 mt-4">
          实际用时还取决于稀疏结构、线性求解器、异步更新顺序、停止阈值和硬件；不能只用外层“轮数”判断哪种方法更快。
        </p>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            'GPI 把策略评估和策略改进视为可以交错进行的两个过程。',
            '在先贪婪后评估的定义下，m=1 精确给出值迭代。',
            'm 趋于无穷时得到精确策略评估，连接到策略迭代。',
            '算法比较应同时计算 Bellman sweeps、线性求解成本和达到目标误差的总时间。',
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
