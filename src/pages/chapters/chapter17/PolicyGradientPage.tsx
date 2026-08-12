import { useId, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, Play, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import {
  CHAIN_ACTIONS,
  DEFAULT_CHAIN,
  exactStartValue,
  meanPolicyEntropy,
  policyFromTheta,
  reinforceBatchStep,
  type Episode,
} from './policyGradientMath';

const ACTION_NAMES = ['左', '停', '右'];
const ACTION_COLORS = ['#ef4444', '#9ca3af', '#22c55e'];

export default function PolicyGradientPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">第十七章 · 策略梯度</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">策略梯度与 REINFORCE</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          REINFORCE 用采样回报为动作对数概率加权，直接优化随机策略。
          它不需要已知环境模型，但仍依赖轨迹交互，并面临高方差、样本效率和稳定性问题。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" aria-hidden="true" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4"><Activity className="w-6 h-6 text-blue-600" aria-hidden="true" /><h2 className="text-2xl font-bold text-gray-900">目标与轨迹分布</h2></div>
        <p className="text-gray-700 mb-4">
          在固定初始分布、环境转移不依赖策略参数 θ 的有限时域任务中，随机策略 πθ 诱导轨迹分布：
        </p>
        <FormulaCard
          title="轨迹概率"
          formula={<KaTeX math={String.raw`p_\theta(\tau)=\rho_0(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)`} display />}
          description="无模型表示梯度估计不需要显式知道 P；采样轨迹仍然必须来自环境或模拟器。"
        />
        <div className="mt-4">
          <FormulaCard
            title="折扣性能目标"
            formula={<KaTeX math={String.raw`J(\theta)=\mathbb E_{\tau\sim p_\theta}\!\left[\sum_{t=0}^{T-1}\gamma^tR_t\right],\qquad 0<\gamma\le 1`} display />}
            description="有限时域允许 γ=1；γ<1 表达对较早奖励的更高权重。"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">对数导数技巧与因果性</h2>
        <FormulaCard
          title="似然比梯度"
          formula={<KaTeX math={String.raw`\nabla_\theta J(\theta)=\mathbb E_\tau\!\left[G_0\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(A_t\mid S_t)\right]`} display />}
          description="初始分布和环境转移与 θ 无关，因此它们的对数梯度为零。"
        />
        <p className="text-gray-700">
          时刻 t 的动作不能影响此前奖励。去掉 score term 与过去奖励之间期望为零的项后，得到 reward-to-go 形式。
          对本节定义的折扣目标，外层 γᵗ 不能遗漏：
        </p>
        <FormulaCard
          title="因果 REINFORCE 估计器"
          formula={<KaTeX math={String.raw`G_t=\sum_{k=t}^{T-1}\gamma^{k-t}R_k,\qquad \nabla_\theta J(\theta)=\mathbb E_\tau\!\left[\sum_{t=0}^{T-1}\gamma^tG_t\nabla_\theta\log\pi_\theta(A_t\mid S_t)\right]`} display />}
          description="reward-to-go 通常比整条轨迹回报方差更低，同时保持对所定义 J 的无偏性。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">基线：降低方差而不改期望</h2>
        <FormulaCard
          title="状态基线恒等式"
          formula={<KaTeX math={String.raw`\mathbb E_{A_t\sim\pi_\theta(\cdot\mid S_t)}\!\left[b(S_t)\nabla_\theta\log\pi_\theta(A_t\mid S_t)\mid S_t\right]=0`} display />}
          description="b 可以依赖状态与时刻，但不能依赖当前采样动作；实现时也不应让策略损失通过 baseline target 反向传播。"
        />
        <FormulaCard
          title="带基线的估计器"
          formula={<KaTeX math={String.raw`\widehat g=\frac1N\sum_{i=1}^N\sum_{t=0}^{T_i-1}\gamma^t\bigl(G_t^{(i)}-b(S_t^{(i)})\bigr)\nabla_\theta\log\pi_\theta(A_t^{(i)}\mid S_t^{(i)})`} display />}
          description="若 b≈Vπ，括号近似优势。基线不必总能降低每个有限批量的方差，质量差的基线甚至可能适得其反。"
        />
        <p className="text-gray-700">
          教学演示使用每个状态的 return-to-go 批均值更新指数移动基线。一个批量内策略与基线都固定：
          先收集全部轨迹并累积梯度，再统一更新 logits，最后才更新基线，避免批内样本使用不同估计器。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">算法、诊断与边界</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>冻结当前策略 πθ 与基线 b，按 on-policy 方式采样 N 条完整回合。</li>
          <li>从后向前计算每个时刻的 Gₜ，并累积固定批量梯度 ĝ。</li>
          <li>执行梯度上升 θ←θ+αĝ，再用批量目标拟合或更新基线。</li>
          <li>在新策略上重新采样，并监控回报分布、成功率、策略熵、梯度范数和独立评估结果。</li>
        </ol>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>高方差：</strong>终局稀疏奖励和长时域让信用分配困难，需要更多样本、优势估计或 actor–critic。</li>
          <li><strong>on-policy：</strong>直接复用旧策略轨迹会产生分布偏差；重要性采样虽可校正，但可能进一步增大方差。</li>
          <li><strong>局部优化：</strong>大步长会破坏策略；实际算法常用归一化、熵正则、梯度裁剪或信赖域约束。</li>
          <li><strong>安全与评估：</strong>训练回报不是部署保证，应单独报告失败率、约束违例、多随机种子和置信区间。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：表格 Softmax 策略</h2>
        <p className="text-gray-700 mb-4">
          五状态链从 s=2 开始：到达右端奖励 +1，到达左端奖励 −1，普通一步奖励 −0.02，最多 15 步。
          所有批量都由可复现的固定种子流生成。除采样回报外，演示还用环境的已知小型动态规划计算当前策略精确期望回报，
          仅用于诊断，不参与 REINFORCE 更新。
        </p>
        <ReinforceDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />课程总结</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            'REINFORCE 用 score function 和蒙特卡洛回报构造无模型策略梯度。',
            'reward-to-go 利用因果性；折扣目标对应的 γᵗ 权重必须保持一致。',
            '动作无关基线保持期望不变，并可在合适时降低方差。',
            '策略梯度将监督学习、概率建模、优化与序贯决策连接起来，也为 actor–critic 和现代策略优化奠定基础。',
          ].map((item) => <li key={item} className="flex items-start gap-2"><Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
      </section>
    </div>
  );
}

function zeroTheta() {
  return Array.from({ length: DEFAULT_CHAIN.stateCount }, () => new Array(CHAIN_ACTIONS.length).fill(0));
}

function ReinforceDemo() {
  const [theta, setTheta] = useState<number[][]>(zeroTheta);
  const [baselines, setBaselines] = useState<number[]>(() => new Array(DEFAULT_CHAIN.stateCount).fill(0));
  const [history, setHistory] = useState<number[]>([]);
  const [outcomes, setOutcomes] = useState<Episode['outcome'][]>([]);
  const [lastEpisode, setLastEpisode] = useState<Episode>(() => ({ states: [], actions: [], rewards: [], trajectory: [DEFAULT_CHAIN.startState], outcome: 'timeout' }));
  const [learningRate, setLearningRate] = useState(0.15);
  const [gamma, setGamma] = useState(0.99);
  const [batchSize, setBatchSize] = useState(20);
  const [useBaseline, setUseBaseline] = useState(true);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [seed, setSeed] = useState(1);
  const [gradientNorm, setGradientNorm] = useState(0);
  const [batchReturnStd, setBatchReturnStd] = useState(0);

  const policy = useMemo(() => policyFromTheta(theta), [theta]);
  const exactValue = useMemo(() => exactStartValue(policy, DEFAULT_CHAIN, gamma), [policy, gamma]);
  const entropy = useMemo(() => meanPolicyEntropy(policy, DEFAULT_CHAIN), [policy]);
  const recentOutcomes = outcomes.slice(-100);
  const recentReturns = history.slice(-100);
  const successRate = recentOutcomes.length > 0
    ? recentOutcomes.filter((outcome) => outcome === 'goal').length / recentOutcomes.length
    : 0;
  const recentMean = recentReturns.length > 0
    ? recentReturns.reduce((sum, value) => sum + value, 0) / recentReturns.length
    : 0;

  const train = (numberOfBatches: number) => {
    let nextTheta = theta;
    let nextBaselines = baselines;
    let nextSeed = seed;
    let finalEpisode = lastEpisode;
    let finalGradientNorm = gradientNorm;
    let finalReturnStd = batchReturnStd;
    const addedReturns: number[] = [];
    const addedOutcomes: Episode['outcome'][] = [];

    for (let batch = 0; batch < numberOfBatches; batch++) {
      const result = reinforceBatchStep(nextTheta, nextBaselines, DEFAULT_CHAIN, {
        learningRate,
        gamma,
        batchSize,
        useBaseline,
        baselineRate: 0.2,
        seed: nextSeed,
      });
      nextTheta = result.theta;
      nextBaselines = result.baselines;
      finalEpisode = result.lastEpisode;
      finalGradientNorm = result.gradientNorm;
      const mean = result.episodeReturns.reduce((sum, value) => sum + value, 0) / result.episodeReturns.length;
      finalReturnStd = Math.sqrt(result.episodeReturns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / result.episodeReturns.length);
      addedReturns.push(...result.episodeReturns);
      addedOutcomes.push(...result.outcomes);
      nextSeed += 1;
    }

    setTheta(nextTheta);
    setBaselines(nextBaselines);
    setLastEpisode(finalEpisode);
    setGradientNorm(finalGradientNorm);
    setBatchReturnStd(finalReturnStd);
    setHistory((current) => [...current, ...addedReturns].slice(-1000));
    setOutcomes((current) => [...current, ...addedOutcomes].slice(-1000));
    setEpisodeCount((current) => current + numberOfBatches * batchSize);
    setBatchCount((current) => current + numberOfBatches);
    setSeed(nextSeed);
  };

  const reset = () => {
    setTheta(zeroTheta());
    setBaselines(new Array(DEFAULT_CHAIN.stateCount).fill(0));
    setHistory([]);
    setOutcomes([]);
    setLastEpisode({ states: [], actions: [], rewards: [], trajectory: [DEFAULT_CHAIN.startState], outcome: 'timeout' });
    setEpisodeCount(0);
    setBatchCount(0);
    setSeed((current) => current + 1009);
    setGradientNorm(0);
    setBatchReturnStd(0);
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`学习率 α：${learningRate.toFixed(2)}`}><Slider aria-label="REINFORCE 学习率" value={[learningRate]} min={0.01} max={0.5} step={0.01} onValueChange={([value]) => setLearningRate(value)} /></Control>
        <Control label={`折扣 γ：${gamma.toFixed(2)}`}><Slider aria-label="REINFORCE 折扣因子" value={[gamma]} min={0.8} max={1} step={0.01} onValueChange={([value]) => setGamma(value)} /></Control>
        <Control label={`批量大小：${batchSize}`}><Slider aria-label="每个策略梯度批量的回合数" value={[batchSize]} min={1} max={100} step={1} onValueChange={([value]) => setBatchSize(value)} /></Control>
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => train(1)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><Play className="w-4 h-4" aria-hidden="true" />训练 1 批</button>
          <button type="button" onClick={() => train(20)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">连续 20 批</button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"><RefreshCw className="w-4 h-4" aria-hidden="true" />重置</button>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={useBaseline} onChange={(event) => setUseBaseline(event.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
        使用批后更新的状态基线
      </label>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><h4 className="text-sm font-semibold text-gray-800 mb-3">当前策略概率</h4><PolicyChart policy={policy} /></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><h4 className="text-sm font-semibold text-gray-800 mb-3">最近一条轨迹</h4><TrajectoryChart episode={lastEpisode} /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="精确期望折扣回报" value={exactValue.toFixed(3)} />
        <Metric label="近 100 幕采样均值" value={recentMean.toFixed(3)} />
        <Metric label="近 100 幕成功率" value={`${(100 * successRate).toFixed(1)}%`} />
        <Metric label="平均策略熵" value={`${entropy.toFixed(3)} nat`} />
        <Metric label="最近梯度范数" value={gradientNorm.toFixed(4)} />
        <Metric label="最近批量回报标准差" value={batchReturnStd.toFixed(3)} />
        <Metric label="已采样回合" value={String(episodeCount)} />
        <Metric label="已更新批次" value={String(batchCount)} />
      </div>

      <ReturnChart history={history} />
    </div>
  );
}

function PolicyChart({ policy }: { policy: number[][] }) {
  const chartId = useId().replace(/:/g, '');
  const cellWidth = 68;
  const chartHeight = 130;
  const width = policy.length * cellWidth;
  return (
    <svg viewBox={`0 0 ${width} ${chartHeight + 30}`} className="w-full" style={{ maxHeight: 190 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
      <title id={`${chartId}-title`}>五状态链的表格 Softmax 策略</title><desc id={`${chartId}-desc`}>每列为一个状态，红灰绿堆叠条分别表示向左、停留和向右的动作概率。</desc>
      {policy.map((probabilities, state) => {
        const terminal = state === DEFAULT_CHAIN.goalState || state === DEFAULT_CHAIN.trapState;
        const barX = state * cellWidth + 14;
        let cursor = chartHeight - 8;
        return <g key={state}><rect x={barX} y={10} width={40} height={chartHeight - 18} fill={terminal ? '#f3f4f6' : '#fff'} stroke="#e5e7eb" />{!terminal && probabilities.map((probability, action) => { const height = probability * (chartHeight - 18); const y = cursor - height; cursor = y; return <rect key={action} x={barX} y={y} width={40} height={Math.max(1, height)} fill={ACTION_COLORS[action]} stroke="white"><title>{ACTION_NAMES[action]} {(100 * probability).toFixed(1)}%</title></rect>; })}<text x={state * cellWidth + cellWidth / 2} y={chartHeight + 18} textAnchor="middle" fontSize={11} fill="#374151">{state === DEFAULT_CHAIN.trapState ? '陷阱' : state === DEFAULT_CHAIN.goalState ? '目标' : `s=${state}`}</text></g>;
      })}
    </svg>
  );
}

function TrajectoryChart({ episode }: { episode: Episode }) {
  const chartId = useId().replace(/:/g, '');
  const markerId = `${chartId}-arrow`;
  const cellWidth = 58;
  const width = DEFAULT_CHAIN.stateCount * cellWidth;
  const height = 92;
  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 120 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
        <title id={`${chartId}-title`}>最近一条 REINFORCE 采样轨迹</title><desc id={`${chartId}-desc`}>轨迹经过 {episode.trajectory.join('、')}，结果为 {episode.outcome}。</desc>
        <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 L2 4 Z" fill="#2563eb" /></marker></defs>
        {Array.from({ length: DEFAULT_CHAIN.stateCount }, (_, state) => <g key={state}><rect x={state * cellWidth + 2} y={10} width={cellWidth - 4} height={50} rx={4} fill={state === DEFAULT_CHAIN.goalState ? '#dcfce7' : state === DEFAULT_CHAIN.trapState ? '#fee2e2' : '#f3f4f6'} stroke="#d1d5db" /><text x={state * cellWidth + cellWidth / 2} y={40} textAnchor="middle" fontSize={12} fill="#374151">{state}</text></g>)}
        {episode.trajectory.slice(1).map((state, index) => { const previous = episode.trajectory[index]; return <line key={index} x1={previous * cellWidth + cellWidth / 2} y1={35 + index * 0.7} x2={state * cellWidth + cellWidth / 2} y2={35 + index * 0.7} stroke="#2563eb" strokeWidth={2} markerEnd={`url(#${markerId})`} />; })}
      </svg>
      <p className="text-xs text-gray-600">结果：{episode.outcome === 'goal' ? '到达目标' : episode.outcome === 'trap' ? '进入陷阱' : '步数耗尽'}；长度：{episode.states.length}</p>
    </div>
  );
}

function ReturnChart({ history }: { history: number[] }) {
  const chartId = useId().replace(/:/g, '');
  const width = 560;
  const height = 220;
  const padding = { top: 12, right: 16, bottom: 28, left: 44 };
  const displayed = history.slice(-300);
  const movingAverage = displayed.map((_, index) => {
    const window = displayed.slice(Math.max(0, index - 19), index + 1);
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  });
  const minimum = Math.min(-1.3, ...displayed);
  const maximum = Math.max(1, ...displayed);
  const range = maximum - minimum;
  const x = (index: number) => padding.left + (index / Math.max(1, displayed.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + (height - padding.top - padding.bottom) - ((value - minimum) / range) * (height - padding.top - padding.bottom);
  const path = (data: number[]) => data.map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`).join(' ');
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">最近 300 幕回报</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 260 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
        <title id={`${chartId}-title`}>REINFORCE 采样回报学习曲线</title><desc id={`${chartId}-desc`}>浅蓝线为单幕折扣回报，深蓝线为 20 幕移动平均。</desc>
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#d1d5db" /><line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} stroke="#e5e7eb" />
        {displayed.length > 0 && <path d={path(displayed)} fill="none" stroke="#bfdbfe" strokeWidth={1.5} />}{movingAverage.length > 0 && <path d={path(movingAverage)} fill="none" stroke="#2563eb" strokeWidth={2.5} />}
        <text x={padding.left} y={height - 6} fontSize={10} fill="#6b7280">{Math.max(0, history.length - displayed.length)}</text><text x={width - padding.right - 24} y={height - 6} fontSize={10} fill="#6b7280">{history.length}</text>
      </svg>
      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-200" />单幕回报</span><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" />20 幕移动平均</span></div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) { return <div><div className="text-sm font-medium text-gray-700 mb-2">{label}</div>{children}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><span className="block text-gray-600">{label}</span><span className="font-mono font-semibold text-blue-700">{value}</span></div>; }
