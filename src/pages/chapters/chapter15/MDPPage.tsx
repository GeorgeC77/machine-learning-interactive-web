import { useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import GridWorldView from './GridWorldView';
import {
  bellmanOptimalityResidual,
  defaultConfig,
  extractPolicy,
  valueIterationStep,
} from './GridWorld';

export default function MDPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">马尔可夫决策过程</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          马尔可夫决策过程（MDP）把智能体、环境动态、奖励与长期目标放进同一个数学框架，
          是理解动态规划和现代强化学习算法的起点。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">MDP 的组成与假设</h2>
        </div>
        <p className="text-gray-700 mb-4">有限 MDP 通常写成五元组 (S, A, P, R, γ)：</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>状态集合 S：</strong>决策所需的环境信息。</li>
          <li><strong>动作集合 A：</strong>智能体可选择的动作；可行动作也可以依赖状态。</li>
          <li><strong>转移概率 P(s&apos;|s,a)：</strong>执行动作后到达下一状态的条件分布。</li>
          <li><strong>奖励 R(s,a,s&apos;)：</strong>一次转移产生的即时标量反馈。</li>
          <li><strong>折扣因子 γ ∈ [0,1)：</strong>控制未来奖励权重，并保证无限时域有界奖励问题的回报有限。</li>
        </ul>
        <p className="text-gray-700">
          马尔可夫性质要求：给定当前状态和动作后，下一状态分布不再依赖更早历史。
          若观测不能概括相关历史，问题更适合建模为部分可观测 MDP，或把历史摘要并入状态。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">回报、策略与价值函数</h2>
        <p className="text-gray-700">
          随机策略 π(a|s) 给出状态 s 下选择动作 a 的概率。从时刻 t 开始的折扣回报为：
        </p>
        <FormulaCard
          title="折扣回报与状态价值"
          formula={
            <KaTeX
              math={String.raw`G_t=\sum_{k=0}^{\infty}\gamma^k R_{t+k+1},\qquad V^\pi(s)=\mathbb{E}_\pi[G_t\mid S_t=s]`}
              display
            />
          }
          description="价值函数不是单次轨迹的得分，而是同时对策略随机性和环境随机性取期望。"
        />
        <p className="text-gray-700">它满足 Bellman 期望方程：</p>
        <FormulaCard
          title="Bellman 期望方程"
          formula={
            <KaTeX
              math={String.raw`V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^\pi(s')\right]`}
              display
            />
          }
          description="当前价值被分解为一步奖励与下一状态价值；确定性策略是其中 π(a|s) 取 0 或 1 的特例。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">最优价值与 Bellman 最优方程</h2>
        <p className="text-gray-700">
          最优状态价值 V* 在所有策略中逐状态取最大值。有限折扣 MDP 中至少存在一个确定性平稳最优策略，且 V* 是 Bellman 最优算子的唯一不动点：
        </p>
        <FormulaCard
          title="Bellman 最优方程"
          formula={
            <KaTeX
              math={String.raw`V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^*(s')\right]`}
              display
            />
          }
          description="对 V* 做一步贪婪选择即可得到一个最优策略；若多个动作并列，可能存在多个最优策略。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：随机网格世界</h2>
        <p className="text-gray-700 mb-4">
          每次移动有一部分概率滑向预期方向的两侧。进入目标格获得 +1，进入陷阱格获得 −1，随后回合结束；
          其他转移奖励为 0，终止状态的续值为 0。调整 γ 和滑动概率，再逐步应用同步 Bellman 最优更新。
        </p>
        <MDPDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            'MDP 用状态、动作、转移、奖励与折扣因子描述序贯决策。',
            '价值函数是给定策略下未来折扣回报的条件期望。',
            'Bellman 方程把长期问题递归分解为一步奖励与下一状态价值。',
            '有限折扣 MDP 的 Bellman 最优算子是压缩映射，可据此迭代求解。',
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

function MDPDemo() {
  const [config, setConfig] = useState(defaultConfig);
  const [iterations, setIterations] = useState(0);
  const [values, setValues] = useState<number[]>(() =>
    new Array(config.rows * config.cols).fill(0),
  );
  const policy = useMemo(() => extractPolicy(values, config), [values, config]);
  const residual = useMemo(
    () => bellmanOptimalityResidual(values, config),
    [values, config],
  );

  const resetValues = () => {
    setValues(new Array(config.rows * config.cols).fill(0));
    setIterations(0);
  };

  const updateConfig = (key: 'gamma' | 'slipProb', value: number) => {
    setConfig((current) => ({ ...current, [key]: value }));
    resetValues();
  };

  const runValueIteration = (steps: number) => {
    setValues((current) => {
      let next = current;
      for (let step = 0; step < steps; step++) next = valueIterationStep(next, config);
      return next;
    });
    setIterations((current) => current + steps);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <ControlRow label={`折扣因子 γ：${config.gamma.toFixed(2)}`}>
          <Slider
            aria-label="折扣因子 gamma"
            value={[config.gamma]}
            min={0}
            max={0.99}
            step={0.01}
            onValueChange={([value]) => updateConfig('gamma', value)}
          />
        </ControlRow>
        <ControlRow label={`侧滑总概率：${config.slipProb.toFixed(2)}`}>
          <Slider
            aria-label="向两侧滑动的总概率"
            value={[config.slipProb]}
            min={0}
            max={0.5}
            step={0.05}
            onValueChange={([value]) => updateConfig('slipProb', value)}
          />
        </ControlRow>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => runValueIteration(1)}
            className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            更新一步
          </button>
          <button
            type="button"
            onClick={() => runValueIteration(20)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            连续 20 步
          </button>
          <button
            type="button"
            onClick={resetValues}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            重置
          </button>
        </div>
      </div>

      <GridWorldView
        config={config}
        values={values}
        policy={policy}
        description={`已执行 ${iterations} 次同步值迭代，Bellman 残差为 ${residual.toExponential(2)}。`}
      />

      <div className="grid grid-cols-2 gap-3 text-sm" role="status" aria-live="polite">
        <div className="rounded-lg bg-gray-50 p-3">
          <span className="block text-gray-600">同步更新次数</span>
          <span className="font-mono font-semibold text-blue-700">{iterations}</span>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <span className="block text-gray-600">Bellman 残差 ‖TV−V‖∞</span>
          <span className="font-mono font-semibold text-blue-700">{residual.toExponential(2)}</span>
        </div>
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      {children}
    </div>
  );
}
