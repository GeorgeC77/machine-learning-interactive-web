import { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Circle, RefreshCw, ShieldAlert, SkipForward } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import GridWorldView from './GridWorldView';
import {
  bellmanOptimalityResidual,
  defaultConfig,
  extractPolicy,
  isObstacle,
  isTerminal,
  policyIterationStep,
  valueIterationStep,
} from './GridWorld';

export default function ValuePolicyIterationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十五章 · 强化学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">值迭代与策略迭代</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          当有限 MDP 的转移与奖励已知时，两种动态规划算法都能求得最优策略，
          但每轮计算量与收敛路径不同。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">值迭代：反复应用最优算子</h2>
        </div>
        <p className="text-gray-700 mb-4">
          从任意有界初值 V₀ 出发，使用旧一轮的全部值同步计算下一轮：
        </p>
        <FormulaCard
          title="同步值迭代"
          formula={
            <KaTeX
              math={String.raw`V_{k+1}(s)=\max_a\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V_k(s')\right]`}
              display
            />
          }
          description="对 γ<1，Bellman 最优算子在最大范数下是 γ-压缩映射，因此 Vₖ 收敛到唯一的 V*。"
        />
        <p className="text-gray-700 mt-4">
          实现时可监控 Bellman 残差 ‖TV−V‖∞。残差很小表示价值接近不动点；
          若需要严格的价值误差界，还应结合 γ 使用 ‖V−V*‖∞ ≤ ‖TV−V‖∞/(1−γ)。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">策略迭代：评估与改进</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>策略评估：</strong>迭代求解 V^π=TπV^π，或直接求解对应线性方程组。</li>
          <li><strong>策略改进：</strong>对 V^π 做一步贪婪选择，得到不劣于当前策略的新策略。</li>
        </ol>
        <FormulaCard
          title="贪婪策略改进"
          formula={
            <KaTeX
              math={String.raw`\pi_{\mathrm{new}}(s)\in\arg\max_a\sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^\pi(s')\right]`}
              display
            />
          }
          description="若采用固定的并列动作规则，有限 MDP 的精确策略迭代会在有限次改进后停止于最优策略。"
        />
        <p className="text-gray-700 mt-4">
          策略迭代通常需要较少的外层改进轮数，但每轮完整评估更贵；值迭代单轮便宜。
          大状态空间中常用截断评估、异步更新、函数近似或采样算法。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：比较更新单位</h2>
        <p className="text-gray-700 mb-4">
          值迭代的“一步”是一次全状态 Bellman 最优备份；策略迭代的“一轮”包含近似收敛的策略评估与一次策略改进。
          演示使用进入终止格时支付的转移奖励，并显示统一的最优 Bellman 残差，便于比较而不混淆两种计数。
        </p>
        <IterationDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '值迭代依靠 Bellman 最优算子的压缩性收敛到 V*。',
            '策略迭代交替求 V^π 和执行贪婪改进。',
            '比较算法时必须区分一次 Bellman sweep、一次策略评估 sweep 和一次策略改进。',
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

type Mode = 'value' | 'policy';

function createInitialPolicy() {
  const config = defaultConfig();
  return Array.from({ length: config.rows * config.cols }, (_, state) =>
    isObstacle(state, config) || isTerminal(state, config) ? -1 : 0,
  );
}

function IterationDemo() {
  const config = useMemo(() => defaultConfig(), []);
  const [mode, setMode] = useState<Mode>('value');
  const [values, setValues] = useState<number[]>(() =>
    new Array(config.rows * config.cols).fill(0),
  );
  const [policy, setPolicy] = useState<number[]>(createInitialPolicy);
  const [iterations, setIterations] = useState(0);
  const [evaluationSweeps, setEvaluationSweeps] = useState(0);
  const [policyStable, setPolicyStable] = useState(false);

  const displayedPolicy = useMemo(
    () => (mode === 'value' ? extractPolicy(values, config) : policy),
    [mode, values, policy, config],
  );
  const residual = useMemo(
    () => bellmanOptimalityResidual(values, config),
    [values, config],
  );

  const reset = () => {
    setValues(new Array(config.rows * config.cols).fill(0));
    setPolicy(createInitialPolicy());
    setIterations(0);
    setEvaluationSweeps(0);
    setPolicyStable(false);
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    reset();
  };

  const run = (rounds: number) => {
    if (mode === 'value') {
      setValues((current) => {
        let next = current;
        for (let round = 0; round < rounds; round++) next = valueIterationStep(next, config);
        return next;
      });
      setIterations((current) => current + rounds);
      return;
    }

    let nextValues = values;
    let nextPolicy = policy;
    let totalEvaluationSweeps = 0;
    let stable = false;
    let completedRounds = 0;
    for (; completedRounds < rounds; completedRounds++) {
      const result = policyIterationStep(nextValues, nextPolicy, config);
      nextValues = result.newV;
      nextPolicy = result.newPolicy;
      totalEvaluationSweeps += result.evaluationIterations;
      stable = result.policyStable;
      if (stable) {
        completedRounds += 1;
        break;
      }
    }
    setValues(nextValues);
    setPolicy(nextPolicy);
    setIterations((current) => current + completedRounds);
    setEvaluationSweeps((current) => current + totalEvaluationSweeps);
    setPolicyStable(stable);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={mode === 'value'}
          onClick={() => changeMode('value')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'value' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          值迭代
        </button>
        <button
          type="button"
          aria-pressed={mode === 'policy'}
          onClick={() => changeMode('policy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'policy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          策略迭代
        </button>
        <button
          type="button"
          onClick={() => run(1)}
          disabled={mode === 'policy' && policyStable}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <SkipForward className="w-4 h-4" aria-hidden="true" />
          {mode === 'value' ? '执行一次 sweep' : '执行一轮改进'}
        </button>
        <button
          type="button"
          onClick={() => run(mode === 'value' ? 20 : 10)}
          disabled={mode === 'policy' && policyStable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {mode === 'value' ? '连续 20 次' : '运行至稳定（最多 10 轮）'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          重置
        </button>
      </div>

      <GridWorldView
        config={config}
        values={values}
        policy={displayedPolicy}
        description={`${mode === 'value' ? '值迭代' : '策略迭代'}已执行 ${iterations} 个外层更新，Bellman 最优残差 ${residual.toExponential(2)}。`}
      />

      <div className="grid sm:grid-cols-3 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label={mode === 'value' ? 'Bellman sweeps' : '策略改进轮数'} value={String(iterations)} />
        <Metric label="Bellman 最优残差" value={residual.toExponential(2)} />
        <Metric
          label={mode === 'value' ? '当前状态' : '累计评估 sweeps'}
          value={mode === 'value' ? (residual < 1e-8 ? '数值收敛' : '迭代中') : String(evaluationSweeps)}
        />
      </div>
      {mode === 'policy' && policyStable && (
        <p className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          策略已稳定；在此有限折扣 MDP 与固定并列规则下，它是最优策略。
        </p>
      )}
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
