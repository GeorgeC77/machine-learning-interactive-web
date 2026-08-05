import { useMemo, useState, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2, RefreshCw, Play , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function PolicyGradientPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十七章 · 策略梯度
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">策略梯度（REINFORCE）</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          前面的方法大多先学习价值函数，再从中导出策略。本章介绍一种直接的模型无关算法 REINFORCE：
          用梯度上升直接优化参数化策略，无需显式知道转移概率与奖励函数的形式。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">从价值函数到策略梯度</h2>
        </div>
        <p className="text-gray-700 mb-4">
          REINFORCE 只假设我们能从环境中采样轨迹，并能观测到奖励；它不需要建立环境模型。
          我们用带参数 <em>θ</em> 的随机策略 π_θ(a|s)<KaTeX math={String.raw`\pi_\theta(a \mid s)`} /> 描述动作分布。
        </p>
        <p className="text-gray-700 mb-4">
          在有限时域设定下，一条轨迹由状态、动作和奖励交替组成。关键记号如下：
        </p>
        <FormulaCard
          title="关键记号"
          formula={
            <KaTeX
              math={String.raw`\begin{aligned} \pi_\theta(a \mid s) &: \text{随机策略} \\ \tau &= (s_0, a_0, r_0, \dots, s_T) \\ G(\tau) &= \sum_{t=0}^{T-1} \gamma^t r_t \\ J(\theta) &= \mathbb{E}_{\tau \sim \pi_\theta}\bigl[G(\tau)\bigr] \\ \nabla_\theta J(\theta) &= \mathbb{E}_{\tau \sim \pi_\theta}\bigl[G(\tau) \, \nabla_\theta \log p_\theta(\tau)\bigr] \\ G_t &= \sum_{k=t}^{T-1} \gamma^{k-t} r_k \end{aligned}`}
              display
            />
          }
          description="r_t 是时刻 t 的即时奖励，γ 是折扣因子；在简化讨论中也可取 γ = 1。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：G_t = Σ_{k=t}^{T−1} γ^{k−t} r_k'}
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">对数似然梯度技巧</h2>
        <p className="text-gray-700 mb-4">
          由于期望内部含有依赖于 <em>θ</em> 的分布，直接求梯度会遇到困难。利用恒等式
          ∇θ pθ(τ) = pθ(τ) ∇θ log pθ(τ) 可把梯度移到期望内部：
        </p>
        <FormulaCard
          title="策略梯度基本等式"
          formula={
            <KaTeX
              math={String.raw`\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\bigl[G(\tau) \, \nabla_\theta \log p_\theta(\tau)\bigr]`}
              display
            />
          }
          description="回报 G(τ) 作为权重；这就是对数导数技巧（log-derivative trick）。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：∇θ J(θ) = E_{τ~πθ}[ G(τ) ∇θ log pθ(τ) ]'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          轨迹概率可分解为初始状态、策略选择与转移概率的乘积：
        </p>
        <FormulaCard
          title="轨迹概率分解"
          formula={
            <KaTeX
              math={String.raw`p_\theta(\tau) = \mu(s_0) \prod_{t=0}^{T-1} \pi_\theta(a_t \mid s_t) \, P(s_{t+1} \mid s_t, a_t)`}
              display
            />
          }
          description="取对数后，转移概率项与 θ 无关，求梯度时会消失。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：pθ(τ) = μ(s0) ∏_{t=0}^{T-1} πθ(at|st) P(st+1|st,at)'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          因此梯度可写成仅含策略对数似然的形式：
        </p>
        <FormulaCard
          title="REINFORCE 梯度"
          formula={
            <KaTeX
              math={String.raw`\nabla_\theta J(\theta) = \mathbb{E}_{\tau}\left[\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \, G(\tau)\right]`}
              display
            />
          }
          description="整个轨迹的回报 G(τ) 作为权重，调整每个访问过的状态-动作对的出现概率。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：∇θ J(θ) = E_{τ}[ Σ_{t=0}^{T-1} ∇θ log πθ(at|st) G(τ) ]'}
        </p>
        <p className="text-gray-700 mt-4">
          直观解释：如果轨迹回报或优势函数为正，就增加对应动作序列的概率；如果为负，就降低其概率。使用 baseline 后，更新方向由 G_t − B(s_t) 的符号决定。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">REINFORCE 算法</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>用当前策略 π_θ(a|s)<KaTeX math={String.raw`\pi_\theta(a \mid s)`} /> 采样若干条轨迹。</li>
          <li>对每条轨迹计算累积回报 G(τ)<KaTeX math={String.raw`G(\tau)`} />。</li>
          <li>用蒙特卡洛估计梯度 ∇J(θ)<KaTeX math={String.raw`\widehat{\nabla J} = \frac{1}{n}\sum_i \bigl(\sum_t \nabla_\theta \log \pi_\theta(a_t^{(i)} \mid s_t^{(i)})\bigr) G(\tau^{(i)})`} />。</li>
          <li>沿梯度方向更新参数 θ := θ + α∇̂J(θ)<KaTeX math={String.raw`\theta := \theta + \alpha \, \widehat{\nabla J}(\theta)`} />。</li>
        </ol>
        <p className="text-gray-700">
          这是无模型、基于采样的策略优化基础；后续更高级算法（如 Actor-Critic）在此基础上引入价值函数来降低方差。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">引入基线降低方差</h2>
        <p className="text-gray-700 mb-4">
          一个重要事实是：对任意状态 <em>s</em>，
        </p>
        <FormulaCard
          title="对数似然梯度的期望为零"
          formula={
            <KaTeX
              math={String.raw`\mathbb{E}_{a \sim \pi_\theta(\cdot \mid s)} \bigl[\nabla_\theta \log \pi_\theta(a \mid s)\bigr] = 0`}
              display
            />
          }
          description="因此可以在回报中减去任意只依赖状态的基线 B(s) 而不引入偏差。"
        />
        <p className="text-gray-700 mt-4 mb-4">
          把累积回报替换为从 <em>t</em> 时刻开始的回报，并减去基线，得到更常用的形式：
        </p>
        <FormulaCard
          title="带基线的策略梯度"
          formula={
            <KaTeX
              math={String.raw`\nabla_\theta J(\theta) = \mathbb{E}_\tau\left[\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \bigl(G_t - B(s_t)\bigr)\right]`}
              display
            />
          }
          description="其中 G_t = Σ_{k=t}^{T−1} γ^{k−t} r_k 表示从 t 时刻起打折后的未来回报。合适的基线能显著降低梯度估计方差。"
        />
        <p className="text-gray-700 mt-4">
          注意：基线只能依赖状态，不能依赖当前采样的动作；这样不会改变策略梯度的期望，只会降低方差。
          实践中常用价值函数 V_φ(s_t)<KaTeX math={String.raw`V_\phi(s_t)`} /> 作为基线，并通过最小化 (G_t − V_φ(s_t))²<KaTeX math={String.raw`(G_t - V_\phi(s_t))^2`} /> 来拟合它。
        </p>
        <p className="text-gray-700 mt-4 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
          教学说明：为简化演示，下面的 REINFORCE 交互把基线实现为同一批轨迹中该状态所获回报的指数滑动平均；理论上更标准的做法是单独学习一个状态价值函数 V(s) 作为基线。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：REINFORCE 学习一维链</h2>
        <p className="text-gray-700 mb-4">
          下面是一个 5 状态的一维链：最右端是奖励 +1 的目标，最左端是奖励 -1 的陷阱。
          策略用表格 Softmax 表示。运行 REINFORCE，观察动作概率如何逐渐偏向向右移动。
        </p>
        <ReinforceDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>REINFORCE 直接对策略参数做梯度上升，无需学习转移模型。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>对数导数技巧把分布梯度转化为对数概率梯度，转移概率项自动消失。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>引入基线能降低方差而不改变梯度期望；常见基线是状态价值函数。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

const N = 5;
const ACTIONS = [-1, 0, 1];
const ACTION_NAMES = ['左', '停', '右'];
const START = 2;
const GOAL = N - 1;
const TRAP = 0;
const MAX_STEPS = 15;

function ReinforceDemo() {
  const [theta, setTheta] = useState<number[][]>(() =>
    Array.from({ length: N }, () => new Array(ACTIONS.length).fill(0))
  );
  const [baseline, setBaseline] = useState<number[]>(() => new Array(N).fill(0));
  const [history, setHistory] = useState<number[]>([]);
  const [lastTrajectory, setLastTrajectory] = useState<number[]>([START]);
  const [lr, setLr] = useState(0.15);
  const [gamma, setGamma] = useState(0.99);
  const [batchSize, setBatchSize] = useState(10);
  const [useBaseline, setUseBaseline] = useState(true);
  const [episodeCount, setEpisodeCount] = useState(0);

  const policy = useMemo(() => theta.map((row) => softmax(row)), [theta]);

  const runBatch = () => {
    // 标准 batch REINFORCE：先在固定旧策略下累积梯度，再统一更新参数
    const gradTheta = Array.from({ length: N }, () => new Array(ACTIONS.length).fill(0));
    let newBaseline = [...baseline];
    const returns: number[] = [];
    let lastTraj: number[] = [START];

    for (let b = 0; b < batchSize; b++) {
      const { states, actions, rewards, trajectory } = sampleEpisode(policy);
      lastTraj = trajectory;
      const T = states.length;
      const Gs = new Array(T).fill(0);
      let G = 0;
      for (let t = T - 1; t >= 0; t--) {
        G = rewards[t] + gamma * G;
        Gs[t] = G;
      }
      returns.push(Gs[0]);

      for (let t = 0; t < T; t++) {
        const s = states[t];
        const a = actions[t];
        const adv = Gs[t] - (useBaseline ? newBaseline[s] : 0);
        const probs = policy[s];
        for (let ai = 0; ai < ACTIONS.length; ai++) {
          const indicator = ai === a ? 1 : 0;
          gradTheta[s][ai] += (1 / batchSize) * adv * (indicator - probs[ai]);
        }
        if (useBaseline) {
          newBaseline[s] = 0.9 * newBaseline[s] + 0.1 * Gs[t];
        }
      }
    }

    setTheta((current) =>
      current.map((row, s) => row.map((val, ai) => val + lr * gradTheta[s][ai]))
    );
    setBaseline(newBaseline);
    setHistory((h) => [...h, ...returns]);
    setLastTrajectory(lastTraj);
    setEpisodeCount((c) => c + batchSize);
  };

  const reset = () => {
    setTheta(Array.from({ length: N }, () => new Array(ACTIONS.length).fill(0)));
    setBaseline(new Array(N).fill(0));
    setHistory([]);
    setLastTrajectory([START]);
    setEpisodeCount(0);
  };

  const avgReturn =
    history.length > 0 ? history.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, history.length) : 0;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`学习率 α: ${lr.toFixed(2)}`}>
          <Slider value={[lr]} min={0.01} max={0.5} step={0.01} onValueChange={(v) => setLr(v[0])} />
        </Control>
        <Control label={`折扣 γ: ${gamma.toFixed(2)}`}>
          <Slider value={[gamma]} min={0.8} max={1.0} step={0.01} onValueChange={(v) => setGamma(v[0])} />
        </Control>
        <Control label={`批量大小: ${batchSize}`}>
          <Slider value={[batchSize]} min={1} max={50} step={1} onValueChange={(v) => setBatchSize(v[0])} />
        </Control>
        <div className="flex items-end gap-2">
          <button
            onClick={runBatch}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            运行 {batchSize} 幕
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={useBaseline}
            onChange={(e) => setUseBaseline(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          使用基线降低方差
        </label>
        <span className="text-sm text-gray-600">
          已采样幕数：<span className="font-mono font-medium text-blue-700">{episodeCount}</span>
        </span>
        <span className="text-sm text-gray-600">
          近 20 幕平均回报：<span className="font-mono font-medium text-blue-700">{avgReturn.toFixed(3)}</span>
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">当前策略（动作概率）</h4>
          <PolicyChart policy={policy} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">最近一条轨迹</h4>
          <TrajectoryChart trajectory={lastTrajectory} />
        </div>
      </div>

      <ReturnChart history={history} />
    </div>
  );
}

function sampleEpisode(policy: number[][]) {
  const states: number[] = [];
  const actions: number[] = [];
  const rewards: number[] = [];
  const trajectory: number[] = [START];
  let s = START;
  for (let step = 0; step < MAX_STEPS; step++) {
    const a = sampleAction(policy[s]);
    const next = Math.max(0, Math.min(N - 1, s + ACTIONS[a]));
    let r = -0.02;
    if (next === GOAL) r = 1;
    else if (next === TRAP) r = -1;
    states.push(s);
    actions.push(a);
    rewards.push(r);
    trajectory.push(next);
    s = next;
    if (s === GOAL || s === TRAP) break;
  }
  return { states, actions, rewards, trajectory };
}

function softmax(logits: number[]) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function sampleAction(probs: number[]) {
  const u = Math.random();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (u <= cum) return i;
  }
  return probs.length - 1;
}

function PolicyChart({ policy }: { policy: number[][] }) {
  const cellW = 64;
  const cellH = 120;
  const barW = 40;
  const svgW = N * cellW;
  const svgH = cellH + 32;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 180 }}>
      {policy.map((probs, s) => {
        const x = s * cellW + (cellW - barW) / 2;
        let y = cellH - 8;
        return (
          <g key={s}>
            <text x={s * cellW + cellW / 2} y={cellH + 18} textAnchor="middle" fontSize={12} fill="#374151">
              s={s}
            </text>
            {probs.map((p, ai) => {
              const h = p * (cellH - 24);
              const barY = y - h;
              y -= h;
              const color = ai === 0 ? '#ef4444' : ai === 1 ? '#9ca3af' : '#22c55e';
              return (
                <rect
                  key={ai}
                  x={x}
                  y={barY}
                  width={barW}
                  height={Math.max(1, h)}
                  fill={color}
                  stroke="white"
                  strokeWidth={1}
                  rx={2}
                >
                  <title>{ACTION_NAMES[ai]}: {(p * 100).toFixed(1)}%</title>
                </rect>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function TrajectoryChart({ trajectory }: { trajectory: number[] }) {
  const cellW = 56;
  const cellH = 56;
  const svgW = Math.max(trajectory.length * cellW, N * cellW);
  const svgH = cellH + 28;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 120 }}>
      {Array.from({ length: N }).map((_, s) => (
        <g key={s}>
          <rect x={s * cellW + 2} y={2} width={cellW - 4} height={cellH - 4} rx={4} fill="#f3f4f6" stroke="#d1d5db" />
          <text x={s * cellW + cellW / 2} y={cellH / 2 + 4} textAnchor="middle" fontSize={12} fill="#374151">
            {s}
          </text>
        </g>
      ))}
      {trajectory.map((s, t) => {
        const cx = s * cellW + cellW / 2;
        const cy = cellH / 2;
        return <circle key={t} cx={cx} cy={cy} r={5} fill="#2563eb" opacity={0.7 + 0.3 * (t / Math.max(1, trajectory.length))} />;
      })}
      {trajectory.map((s, t) => {
        if (t === 0) return null;
        const x1 = trajectory[t - 1] * cellW + cellW / 2;
        const x2 = s * cellW + cellW / 2;
        const y = cellH / 2;
        return (
          <line
            key={`line-${t}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="#2563eb"
            strokeWidth={2}
            markerEnd="url(#arrow-blue)"
          />
        );
      })}
      <defs>
        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 L2 4 Z" fill="#2563eb" />
        </marker>
      </defs>
    </svg>
  );
}

function ReturnChart({ history }: { history: number[] }) {
  const width = 560;
  const height = 220;
  const pad = { top: 12, right: 16, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const data = history.map((v, i) => ({ i: i + 1, v }));
  const windowed =
    history.length >= 5
      ? history.map((_, i) => {
          const slice = history.slice(Math.max(0, i - 4), i + 1);
          return { i: i + 1, v: slice.reduce((a, b) => a + b, 0) / slice.length };
        })
      : [];

  const values = history;
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values, 1);
  const range = Math.max(1e-6, max - min);

  const x = (i: number) => pad.left + ((i - 1) / Math.max(1, data.length - 1)) * innerW;
  const y = (v: number) => pad.top + innerH - ((v - min) / range) * innerH;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">每幕回报与学习曲线</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 260 }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#d1d5db" strokeWidth={1} />
        <line x1={pad.left} y1={y(0)} x2={width - pad.right} y2={y(0)} stroke="#e5e7eb" strokeWidth={1} />
        {data.length > 0 && (
          <path
            d={data.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i)} ${y(p.v)}`).join(' ')}
            fill="none"
            stroke="#bfdbfe"
            strokeWidth={1.5}
          />
        )}
        {windowed.length > 0 && (
          <path
            d={windowed.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i)} ${y(p.v)}`).join(' ')}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2.5}
          />
        )}
        {data.map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r={2} fill="#60a5fa" opacity={0.6} />
        ))}
        <text x={pad.left} y={height - 6} fontSize={10} fill="#6b7280">
          0
        </text>
        <text x={width - pad.right - 20} y={height - 6} fontSize={10} fill="#6b7280">
          {data.length}
        </text>
        <text x={6} y={pad.top + 8} fontSize={10} fill="#6b7280">
          {max.toFixed(2)}
        </text>
        <text x={6} y={height - pad.bottom - 2} fontSize={10} fill="#6b7280">
          {min.toFixed(2)}
        </text>
      </svg>
      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400" />单幕回报</span>
        <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" />5 幕滑动平均</span>
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
