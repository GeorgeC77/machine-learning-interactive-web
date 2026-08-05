import { useMemo, useState, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2, RefreshCw , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function FiniteHorizonMDPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十六章 · 线性二次调节与最优控制
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">有限时域 MDP</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          前面介绍的马尔可夫决策过程通常假设无限时域与折扣奖励。本节把框架推广到有限时域，
          得到一种自然的时间相关动态规划解法，并为线性二次调节（LQR）奠定基础。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">从无限时域到有限时域</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在无限时域 MDP 中，回报通常写成带折扣因子的无穷级数：
        </p>
        <FormulaCard
          title="无限时域回报"
          formula={
            <KaTeX
              math={String.raw`R(s_0,a_0) + \gamma R(s_1,a_1) + \gamma^2 R(s_2,a_2) + \cdots`}
              display
            />
          }
          description="折扣因子 γ 保证无穷求和收敛，并让近期奖励更重要。"
        />
        <p className="text-gray-700 mt-4 mb-4">
          有限时域 MDP 只考虑前 <em>T</em> 个时间步，回报变成有限和，因此不需要依靠折扣因子来保证收敛；但在某些任务中，仍可以保留折扣因子来表达对近期奖励的偏好：
        </p>
        <FormulaCard
          title="有限时域回报"
          formula={
            <KaTeX
              math={String.raw`R^{(0)}(s_0,a_0) + R^{(1)}(s_1,a_1) + \cdots + R^{(T)}(s_T,a_T)`}
              display
            />
          }
          description="T 是固定的时间范围，例如 100 步。"
        />
        <p className="text-gray-700 mt-4">
          由于时间有限，最优策略可能随时间变化，即它是<strong>非平稳</strong>的，记为 π^(t)(s)<KaTeX math={String.raw`\pi^{(t)}(s)`} />。直观地说，在终点附近与在起点处的最优选择可以不同。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">有限时域 Bellman 方程</h2>
        <p className="text-gray-700 mb-4">
          为了同时适用于离散与连续状态空间，我们用期望符号表示下一状态的价值：
        </p>
        <FormulaCard
          title="动作价值形式的 Bellman 最优方程"
          formula={
            <KaTeX
              math={String.raw`V^*(s) = \max_{a\in A} \Bigl[ R(s,a) + \gamma \, \mathbb{E}_{s'\sim P(\cdot|s,a)}\bigl[V^*(s')\bigr] \Bigr]`}
              display
            />
          }
          description="对离散状态，期望退化为求和；对连续状态，期望退化为积分。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：V^*(s) = max_a [ R(s,a) + γ E_{s\'~P(·|s,a)}[V^*(s\')] ]'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          在有限时域下，价值函数也带时间下标。终点处的价值只由即时奖励决定：
        </p>
        <FormulaCard
          title="终点初始化"
          formula={
            <KaTeX
              math={String.raw`V_T(s) = \max_{a\in A} R^{(T)}(s,a)`}
              display
            />
          }
          description="在 t = T 时没有未来，只需最大化当前奖励。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：V_T(s) = max_a R^{(T)}(s,a)'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          对更早的时刻，利用动态规划反向递推：
        </p>
        <FormulaCard
          title="反向递推"
          formula={
            <KaTeX
              math={String.raw`V_t(s) = \max_{a\in A} \Bigl[ R^{(t)}(s,a) + \mathbb{E}_{s'\sim P^{(t)}(\cdot|s,a)}\bigl[V_{t+1}(s')\bigr] \Bigr]`}
              display
            />
          }
          description="已知 t+1 时刻的最优价值，就能算出 t 时刻的最优价值。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：V_t(s) = max_a [ R^{(t)}(s,a) + E_{s\'~P^{(t)}(·|s,a)}[V_{t+1}(s\')] ]'}
        </p>
        <p className="text-gray-700 mt-4">
          转移概率和奖励都可以显式依赖于时间。这种写法等价于把“剩余时间”也放进状态里。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">反向归纳算法</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>对所有状态 <em>s</em>，用终点初始化公式计算 V_T(s)<KaTeX math={String.raw`V_T(s)`} />。</li>
          <li>从 <em>t = T − 1</em> 递减到 <em>0</em>，用反向递推公式计算 V_t(s)<KaTeX math={String.raw`V_t(s)`} />。</li>
          <li>得到的最优策略为 π^(t)(s)<KaTeX math={String.raw`\pi^{(t)}(s) = \arg\max_a \bigl[\cdots\bigr]`} />。</li>
        </ol>
        <p className="text-gray-700">
          这与无限时域值迭代不同：值迭代是反复应用 Bellman 算子直到收敛；而有限时域问题只需一次从终点到起点的反向遍历即可得到精确解。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：有限时域一维链</h2>
        <p className="text-gray-700 mb-4">
          下面是一个 7 状态的一维链。每一步可以选择向左、停留或向右；动作可能以一定概率“打滑”而失败。
          终点奖励等于与目标位置距离的相反数。调整时间范围与打滑概率，观察最优策略如何随剩余时间变化。
          本演示采用终端奖励设定：只有到达时间 T 时根据与目标位置的距离给出奖励，中间步骤没有额外即时奖励。
        </p>
        <FiniteHorizonChainDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>有限时域 MDP 用有限累积回报描述决策问题，最优策略可能非平稳。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>终点价值只由即时奖励决定；更早时刻通过反向 Bellman 方程递推。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>动态规划把多阶段决策问题拆成一系列单步优化，是 LQR、DDP 等算法的基础。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

const N = 7;
const ACTIONS = [-1, 0, 1];

function FiniteHorizonChainDemo() {
  const [horizon, setHorizon] = useState(8);
  const [slip, setSlip] = useState(0.15);
  const [goal, setGoal] = useState(6);
  const [start, setStart] = useState(3);
  const [runKey, setRunKey] = useState(0);

  const { V, policy } = useMemo(() => {
    const Vmat: number[][] = Array.from({ length: horizon + 1 }, () => new Array(N).fill(0));
    const Pol: number[][] = Array.from({ length: horizon }, () => new Array(N).fill(1));

    for (let s = 0; s < N; s++) {
      Vmat[horizon][s] = terminalReward(s, goal);
    }

    for (let t = horizon - 1; t >= 0; t--) {
      for (let s = 0; s < N; s++) {
        let bestVal = -Infinity;
        let bestA = 0;
        for (const a of ACTIONS) {
          const intended = clamp(s + a, 0, N - 1);
          const val = (1 - slip) * Vmat[t + 1][intended] + slip * Vmat[t + 1][s];
          if (val > bestVal + 1e-9) {
            bestVal = val;
            bestA = a;
          }
        }
        Vmat[t][s] = bestVal;
        Pol[t][s] = bestA;
      }
    }
    return { V: Vmat, policy: Pol };
  }, [horizon, slip, goal]);

  const trajectory = useMemo(() => {
    const path: number[] = [start];
    let s = start;
    for (let t = 0; t < horizon; t++) {
      const a = policy[t][s];
      const intended = clamp(s + a, 0, N - 1);
      const next = Math.random() < slip ? s : intended;
      path.push(next);
      s = next;
    }
    return path;
  }, [horizon, start, policy, runKey]);

  const flatV = V.flat();
  const minV = Math.min(...flatV);
  const maxV = Math.max(...flatV);
  const rangeV = maxV - minV || 1;

  const cellW = 56;
  const cellH = 44;
  const svgW = N * cellW;
  const svgH = (horizon + 1) * cellH;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`时间范围 T: ${horizon}`}>
          <Slider value={[horizon]} min={3} max={12} step={1} onValueChange={(v) => setHorizon(v[0])} />
        </Control>
        <Control label={`打滑概率: ${slip.toFixed(2)}`}>
          <Slider value={[slip]} min={0} max={0.5} step={0.05} onValueChange={(v) => setSlip(v[0])} />
        </Control>
        <Control label={`目标位置: ${goal}`}>
          <Slider value={[goal]} min={0} max={N - 1} step={1} onValueChange={(v) => setGoal(v[0])} />
        </Control>
        <Control label={`起点位置: ${start}`}>
          <Slider value={[start]} min={0} max={N - 1} step={1} onValueChange={(v) => setStart(v[0])} />
        </Control>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setRunKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重新模拟
        </button>
        <span className="text-sm text-gray-600">
          累计回报：
          <span className="font-mono font-medium text-blue-700">{V[0][start].toFixed(3)}</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[360px]" style={{ maxHeight: 480 }}>
          <defs>
            <marker id="arrow-left" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
              <path d="M8 0 L0 4 L8 8 L6 4 Z" fill="#2563eb" />
            </marker>
            <marker id="arrow-right" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 L2 4 Z" fill="#2563eb" />
            </marker>
          </defs>
          {V.map((row, t) =>
            row.map((value, s) => {
              const x = s * cellW;
              const y = t * cellH;
              const norm = (value - minV) / rangeV;
              const hue = Math.round(220 * norm);
              const isGoal = s === goal;
              return (
                <g key={`${t}-${s}`}>
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={cellW - 2}
                    height={cellH - 2}
                    rx={4}
                    fill={`hsl(${hue}, 80%, 90%)`}
                    stroke={isGoal ? '#16a34a' : '#d1d5db'}
                    strokeWidth={isGoal ? 2 : 1}
                  />
                  <text x={x + cellW / 2} y={y + cellH / 2 + 3} textAnchor="middle" fontSize={11} fill="#1f2937">
                    {value.toFixed(2)}
                  </text>
                  {t < horizon && (
                    <ActionSymbol x={x + cellW / 2} y={y + cellH - 6} action={policy[t][s]} />
                  )}
                </g>
              );
            })
          )}
          {trajectory.map((s, t) => {
            const cx = s * cellW + cellW / 2;
            const cy = t * cellH + cellH / 2;
            return (
              <circle key={`traj-${t}`} cx={cx} cy={cy} r={5} fill="#dc2626" opacity={0.85}>
                <title>第 {t} 步：状态 {s}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="text-sm text-gray-600">
        每一行代表一个时刻 <em>t</em>，越往下越接近终点。格子数值是 V_t(s)<KaTeX math={String.raw`V_t(s)`} />，
        小箭头表示该时刻该状态下的最优动作。红色圆点显示一次按策略执行的随机轨迹。
      </div>
    </div>
  );
}

function ActionSymbol({ x, y, action }: { x: number; y: number; action: number }) {
  if (action === 0) {
    return <circle cx={x} cy={y} r={2.5} fill="#2563eb" />;
  }
  const dx = action * 12;
  return (
    <line
      x1={x - dx * 0.35}
      y1={y}
      x2={x + dx * 0.35}
      y2={y}
      stroke="#2563eb"
      strokeWidth={2}
      markerEnd={action > 0 ? 'url(#arrow-right)' : 'url(#arrow-left)'}
    />
  );
}

function terminalReward(s: number, goal: number) {
  return -Math.abs(s - goal);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
