import { useId, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, Circle, RefreshCw, ShieldAlert } from 'lucide-react';
import FormulaCard from '@/components/FormulaCard';
import KaTeX from '@/components/KaTeX';
import { Slider } from '@/components/ui/slider';
import { simulateScalarKalmanFilter } from './controlMath';

export default function LQGPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">第十六章 · 线性二次调节与最优控制</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">线性二次高斯（LQG）</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          LQG 面向线性系统、二次期望代价与高斯噪声的部分可观测控制：
          卡尔曼滤波器估计状态，LQR 对条件均值实施反馈。
        </p>
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" aria-hidden="true" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4"><Activity className="w-6 h-6 text-blue-600" aria-hidden="true" /><h2 className="text-2xl font-bold text-gray-900">部分可观测线性高斯模型</h2></div>
        <FormulaCard
          title="状态与观测"
          formula={<KaTeX math={String.raw`x_{t+1}=Ax_t+Bu_t+w_t,\quad y_t=Cx_t+v_t,\qquad w_t\sim\mathcal N(0,W),\;v_t\sim\mathcal N(0,V)`} display />}
          description="标准设定假设初始状态和噪声联合高斯、零均值、白噪声，且过程噪声与观测噪声相互独立。"
        />
        <p className="text-gray-700 mt-4">
          条件分布 p(xₜ|y₀:ₜ,u₀:ₜ₋₁) 仍是高斯，所以均值 x̂ₜ|ₜ 与协方差 Pₜ|ₜ 是充分统计量。
          若噪声相关、模型未知、存在约束或代价非二次，需要相应修正；“线性+高斯”不是任意 POMDP 的通用解。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">卡尔曼滤波：预测与校正</h2>
        <FormulaCard
          title="预测"
          formula={<KaTeX math={String.raw`\hat x_{t\mid t-1}=A\hat x_{t-1\mid t-1}+Bu_{t-1},\qquad P_{t\mid t-1}=AP_{t-1\mid t-1}A^\top+W`} display />}
          description="动力学传播均值，过程噪声增加不确定性。"
        />
        <FormulaCard
          title="创新、增益与更新"
          formula={<KaTeX math={String.raw`S_t=CP_{t\mid t-1}C^\top+V,\quad L_t=P_{t\mid t-1}C^\top S_t^{-1},\quad \hat x_{t\mid t}=\hat x_{t\mid t-1}+L_t(y_t-C\hat x_{t\mid t-1})`} display />}
          description="这里用 Lₜ 表示卡尔曼增益，避免与 LQR 反馈增益 Kₜ 混淆。"
        />
        <FormulaCard
          title="协方差更新"
          formula={<KaTeX math={String.raw`P_{t\mid t}=(I-L_tC)P_{t\mid t-1}(I-L_tC)^\top+L_tVL_t^\top`} display />}
          description="Joseph 形式在有限精度计算中更好地保持对称半正定；代数上等价于简式。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">分离原理与成立边界</h2>
        <p className="text-gray-700 mb-4">
          在无约束标准 LQG 的期望二次代价下，最优控制器具有 certainty-equivalent 形式：
        </p>
        <FormulaCard
          title="估计后控制"
          formula={<KaTeX math={String.raw`u_t^*=-K_t\hat x_{t\mid t}`} display />}
          description="Kₜ 由完全可观测 LQR Riccati 方程得到；状态估计器由卡尔曼 Riccati 方程得到，两者可分别设计。"
        />
        <p className="text-gray-700 mt-4">
          这个结论依赖线性动力学、二次期望目标、控制无关的加性高斯噪声与无硬约束。
          双重控制、风险敏感目标、输入/状态约束、非线性或非高斯模型通常破坏简单分离结构。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：标量随机游走滤波</h2>
        <p className="text-gray-700 mb-4">
          模型为 xₜ₊₁=xₜ+wₜ、yₜ=xₜ+vₜ，其中 q、r 是方差而不是标准差。
          图中 ±1.96σ 区间代表模型条件下约 95% 的后验区间；单条轨迹覆盖率会波动，不应被解读为校准证明。
        </p>
        <KalmanDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" aria-hidden="true" />小结</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {[
            '卡尔曼滤波维护线性高斯模型的条件均值与协方差。',
            '分离原理让状态估计器与 LQR 反馈器分别设计。',
            'LQG 的闭式结构依赖严格假设；约束、风险和模型失配需要额外处理。',
          ].map((item) => <li key={item} className="flex items-start gap-2"><Circle className="w-2 h-2 fill-current text-blue-500 mt-1" aria-hidden="true" /><span>{item}</span></li>)}
        </ul>
      </section>
    </div>
  );
}

function KalmanDemo() {
  const [horizon, setHorizon] = useState(40);
  const [processVariance, setProcessVariance] = useState(0.5);
  const [observationVariance, setObservationVariance] = useState(2);
  const [initialVariance, setInitialVariance] = useState(1);
  const [seed, setSeed] = useState(1);
  const chartId = useId().replace(/:/g, '');
  const simulation = useMemo(
    () => simulateScalarKalmanFilter(horizon, processVariance, observationVariance, initialVariance, seed),
    [horizon, processVariance, observationVariance, initialVariance, seed],
  );

  const width = 560;
  const height = 280;
  const padding = { top: 16, right: 20, bottom: 28, left: 44 };
  const upper = simulation.estimates.map((estimate, index) => estimate + 1.96 * Math.sqrt(simulation.variances[index]));
  const lower = simulation.estimates.map((estimate, index) => estimate - 1.96 * Math.sqrt(simulation.variances[index]));
  const values = [...simulation.trueStates, ...simulation.observations, ...upper, ...lower];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(1e-6, maximum - minimum);
  const x = (time: number) => padding.left + (time / Math.max(1, horizon)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + (height - padding.top - padding.bottom) - ((value - minimum) / range) * (height - padding.top - padding.bottom);
  const linePath = (data: number[]) => data.map((value, time) => `${time === 0 ? 'M' : 'L'} ${x(time)} ${y(value)}`).join(' ');
  const bandPath = `${upper.map((value, time) => `${time === 0 ? 'M' : 'L'} ${x(time)} ${y(value)}`).join(' ')} ${lower.slice().reverse().map((value, reverseIndex) => `L ${x(horizon - reverseIndex)} ${y(value)}`).join(' ')} Z`;
  const finalIndex = simulation.estimates.length - 1;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`步数 T：${horizon}`}><Slider aria-label="卡尔曼滤波仿真步数" value={[horizon]} min={10} max={80} step={1} onValueChange={([value]) => setHorizon(value)} /></Control>
        <Control label={`过程噪声方差 q：${processVariance.toFixed(2)}`}><Slider aria-label="过程噪声方差 q" value={[processVariance]} min={0.05} max={3} step={0.05} onValueChange={([value]) => setProcessVariance(value)} /></Control>
        <Control label={`观测噪声方差 r：${observationVariance.toFixed(2)}`}><Slider aria-label="观测噪声方差 r" value={[observationVariance]} min={0.1} max={5} step={0.1} onValueChange={([value]) => setObservationVariance(value)} /></Control>
        <Control label={`先验方差 P₀⁻：${initialVariance.toFixed(2)}`}><Slider aria-label="初始先验方差" value={[initialVariance]} min={0.1} max={5} step={0.1} onValueChange={([value]) => setInitialVariance(value)} /></Control>
      </div>

      <button type="button" onClick={() => setSeed((current) => current + 1)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"><RefreshCw className="w-4 h-4" aria-hidden="true" />重新生成噪声</button>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 320 }} role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
          <title id={`${chartId}-title`}>标量卡尔曼滤波轨迹与后验不确定性</title><desc id={`${chartId}-desc`}>估计 RMSE 为 {simulation.rmse.toFixed(3)}，95% 后验区间样本覆盖率为 {(100 * simulation.coverage95).toFixed(1)}%。</desc>
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#d1d5db" /><line x1={padding.left} y1={y(0)} x2={width - padding.right} y2={y(0)} stroke="#e5e7eb" />
          <path d={bandPath} fill="#bfdbfe" opacity={0.55} /><path d={linePath(simulation.trueStates)} fill="none" stroke="#16a34a" strokeWidth={2.5} /><path d={linePath(simulation.estimates)} fill="none" stroke="#2563eb" strokeWidth={2.5} />
          {simulation.observations.map((value, time) => <circle key={time} cx={x(time)} cy={y(value)} r={2.4} fill="#6b7280" opacity={0.6} />)}
          <text x={padding.left} y={height - 6} fontSize={10} fill="#6b7280">t=0</text><text x={width - padding.right - 20} y={height - 6} fontSize={10} fill="#6b7280">t=T</text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700"><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-green-600" />真实状态</span><span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" />后验均值</span><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-500" />观测</span><span className="flex items-center gap-2"><span className="w-4 h-2 bg-blue-200" />95% 后验区间</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" role="status" aria-live="polite">
        <Metric label="轨迹 RMSE" value={simulation.rmse.toFixed(3)} />
        <Metric label="95% 区间覆盖率" value={`${(100 * simulation.coverage95).toFixed(1)}%`} />
        <Metric label="终点后验标准差" value={Math.sqrt(simulation.variances[finalIndex]).toFixed(3)} />
        <Metric label="终点卡尔曼增益" value={simulation.gains[finalIndex].toFixed(3)} />
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) { return <div><div className="text-sm font-medium text-gray-700 mb-2">{label}</div>{children}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-gray-50 p-3"><span className="block text-gray-600">{label}</span><span className="font-mono font-semibold text-blue-700">{value}</span></div>; }
