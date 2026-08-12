import { useId, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import {
  closedLoopMatrix,
  simulateLqr,
  solveFiniteHorizonLqr,
  spectralRadius2,
  type Matrix2,
  type Vector2,
} from './controlMath';

export default function LQRPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">第十六章 · 线性二次调节与最优控制</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">线性二次调节（LQR）</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          LQR 将线性动力学与凸二次代价结合。有限时域动态规划保持价值函数为二次型，
          因而最优控制是随时间变化的线性状态反馈。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" aria-hidden="true" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4"><Activity className="w-6 h-6 text-blue-600" aria-hidden="true" /><h2 className="text-2xl font-bold text-gray-900">标准有限时域设定</h2></div>
        <FormulaCard
          title="离散线性动力学"
          formula={<KaTeX math={String.raw`x_{t+1}=A_t x_t+B_t u_t+w_t,\qquad \mathbb E[w_t]=0`} display />}
          description="状态 x 与输入 u 可以是向量；噪声假设与控制无关。确定性 LQR 取 wₜ=0。"
        />
        <div className="mt-4">
          <FormulaCard
            title="二次总代价"
            formula={<KaTeX math={String.raw`J=\mathbb E\!\left[\sum_{t=0}^{T-1}(x_t^\top Q_t x_t+u_t^\top R_t u_t)+x_T^\top Q_Tx_T\right]`} display />}
            description="通常要求 Qₜ,Q_T 半正定、Rₜ 正定；这样每步对 u 的最小化严格凸。"
          />
        </div>
        <p className="text-gray-700 mt-4">
          目标若不是原点，应对误差 δx=x−x̄ 和 δu=u−ū 建模。输入饱和、状态约束、非二次代价或乘性噪声会破坏标准闭式解，
          此时通常使用受约束优化、MPC 或近似动态规划。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Riccati 反向递推</h2>
        <p className="text-gray-700">设 Vₜ₊₁(x)=xᵀPₜ₊₁x+cₜ₊₁，完成平方可得：</p>
        <FormulaCard
          title="反馈增益"
          formula={<KaTeX math={String.raw`K_t=(R_t+B_t^\top P_{t+1}B_t)^{-1}B_t^\top P_{t+1}A_t,\qquad u_t^*=-K_tx_t`} display />}
          description="矩阵求逆只发生在输入维度；数值实现通常解线性方程而非显式求逆。"
        />
        <FormulaCard
          title="离散 Riccati 方程"
          formula={<KaTeX math={String.raw`P_t=Q_t+A_t^\top P_{t+1}A_t-A_t^\top P_{t+1}B_t(R_t+B_t^\top P_{t+1}B_t)^{-1}B_t^\top P_{t+1}A_t`} display />}
          description="以 P_T=Q_T 为边界从后向前计算。加性零均值噪声只增加价值函数常数项，不改变这些增益。"
        />
        <p className="text-gray-700">
          无限时域定常 LQR 还需要可稳定化/可检测等条件，Riccati 递推才会趋于稳定解；
          有限时域增益 Kₜ 一般随 t 变化，不能仅用 K₀ 代替全部反馈律。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：离散双积分器</h2>
        <p className="text-gray-700 mb-4">
          状态为位置与速度，控制量为力。使用零阶保持得到 A=[[1,dt],[0,1]]、B=[dt²/(2m),dt/m]ᵀ；
          每个离散决策步骤支付 xᵀQx+ru²，末端支付 xᵀQ_Tx。改变权重和噪声，观察反馈、轨迹、总代价与起始闭环谱半径。
        </p>
        <LqrDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />小结</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '有限时域 LQR 的价值函数保持二次型，控制律保持线性。',
            'Riccati 方程与反馈增益从终端权重反向递推。',
            '标准加性零均值噪声影响期望代价，但不改变最优反馈增益。',
            '约束、模型误差和非线性会限制 LQR 的直接适用范围。',
          ].map((item) => <li key={item} className="flex items-start gap-2"><Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
      </section>
    </div>
  );
}

function LqrDemo() {
  const [horizon, setHorizon] = useState(30);
  const [dt, setDt] = useState(0.2);
  const [mass, setMass] = useState(1);
  const [positionWeight, setPositionWeight] = useState(1);
  const [velocityWeight, setVelocityWeight] = useState(0.2);
  const [controlWeight, setControlWeight] = useState(0.5);
  const [initialPosition, setInitialPosition] = useState(5);
  const [initialVelocity, setInitialVelocity] = useState(0);
  const [processNoise, setProcessNoise] = useState(0);
  const [seed, setSeed] = useState(1);

  const model = useMemo(() => {
    const A: Matrix2 = [[1, dt], [0, 1]];
    const B: Vector2 = [dt * dt / (2 * mass), dt / mass];
    const Q: Matrix2 = [[positionWeight, 0], [0, velocityWeight]];
    const terminalQ: Matrix2 = [[8 * positionWeight, 0], [0, 4 * velocityWeight]];
    const solution = solveFiniteHorizonLqr(A, B, Q, controlWeight, terminalQ, horizon);
    const simulation = simulateLqr(A, B, Q, controlWeight, terminalQ, solution.gains, [initialPosition, initialVelocity], processNoise, seed);
    const radius = spectralRadius2(closedLoopMatrix(A, B, solution.gains[0]));
    return { A, B, Q, terminalQ, solution, simulation, radius };
  }, [horizon, dt, mass, positionWeight, velocityWeight, controlWeight, initialPosition, initialVelocity, processNoise, seed]);

  const stateSeries = [
    { name: '位置 p', color: '#2563eb', data: model.simulation.states.map((state, time) => ({ time, value: state[0] })) },
    { name: '速度 v', color: '#ea580c', data: model.simulation.states.map((state, time) => ({ time, value: state[1] })) },
  ];
  const controlSeries = [{ name: '控制力 u', color: '#16a34a', data: model.simulation.controls.map((value, time) => ({ time, value })) }];
  const finalState = model.simulation.states[model.simulation.states.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`决策步数 T：${horizon}`}><Slider aria-label="LQR 决策步数" value={[horizon]} min={5} max={60} step={1} onValueChange={([value]) => setHorizon(value)} /></Control>
        <Control label={`采样间隔 dt：${dt.toFixed(2)}`}><Slider aria-label="LQR 离散采样间隔" value={[dt]} min={0.05} max={0.5} step={0.05} onValueChange={([value]) => setDt(value)} /></Control>
        <Control label={`质量 m：${mass.toFixed(1)}`}><Slider aria-label="小车质量" value={[mass]} min={0.5} max={3} step={0.1} onValueChange={([value]) => setMass(value)} /></Control>
        <Control label={`位置权重 qₚ：${positionWeight.toFixed(1)}`}><Slider aria-label="位置代价权重" value={[positionWeight]} min={0.1} max={5} step={0.1} onValueChange={([value]) => setPositionWeight(value)} /></Control>
        <Control label={`速度权重 qᵥ：${velocityWeight.toFixed(1)}`}><Slider aria-label="速度代价权重" value={[velocityWeight]} min={0} max={3} step={0.1} onValueChange={([value]) => setVelocityWeight(value)} /></Control>
        <Control label={`控制权重 r：${controlWeight.toFixed(2)}`}><Slider aria-label="控制输入代价权重" value={[controlWeight]} min={0.05} max={2} step={0.05} onValueChange={([value]) => setControlWeight(value)} /></Control>
        <Control label={`初始位置：${initialPosition.toFixed(1)}`}><Slider aria-label="初始位置" value={[initialPosition]} min={-8} max={8} step={0.5} onValueChange={([value]) => setInitialPosition(value)} /></Control>
        <Control label={`初始速度：${initialVelocity.toFixed(1)}`}><Slider aria-label="初始速度" value={[initialVelocity]} min={-4} max={4} step={0.5} onValueChange={([value]) => setInitialVelocity(value)} /></Control>
        <Control label={`过程噪声标准差：${processNoise.toFixed(2)}`}><Slider aria-label="每个状态分量的过程噪声标准差" value={[processNoise]} min={0} max={0.5} step={0.05} onValueChange={([value]) => setProcessNoise(value)} /></Control>
      </div>

      <button type="button" onClick={() => setSeed((current) => current + 1)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><RefreshCw className="w-4 h-4" aria-hidden="true" />重新采样噪声</button>

      <div className="grid lg:grid-cols-2 gap-6">
        <LineChart title="状态轨迹" description="小车的位置和速度随离散时刻变化" series={stateSeries} />
        <LineChart title="控制输入 uₜ=−Kₜxₜ" description="LQR 反馈控制力随离散时刻变化" series={controlSeries} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="样本总代价" value={model.simulation.totalCost.toFixed(3)} />
        <Metric label="末端位置" value={finalState[0].toFixed(3)} />
        <Metric label="K₀" value={`[${model.solution.gains[0][0].toFixed(3)}, ${model.solution.gains[0][1].toFixed(3)}]`} />
        <Metric label="ρ(A−BK₀)" value={model.radius.toFixed(3)} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border rounded-lg">
          <caption className="sr-only">前十个时刻的 LQR 反馈增益</caption>
          <thead className="bg-gray-50 text-gray-700"><tr><th scope="col" className="px-3 py-2">时刻 t</th><th scope="col" className="px-3 py-2">位置增益</th><th scope="col" className="px-3 py-2">速度增益</th></tr></thead>
          <tbody className="divide-y">{model.solution.gains.slice(0, 10).map((gain, time) => <tr key={time}><th scope="row" className="px-3 py-2 font-mono font-normal">{time}</th><td className="px-3 py-2 font-mono">{gain[0].toFixed(4)}</td><td className="px-3 py-2 font-mono">{gain[1].toFixed(4)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

interface ChartSeries { name: string; color: string; data: { time: number; value: number }[] }

function LineChart({ title, description, series }: { title: string; description: string; series: ChartSeries[] }) {
  const chartId = useId().replace(/:/g, '');
  const width = 480;
  const height = 220;
  const padding = { top: 10, right: 10, bottom: 28, left: 44 };
  const values = series.flatMap((item) => item.data.map((point) => point.value));
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const range = Math.max(1e-6, maximum - minimum);
  const length = Math.max(...series.map((item) => item.data.length), 1);
  const x = (time: number) => padding.left + (time / Math.max(1, length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + (height - padding.top - padding.bottom) - ((value - minimum) / range) * (height - padding.top - padding.bottom);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 260 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
        <title id={`${chartId}-title`}>{title}</title><desc id={`${chartId}-desc`}>{description}</desc>
        <line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} stroke="#e5e7eb" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#d1d5db" />
        {series.map((item) => <path key={item.name} d={item.data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.time)} ${y(point.value)}`).join(' ')} fill="none" stroke={item.color} strokeWidth={2.5} />)}
        <text x={padding.left} y={height - 6} fontSize={10} fill="#6b7280">t=0</text><text x={width - padding.right - 20} y={height - 6} fontSize={10} fill="#6b7280">t=T</text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">{series.map((item) => <span key={item.name} className="flex items-center gap-1.5 text-xs text-gray-700"><span className="w-3 h-0.5 rounded" style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) { return <div><div className="text-sm font-medium text-gray-700 mb-2">{label}</div>{children}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><span className="block text-gray-600">{label}</span><span className="font-mono font-semibold text-blue-700">{value}</span></div>; }
