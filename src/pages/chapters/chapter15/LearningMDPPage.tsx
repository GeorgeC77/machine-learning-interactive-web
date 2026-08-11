import { useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, Play, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import GridWorldView from './GridWorldView';
import {
  ACTIONS,
  defaultConfig,
  isObstacle,
  isTerminal,
  maxAbsDiff,
  simulateEpisode,
  type GridWorldConfig,
} from './GridWorld';

type TransitionCounts = number[][][];
type StateActionTable = number[][];

export default function LearningMDPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">从经验学习 MDP 模型</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          模型未知时，可以从 (状态、动作、奖励、下一状态) 数据估计转移与奖励，
          再在估计模型中规划；数据覆盖决定了模型能回答哪些决策问题。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">计数估计与适用条件</h2>
        </div>
        <p className="text-gray-700 mb-4">
          令 N(s,a,s&apos;) 为观察到该转移的次数，N(s,a)=Σs&apos;N(s,a,s&apos;)。
          对 N(s,a)&gt;0，条件分布的最大似然估计为：
        </p>
        <FormulaCard
          title="转移与期望奖励估计"
          formula={
            <KaTeX
              math={String.raw`\widehat P(s'\mid s,a)=\frac{N(s,a,s')}{N(s,a)},\qquad \widehat r(s,a)=\frac{1}{N(s,a)}\sum_{i:(s_i,a_i)=(s,a)}r_i`}
              display
            />
          }
          description="若 N(s,a)=0，最大似然估计未定义，而不是自动等于均匀分布；必须收集数据或明确引入平滑先验。"
        />
        <p className="text-gray-700 mt-4">
          若奖励依赖下一状态，也可以分别估计 r(s,a,s&apos;)，或像上式直接估计给定 (s,a) 的期望奖励。
          计数估计还默认环境在采样期间近似平稳，并且状态表示满足马尔可夫性质。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">探索、规划与模型偏差</h2>
        <p className="text-gray-700">
          只执行当前看似最优的动作，可能永远观察不到更好的动作。一个基础做法是 ε-贪婪行为策略：
        </p>
        <FormulaCard
          title="ε-贪婪数据收集"
          formula={
            <KaTeX
              math={String.raw`A_t=\begin{cases}\text{uniform random action},&\text{with probability }\varepsilon,\\\arg\max_a\widehat Q(S_t,a),&\text{otherwise.}\end{cases}`}
              display
            />
          }
          description="ε>0 改善覆盖，但不保证有限数据下覆盖所有重要状态；安全环境还需要受约束探索。"
        />
        <p className="text-gray-700">
          每批数据之后，可在 P̂、r̂ 上运行值迭代。估计模型中的 Bellman 残差再小，也只说明规划器解好了
          “估计出来的问题”；真实表现仍受有限样本、分布偏移和模型设定误差影响，应在独立回合中评估。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：探索—估计—规划闭环</h2>
        <p className="text-gray-700 mb-4">
          学习器只使用收集到的转移次数与奖励样本；未观察的动作暂按“零奖励、原地转移”处理。
          环境的真实转移仅用于生成轨迹，不参与策略提取。提高 ε 或批量收集回合，观察状态—动作覆盖率和估计价值如何变化。
        </p>
        <ModelLearningDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">从教学算法到实际系统</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>先验与不确定性：</strong>Dirichlet/贝叶斯模型或置信区间比单点计数更能表达少样本风险。</li>
          <li><strong>规划预算：</strong>Dyna 类方法交替进行真实交互与模型生成的规划更新。</li>
          <li><strong>离线数据：</strong>日志策略覆盖不足时，估计模型在分布外动作上可能任意错误。</li>
          <li><strong>评估：</strong>报告独立回合回报、失败率、置信区间与约束违例，而不只报告训练模型残差。</li>
        </ul>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '经验模型需要同时估计转移分布与期望即时奖励。',
            '未访问的状态—动作对没有最大似然估计，探索和先验不能被省略。',
            '规划误差与模型误差是两件事；真实环境评估决定策略是否可靠。',
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

function emptyTransitionCounts(nStates: number, nActions: number): TransitionCounts {
  return Array.from({ length: nStates }, () =>
    Array.from({ length: nActions }, () => new Array(nStates).fill(0)),
  );
}

function emptyStateActionTable(nStates: number, nActions: number): StateActionTable {
  return Array.from({ length: nStates }, () => new Array(nActions).fill(0));
}

function estimatedActionValue(
  state: number,
  action: number,
  values: number[],
  counts: TransitionCounts,
  stateActionCounts: StateActionTable,
  rewardSums: StateActionTable,
  config: GridWorldConfig,
): number {
  const visits = stateActionCounts[state][action];
  if (visits === 0) return config.gamma * values[state];

  const expectedReward = rewardSums[state][action] / visits;
  const expectedNextValue = counts[state][action].reduce(
    (sum, count, nextState) => sum + (count / visits) * values[nextState],
    0,
  );
  return expectedReward + config.gamma * expectedNextValue;
}

function estimatedBellmanStep(
  values: number[],
  counts: TransitionCounts,
  stateActionCounts: StateActionTable,
  rewardSums: StateActionTable,
  config: GridWorldConfig,
): number[] {
  return values.map((_, state) => {
    if (isObstacle(state, config) || isTerminal(state, config)) return 0;
    return Math.max(...ACTIONS.map((__, action) =>
      estimatedActionValue(
        state,
        action,
        values,
        counts,
        stateActionCounts,
        rewardSums,
        config,
      ),
    ));
  });
}

function planInEstimatedModel(
  initialValues: number[],
  counts: TransitionCounts,
  stateActionCounts: StateActionTable,
  rewardSums: StateActionTable,
  config: GridWorldConfig,
): number[] {
  let values = initialValues;
  for (let iteration = 0; iteration < 500; iteration++) {
    const nextValues = estimatedBellmanStep(
      values,
      counts,
      stateActionCounts,
      rewardSums,
      config,
    );
    if (maxAbsDiff(values, nextValues) < 1e-10) return nextValues;
    values = nextValues;
  }
  return values;
}

function extractEstimatedPolicy(
  values: number[],
  counts: TransitionCounts,
  stateActionCounts: StateActionTable,
  rewardSums: StateActionTable,
  config: GridWorldConfig,
): number[] {
  return values.map((_, state) => {
    if (isObstacle(state, config) || isTerminal(state, config)) return -1;
    let bestAction = 0;
    let bestValue = -Infinity;
    for (let action = 0; action < ACTIONS.length; action++) {
      const candidate = estimatedActionValue(
        state,
        action,
        values,
        counts,
        stateActionCounts,
        rewardSums,
        config,
      );
      if (candidate > bestValue) {
        bestValue = candidate;
        bestAction = action;
      }
    }
    return bestAction;
  });
}

function ModelLearningDemo() {
  const config = useMemo(() => defaultConfig(), []);
  const nStates = config.rows * config.cols;
  const nActions = ACTIONS.length;
  const [epsilon, setEpsilon] = useState(0.3);
  const [experimentSeed, setExperimentSeed] = useState(11);
  const [counts, setCounts] = useState<TransitionCounts>(() =>
    emptyTransitionCounts(nStates, nActions),
  );
  const [stateActionCounts, setStateActionCounts] = useState<StateActionTable>(() =>
    emptyStateActionTable(nStates, nActions),
  );
  const [rewardSums, setRewardSums] = useState<StateActionTable>(() =>
    emptyStateActionTable(nStates, nActions),
  );
  const [values, setValues] = useState<number[]>(() => new Array(nStates).fill(0));
  const [episodes, setEpisodes] = useState(0);
  const [transitions, setTransitions] = useState(0);
  const [lastReturn, setLastReturn] = useState(0);
  const [lastLength, setLastLength] = useState(0);

  const policy = useMemo(
    () => extractEstimatedPolicy(values, counts, stateActionCounts, rewardSums, config),
    [values, counts, stateActionCounts, rewardSums, config],
  );
  const validStateActions = useMemo(
    () => nActions * Array.from({ length: nStates }, (_, state) => state)
      .filter((state) => !isObstacle(state, config) && !isTerminal(state, config)).length,
    [nActions, nStates, config],
  );
  const coveredStateActions = stateActionCounts.reduce(
    (total, row) => total + row.filter((visits) => visits > 0).length,
    0,
  );
  const coverage = validStateActions === 0 ? 0 : coveredStateActions / validStateActions;

  const collectEpisodes = (batchSize: number) => {
    const nextCounts = counts.map((state) => state.map((action) => [...action]));
    const nextStateActionCounts = stateActionCounts.map((row) => [...row]);
    const nextRewardSums = rewardSums.map((row) => [...row]);
    let addedTransitions = 0;
    let finalReturn = 0;
    let finalLength = 0;

    for (let episode = 0; episode < batchSize; episode++) {
      const experience = simulateEpisode(
        policy,
        config,
        60,
        experimentSeed + (episodes + episode) * 7_919,
        epsilon,
      );
      for (const sample of experience) {
        nextCounts[sample.state][sample.action][sample.nextState] += 1;
        nextStateActionCounts[sample.state][sample.action] += 1;
        nextRewardSums[sample.state][sample.action] += sample.reward;
      }
      addedTransitions += experience.length;
      finalLength = experience.length;
      finalReturn = experience.reduce((sum, sample) => sum + sample.reward, 0);
    }

    const nextValues = planInEstimatedModel(
      values,
      nextCounts,
      nextStateActionCounts,
      nextRewardSums,
      config,
    );
    setCounts(nextCounts);
    setStateActionCounts(nextStateActionCounts);
    setRewardSums(nextRewardSums);
    setValues(nextValues);
    setEpisodes((current) => current + batchSize);
    setTransitions((current) => current + addedTransitions);
    setLastReturn(finalReturn);
    setLastLength(finalLength);
  };

  const reset = () => {
    setCounts(emptyTransitionCounts(nStates, nActions));
    setStateActionCounts(emptyStateActionTable(nStates, nActions));
    setRewardSums(emptyStateActionTable(nStates, nActions));
    setValues(new Array(nStates).fill(0));
    setEpisodes(0);
    setTransitions(0);
    setLastReturn(0);
    setLastLength(0);
    setExperimentSeed((current) => current + 1);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-[minmax(220px,1fr)_auto] gap-4 items-end">
        <ControlRow label={`探索率 ε：${epsilon.toFixed(2)}`}>
          <Slider
            aria-label="epsilon 贪婪策略的探索率"
            value={[epsilon]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) => setEpsilon(value)}
          />
        </ControlRow>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => collectEpisodes(1)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            收集 1 回合
          </button>
          <button
            type="button"
            onClick={() => collectEpisodes(25)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            收集 25 回合
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            重置实验
          </button>
        </div>
      </div>

      <GridWorldView
        config={config}
        values={values}
        policy={policy}
        description={`从 ${episodes} 个回合、${transitions} 条转移估计模型；状态动作覆盖率 ${(coverage * 100).toFixed(1)}%。`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="已收集回合" value={String(episodes)} />
        <Metric label="转移样本" value={String(transitions)} />
        <Metric label="状态—动作覆盖率" value={`${(coverage * 100).toFixed(1)}%`} />
        <Metric label="上一回合" value={`回报 ${lastReturn.toFixed(0)} / ${lastLength} 步`} />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <span className="block text-gray-600">{label}</span>
      <span className="font-mono font-semibold text-blue-700">{value}</span>
    </div>
  );
}
