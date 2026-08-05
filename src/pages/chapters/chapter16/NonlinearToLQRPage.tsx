import { useMemo, useState, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function NonlinearToLQRPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十六章 · 线性二次调节与最优控制
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">从非线性动力学到 LQR</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          真实系统大多是非线性的。本节介绍如何把非线性动力学在平衡点或参考轨迹附近局部线性化，
          从而继续使用 LQR 求解——这也是 iLQR / DDP 类方法的基本思想；其中 iLQR 主要使用一阶动力学线性化和二阶代价近似，而完整 DDP 还可包含动力学的二阶项。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">动力学线性化</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设真实转移方程为 {'s_{t+1} = f(s_t, a_t)'} <KaTeX math={String.raw`s_{t+1} = f(s_t, a_t)`} />，并且系统经常运行在某一工作点
          (s_0, a_0) <KaTeX math={String.raw`(s_0, a_0)`} /> 附近。对该点做一阶泰勒展开：
        </p>
        <FormulaCard
          title="一阶泰勒展开"
          formula={
            <KaTeX
              math={String.raw`f(s,a) \approx f(s_0,a_0) + A (s-s_0) + B (a-a_0)`}
              display
            />
          }
          description="右边关于 s 与 a 都是线性的。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：s_{t+1} ≈ f(s_0,a_0) + A(s_t−s_0) + B(a_t−a_0)'}
        </p>
        <p className="text-gray-700 mt-4 mb-4">
          整理后得到带常数项的线性系统：
        </p>
        <FormulaCard
          title="仿射近似"
          formula={
            <KaTeX
              math={String.raw`s_{t+1} \approx A s_t + B a_t + c`}
              display
            />
          }
          description="常数项 c 可以通过增加一个恒为 1 的状态分量被吸收，于是回到标准 LQR 形式。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：s_{t+1} ≈ A s_t + B a_t + c'}
        </p>
        <p className="text-gray-700 mt-4">
          例如在倒立摆中，重力矩与 sin θ 成正比；在竖直位置附近用
          sin θ ≈ θ 就得到了线性化模型。
          这里令 θ=0 表示倒立竖直向上的平衡点；若采用其他角度定义，线性化符号可能不同。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">iLQR / DDP 类方法</h2>
        <p className="text-gray-700 mb-4">
          如果目标不是停留在某个固定点，而是跟踪一条完整轨迹（例如火箭飞行），可以在轨迹上的每一点分别线性化，
          把整条轨迹拆成若干局部 LQR 问题。iLQR / DDP 类方法的主要步骤如下：
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>用一个简单控制器生成一条名义轨迹 τ = (s_0,a_0,s_1,a_1,...) <KaTeX math={String.raw`\tau = (s_0,a_0,s_1,a_1,\dots)`} />。</li>
          <li>在轨迹每一点附近对动力学做一阶展开，对代价函数做二阶展开，得到局部 LQR。</li>
          <li>用 LQR 求解局部反馈增益，得到新的控制器。</li>
          <li>用新的控制器和<strong>真实</strong>非线性动力学重新生成轨迹，回到第 2 步迭代。</li>
        </ol>
        <p className="text-gray-700">
          如果轨迹偏离线性化区域太远，可以通过 line search、trust region、regularization 或重新线性化来改善。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：倒立摆线性化</h2>
        <p className="text-gray-700 mb-4">
          单摆倒立平衡点附近，非线性力矩由 sin θ<KaTeX math={String.raw`\sin\theta`} /> 描述；线性化后用 θ<KaTeX math={String.raw`\theta`} /> 近似。调整初始角度和施加力矩，比较真实非线性轨迹与线性化轨迹的差异。
        </p>
        <PendulumDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>非线性系统可在工作点或名义轨迹附近用泰勒展开线性化。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>常数偏移可通过增广状态吸收，从而套用 LQR。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>iLQR/DDP 类方法反复局部近似动力学与代价，求解局部 LQR 子问题，再用真实非线性动力学重新 rollout；其中完整 DDP 可进一步使用动力学二阶项。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function PendulumDemo() {
  const [theta0, setTheta0] = useState(0.3);
  const [u, setU] = useState(0.0);
  const [dt, setDt] = useState(0.15);
  const [T, setT] = useState(20);
  const [g, setG] = useState(9.8);
  const [len, setLen] = useState(1.0);
  const [mass, setMass] = useState(1.0);

  const { nonlinear, linear } = useMemo(() => {
    const nl: number[] = [theta0];
    const lin: number[] = [theta0];
    let thetaN = theta0;
    let thetaDotN = 0;
    let thetaL = theta0;
    let thetaDotL = 0;

    for (let t = 0; t < T; t++) {
      const accelN = (g / len) * Math.sin(thetaN) + u / (mass * len * len);
      thetaDotN += accelN * dt;
      thetaN += thetaDotN * dt;
      nl.push(thetaN);

      const accelL = (g / len) * thetaL + u / (mass * len * len);
      thetaDotL += accelL * dt;
      thetaL += thetaDotL * dt;
      lin.push(thetaL);
    }
    return { nonlinear: nl, linear: lin };
  }, [theta0, u, dt, T, g, len, mass]);

  const width = 520;
  const height = 260;
  const pad = { top: 16, right: 20, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const values = [...nonlinear, ...linear];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1e-6, max - min);

  const x = (t: number) => pad.left + (t / Math.max(1, T)) * innerW;
  const y = (v: number) => pad.top + innerH - ((v - min) / range) * innerH;

  const path = (data: number[]) =>
    data.map((v, t) => `${t === 0 ? 'M' : 'L'} ${x(t)} ${y(v)}`).join(' ');

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Control label={`初始角度 θ₀: ${theta0.toFixed(2)} rad`}>
          <Slider value={[theta0]} min={-1.0} max={1.0} step={0.05} onValueChange={(v) => setTheta0(v[0])} />
        </Control>
        <Control label={`控制力矩 u: ${u.toFixed(2)}`}>
          <Slider value={[u]} min={-5} max={5} step={0.25} onValueChange={(v) => setU(v[0])} />
        </Control>
        <Control label={`仿真步数 T: ${T}`}>
          <Slider value={[T]} min={5} max={40} step={1} onValueChange={(v) => setT(v[0])} />
        </Control>
        <Control label={`时间步长 dt: ${dt.toFixed(2)}`}>
          <Slider value={[dt]} min={0.05} max={0.3} step={0.01} onValueChange={(v) => setDt(v[0])} />
        </Control>
        <Control label={`重力 g: ${g.toFixed(1)}`}>
          <Slider value={[g]} min={1} max={15} step={0.5} onValueChange={(v) => setG(v[0])} />
        </Control>
        <Control label={`摆长 l: ${len.toFixed(1)}`}>
          <Slider value={[len]} min={0.5} max={2.0} step={0.1} onValueChange={(v) => setLen(v[0])} />
        </Control>
        <Control label={`质量 m: ${mass.toFixed(1)}`}>
          <Slider value={[mass]} min={0.5} max={3.0} step={0.1} onValueChange={(v) => setMass(v[0])} />
        </Control>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 300 }}>
          <line x1={pad.left} y1={y(0)} x2={width - pad.right} y2={y(0)} stroke="#e5e7eb" strokeWidth={1} />
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#d1d5db" strokeWidth={1} />
          <path d={path(nonlinear)} fill="none" stroke="#2563eb" strokeWidth={2.5} />
          <path d={path(linear)} fill="none" stroke="#ea580c" strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={pad.left} y={height - 6} fontSize={10} fill="#6b7280">t=0</text>
          <text x={width - pad.right - 20} y={height - 6} fontSize={10} fill="#6b7280">t=T</text>
          <text x={6} y={pad.top + 8} fontSize={10} fill="#6b7280">{max.toFixed(2)}</text>
          <text x={6} y={height - pad.bottom - 2} fontSize={10} fill="#6b7280">{min.toFixed(2)}</text>
        </svg>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700">
          <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" />非线性轨迹</span>
          <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-orange-600 border-b border-dashed" />线性化轨迹</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PendulumSVG title="非线性摆" theta={nonlinear[T]} color="#2563eb" />
        <PendulumSVG title="线性化摆" theta={linear[T]} color="#ea580c" />
      </div>
    </div>
  );
}

function PendulumSVG({ title, theta, color }: { title: string; theta: number; color: string }) {
  // 与正文约定一致：θ=0 表示倒立竖直向上的平衡点，支点在下方
  const cx = 100;
  const cy = 110;
  const L = 80;
  const x = cx + L * Math.sin(theta);
  const y = cy - L * Math.cos(theta);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
      <svg viewBox="0 0 200 140" className="w-40 h-28">
        <line x1={cx - 40} y1={cy} x2={cx + 40} y2={cy} stroke="#9ca3af" strokeWidth={3} />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth={3} />
        <circle cx={x} cy={y} r={10} fill={color} />
        <line x1={cx} y1={cy} x2={cx} y2={cy - L} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 2" />
        <text x={cx + 6} y={cy - L / 2} fontSize={10} fill="#9ca3af">θ={theta.toFixed(3)}</text>
      </svg>
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
