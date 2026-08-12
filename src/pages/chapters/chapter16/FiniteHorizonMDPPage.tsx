import { useId, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import {
  simulateFiniteHorizonChain,
  solveFiniteHorizonChain,
} from './controlMath';

const STATE_COUNT = 7;

export default function FiniteHorizonMDPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十六章 · 线性二次调节与最优控制
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">有限时域 MDP</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          有限时域把“还剩多少步”纳入决策：价值与策略随时刻变化，
          从明确的终端价值开始做一次反向动态规划即可得到精确解。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">统一索引：T 次决策与一个终端代价</h2>
        </div>
        <p className="text-gray-700 mb-4">
          本节采用清晰的约定：在 t=0,…,T−1 共做 T 次决策，产生阶段代价 cₜ；到达 S_T 后支付终端代价 g(S_T)。
          因为求和有限，不需要 γ 来保证收敛；若任务确实偏好近期结果，也可以显式保留折扣。
        </p>
        <FormulaCard
          title="有限时域目标"
          formula={
            <KaTeX
              math={String.raw`J^\pi_t(s)=\mathbb E_\pi\!\left[\sum_{k=t}^{T-1}c_k(S_k,A_k)+g(S_T)\mid S_t=s\right]`}
              display
            />
          }
          description="这里写成最小化代价；最大化奖励只需令奖励等于负代价。"
        />
        <p className="text-gray-700 mt-4">
          最优策略一般是非平稳的 πₜ(a|s)：即使物理状态相同，剩余 20 步与只剩 1 步时的最优动作也可能不同。
          将时刻 t 或剩余预算并入扩展状态后，它又可以视为平稳策略。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Bellman 反向递推</h2>
        <FormulaCard
          title="边界条件"
          formula={<KaTeX math={String.raw`V_T(s)=g(s)`} display />}
          description="t=T 时已经没有动作或阶段代价，终端价值由 g 决定。"
        />
        <FormulaCard
          title="反向 Bellman 方程"
          formula={
            <KaTeX
              math={String.raw`V_t(s)=\min_a\;\mathbb E\!\left[c_t(s,a,S_{t+1})+V_{t+1}(S_{t+1})\mid S_t=s,A_t=a\right]`}
              display
            />
          }
          description="从 t=T−1 递减到 0；每个状态保留达到最小值的动作即可得到 π*t。"
        />
        <p className="text-gray-700">
          与无限时域值迭代不同，这不是“迭代直到收敛”：有限状态、有限动作且模型已知时，
          一次长度为 T 的反向遍历就精确解出所定义的问题，计算量约为 O(T|S||A||S&apos;|)。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：终端目标的一维链</h2>
        <p className="text-gray-700 mb-4">
          七个状态中，每步选择左移、停留或右移；动作以侧滑概率失败并停在原地。
          中间奖励为 0，终端奖励为 −|S_T−目标|。热力图展示各时刻最优期望终端奖励，
          红点是由固定种子生成的一条可复现轨迹；表格同时显示这条样本轨迹的终端结果。
        </p>
        <FiniteHorizonChainDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            'T 次决策对应 t=0,…,T−1，S_T 只承接终端价值。',
            '有限时域策略通常随时间变化；扩展状态可显式记录剩余预算。',
            '反向归纳从边界条件开始，无需数值收敛循环。',
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

function FiniteHorizonChainDemo() {
  const [horizon, setHorizon] = useState(8);
  const [slip, setSlip] = useState(0.15);
  const [goal, setGoal] = useState(6);
  const [start, setStart] = useState(3);
  const [seed, setSeed] = useState(1);
  const markerPrefix = useId().replace(/:/g, '');

  const solution = useMemo(
    () => solveFiniteHorizonChain(horizon, STATE_COUNT, goal, slip),
    [horizon, goal, slip],
  );
  const trajectory = useMemo(
    () => simulateFiniteHorizonChain(solution.policy, start, STATE_COUNT, slip, seed),
    [solution.policy, start, slip, seed],
  );
  const terminalState = trajectory[trajectory.length - 1].state;
  const realizedReward = -Math.abs(terminalState - goal);
  const values = solution.values.flat();
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const cellWidth = 56;
  const cellHeight = 44;
  const svgWidth = STATE_COUNT * cellWidth;
  const svgHeight = (horizon + 1) * cellHeight;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`决策步数 T：${horizon}`}>
          <Slider aria-label="有限时域决策步数" value={[horizon]} min={3} max={12} step={1} onValueChange={([value]) => setHorizon(value)} />
        </Control>
        <Control label={`动作失败概率：${slip.toFixed(2)}`}>
          <Slider aria-label="动作失败并停留的概率" value={[slip]} min={0} max={0.5} step={0.05} onValueChange={([value]) => setSlip(value)} />
        </Control>
        <Control label={`目标位置：${goal}`}>
          <Slider aria-label="一维链目标位置" value={[goal]} min={0} max={STATE_COUNT - 1} step={1} onValueChange={([value]) => setGoal(value)} />
        </Control>
        <Control label={`起点位置：${start}`}>
          <Slider aria-label="一维链起点位置" value={[start]} min={0} max={STATE_COUNT - 1} step={1} onValueChange={([value]) => setStart(value)} />
        </Control>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSeed((current) => current + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          重新模拟轨迹
        </button>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[360px]"
          style={{ maxHeight: 480 }}
          role="img"
          aria-labelledby={`${markerPrefix}-title ${markerPrefix}-desc`}
        >
          <title id={`${markerPrefix}-title`}>有限时域一维链的价值、策略和样本轨迹</title>
          <desc id={`${markerPrefix}-desc`}>
            从起点 {start} 出发，经过 {horizon} 次决策后到达 {terminalState}；目标为 {goal}。
          </desc>
          <defs>
            <marker id={`${markerPrefix}-left`} markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto"><path d="M8 0 L0 4 L8 8 L6 4 Z" fill="#2563eb" /></marker>
            <marker id={`${markerPrefix}-right`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 L2 4 Z" fill="#2563eb" /></marker>
          </defs>
          {solution.values.map((row, time) => row.map((value, state) => {
            const x = state * cellWidth;
            const y = time * cellHeight;
            const normalized = (value - minimum) / range;
            const hue = Math.round(220 * normalized);
            return (
              <g key={`${time}-${state}`}>
                <rect x={x + 1} y={y + 1} width={cellWidth - 2} height={cellHeight - 2} rx={4} fill={`hsl(${hue}, 80%, 90%)`} stroke={state === goal ? '#16a34a' : '#d1d5db'} strokeWidth={state === goal ? 2 : 1} />
                <text x={x + cellWidth / 2} y={y + cellHeight / 2 + 3} textAnchor="middle" fontSize={11} fill="#1f2937">{value.toFixed(2)}</text>
                {time < horizon && <ActionSymbol x={x + cellWidth / 2} y={y + cellHeight - 6} action={solution.policy[time][state]} markerPrefix={markerPrefix} />}
              </g>
            );
          }))}
          {trajectory.map(({ state, time }) => (
            <circle key={`trajectory-${time}`} cx={state * cellWidth + cellWidth / 2} cy={time * cellHeight + cellHeight / 2} r={5} fill="#dc2626" opacity={0.85} />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="最优期望终端奖励" value={solution.values[0][start].toFixed(3)} />
        <Metric label="样本终点" value={String(terminalState)} />
        <Metric label="样本终端奖励" value={realizedReward.toFixed(0)} />
        <Metric label="随机种子" value={String(seed)} />
      </div>
    </div>
  );
}

function ActionSymbol({ x, y, action, markerPrefix }: { x: number; y: number; action: number; markerPrefix: string }) {
  if (action === 0) return <circle cx={x} cy={y} r={2.5} fill="#2563eb" />;
  const dx = action * 12;
  return <line x1={x - dx * 0.35} y1={y} x2={x + dx * 0.35} y2={y} stroke="#2563eb" strokeWidth={2} markerEnd={action > 0 ? `url(#${markerPrefix}-right)` : `url(#${markerPrefix}-left)`} />;
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <div><div className="block text-sm font-medium text-gray-700 mb-2">{label}</div>{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-gray-50 p-3"><span className="block text-gray-600">{label}</span><span className="font-mono font-semibold text-blue-700">{value}</span></div>;
}
