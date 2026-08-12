import { useId, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import { simulatePendulumLinearization } from './controlMath';

export default function NonlinearToLQRPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">第十六章 · 线性二次调节与最优控制</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">从非线性动力学到局部 LQR</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          线性化描述工作点或名义轨迹附近的偏差动力学。它让 LQR 成为实用的局部反馈工具，
          但近似误差会随偏离程度累积，必须通过重新线性化和信赖域控制。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" aria-hidden="true" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4"><Activity className="w-6 h-6 text-blue-600" aria-hidden="true" /><h2 className="text-2xl font-bold text-gray-900">围绕名义点的偏差动力学</h2></div>
        <p className="text-gray-700 mb-4">
          对离散非线性系统 xₜ₊₁=fₜ(xₜ,uₜ)，在满足 x̄ₜ₊₁=fₜ(x̄ₜ,ūₜ) 的名义轨迹附近定义 δx=x−x̄、δu=u−ū：
        </p>
        <FormulaCard
          title="一阶动力学线性化"
          formula={<KaTeX math={String.raw`\delta x_{t+1}\approx A_t\delta x_t+B_t\delta u_t,\qquad A_t=\left.\frac{\partial f_t}{\partial x}\right|_{(\bar x_t,\bar u_t)},\quad B_t=\left.\frac{\partial f_t}{\partial u}\right|_{(\bar x_t,\bar u_t)}`} display />}
          description="使用偏差坐标并让名义轨迹满足动力学后，常数项自动抵消；任意工作点才需要保留仿射缺陷项。"
        />
        <p className="text-gray-700 mt-4">
          对代价做二阶展开可得到局部线性—二次子问题。平衡点调节是名义轨迹恒定的特例；
          跟踪问题则需要时变 Aₜ、Bₜ、权重和前馈项。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">iLQR 与 DDP 的迭代结构</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>给定控制序列，在真实非线性动力学中 rollout 得到名义轨迹。</li>
          <li>沿轨迹线性化动力学、二次近似代价，并在 backward pass 中求局部反馈与前馈方向。</li>
          <li>在 forward pass 中用 line search 更新控制，并重新通过真实动力学生成轨迹。</li>
          <li>通过正则化或 trust region 保持局部二次模型有效，直到代价改善足够小。</li>
        </ol>
        <p className="text-gray-700 mt-4">
          常见 iLQR 忽略动力学二阶导数；完整 DDP 在价值二阶项中纳入这些导数。两者通常只保证局部改进，
          对初始化敏感，也不自动处理硬约束或模型失配。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：倒立摆局部模型误差</h2>
        <p className="text-gray-700 mb-4">
          令 θ=0 表示倒立竖直位置，开环动力学含 +(g/l)sinθ，线性化用 +(g/l)θ。
          两条轨迹从相同状态、在相同恒定力矩下出发；高精度小步长积分避免把数值离散误差误认为线性化误差。
          调整初始角度与持续时间，观察 RMSE 如何随离开局部区域而增长。
        </p>
        <PendulumDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />小结</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '沿可行名义轨迹使用偏差坐标，得到时变线性局部模型。',
            'iLQR/DDP 交替 backward pass 与真实非线性 forward rollout。',
            '线性化是局部近似；误差、约束和初始化决定算法能否可靠工作。',
          ].map((item) => <li key={item} className="flex items-start gap-2"><Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
      </section>
    </div>
  );
}

function PendulumDemo() {
  const [initialAngle, setInitialAngle] = useState(0.15);
  const [torque, setTorque] = useState(0);
  const [duration, setDuration] = useState(1.5);
  const [gravity, setGravity] = useState(9.8);
  const [length, setLength] = useState(1);
  const [mass, setMass] = useState(1);
  const [damping, setDamping] = useState(0.25);
  const chartId = useId().replace(/:/g, '');

  const comparison = useMemo(
    () => simulatePendulumLinearization(initialAngle, torque, duration, gravity, length, mass, damping),
    [initialAngle, torque, duration, gravity, length, mass, damping],
  );
  const width = 520;
  const height = 260;
  const padding = { top: 16, right: 20, bottom: 28, left: 48 };
  const rawValues = [...comparison.nonlinear, ...comparison.linear];
  const displayLimit = 12;
  const values = rawValues.map((value) => Math.max(-displayLimit, Math.min(displayLimit, value)));
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const range = Math.max(1e-6, maximum - minimum);
  const x = (time: number) => padding.left + (time / Math.max(duration, 1e-6)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + (height - padding.top - padding.bottom) - ((Math.max(-displayLimit, Math.min(displayLimit, value)) - minimum) / range) * (height - padding.top - padding.bottom);
  const path = (data: number[]) => data.map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(comparison.times[index])} ${y(value)}`).join(' ');
  const clipped = rawValues.some((value) => Math.abs(value) > displayLimit);
  const finalNonlinear = comparison.nonlinear[comparison.nonlinear.length - 1];
  const finalLinear = comparison.linear[comparison.linear.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`初始角度 θ₀：${initialAngle.toFixed(2)} rad`}><Slider aria-label="倒立摆初始角度" value={[initialAngle]} min={-0.8} max={0.8} step={0.05} onValueChange={([value]) => setInitialAngle(value)} /></Control>
        <Control label={`恒定力矩 u：${torque.toFixed(2)}`}><Slider aria-label="倒立摆恒定控制力矩" value={[torque]} min={-3} max={3} step={0.25} onValueChange={([value]) => setTorque(value)} /></Control>
        <Control label={`仿真时长：${duration.toFixed(1)} s`}><Slider aria-label="倒立摆仿真时长" value={[duration]} min={0.2} max={3} step={0.1} onValueChange={([value]) => setDuration(value)} /></Control>
        <Control label={`重力 g：${gravity.toFixed(1)}`}><Slider aria-label="重力加速度" value={[gravity]} min={1} max={15} step={0.5} onValueChange={([value]) => setGravity(value)} /></Control>
        <Control label={`摆长 l：${length.toFixed(1)}`}><Slider aria-label="摆长" value={[length]} min={0.5} max={2} step={0.1} onValueChange={([value]) => setLength(value)} /></Control>
        <Control label={`质量 m：${mass.toFixed(1)}`}><Slider aria-label="摆锤质量" value={[mass]} min={0.5} max={3} step={0.1} onValueChange={([value]) => setMass(value)} /></Control>
        <Control label={`粘性阻尼 b：${damping.toFixed(2)}`}><Slider aria-label="倒立摆粘性阻尼" value={[damping]} min={0} max={1} step={0.05} onValueChange={([value]) => setDamping(value)} /></Control>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 300 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
          <title id={`${chartId}-title`}>非线性倒立摆与线性化模型的角度轨迹</title><desc id={`${chartId}-desc`}>两条轨迹的角度 RMSE 为 {comparison.rmse.toFixed(4)} 弧度。</desc>
          <line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} stroke="#e5e7eb" /><line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#d1d5db" />
          <path d={path(comparison.nonlinear)} fill="none" stroke="#2563eb" strokeWidth={2.5} /><path d={path(comparison.linear)} fill="none" stroke="#ea580c" strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={padding.left} y={height - 6} fontSize={10} fill="#6b7280">0 s</text><text x={width - padding.right - 30} y={height - 6} fontSize={10} fill="#6b7280">{duration.toFixed(1)} s</text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" />非线性</span><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-orange-600 border-b border-dashed" />一阶线性化</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="轨迹 RMSE" value={`${comparison.rmse.toFixed(4)} rad`} />
        <Metric label="终点绝对误差" value={`${comparison.finalError.toFixed(4)} rad`} />
        <Metric label="非线性终点" value={`${finalNonlinear.toFixed(3)} rad`} />
        <Metric label="线性终点" value={`${finalLinear.toFixed(3)} rad`} />
      </div>
      {clipped && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">轨迹已离开局部区域，图中角度裁剪在 ±{displayLimit} rad；指标仍使用未裁剪值。此时线性模型不应作为可靠预测器。</p>}
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) { return <div><div className="text-sm font-medium text-gray-700 mb-2">{label}</div>{children}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><span className="block text-gray-600">{label}</span><span className="font-mono font-semibold text-blue-700">{value}</span></div>; }
