import { useState, useMemo } from 'react';
import { ShieldAlert, GitBranch, CheckCircle2, Play, RotateCcw , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function BackpropagationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第七章 · 深度学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">反向传播</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          反向传播是训练神经网络的核心算法。它利用链式法则高效计算损失函数对每一层参数的梯度，
          从而指导参数更新。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Chain rule */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">链式法则</h2>
        </div>
        <p className="text-gray-700 mb-4">
          神经网络的损失 <KaTeX math={String.raw`L`} /> 对某一层参数 <KaTeX math={String.raw`w`} /> 的梯度，
          可以通过链式法则分解为各层之间的局部梯度乘积：
        </p>

        <FormulaCard
          title="链式法则"
          formula={
            <KaTeX
              math={String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w}`}
              display
            />
          }
          description="其中 z = wx + b，a = f(z)，L 是最终损失。"
        />

        <p className="text-gray-700 mb-4">
          反向传播的关键在于：先做一次前向传播计算所有中间值，然后从输出层开始，
          逐层将梯度反向传递回输入层。
        </p>
      </section>

      {/* Interactive demo: computation graph */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：计算图与梯度流动</h2>
        <p className="text-gray-700 mb-4">
          下面是一个简单的计算图：<KaTeX math={String.raw`z = w x + b`} />，<KaTeX math={String.raw`a = \sigma(z)`} />，
          <KaTeX math={String.raw`L = (a - y)^2`} />。调整输入，观察前向值与反向梯度的变化；
          也可以点击“反向传播”按钮，逐步看梯度如何从损失节点流回参数节点。
        </p>
        <ComputationGraphDemo />
      </section>

      {/* Multi-layer backprop demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">多层网络：梯度如何逐层传递</h2>
        <p className="text-gray-700 mb-4">
          当网络变深时，输出层的梯度会沿着每条路径继续向后传播。下面的两层网络展示了
          <KaTeX math={String.raw`\partial L / \partial W^{[2]}`} /> 与 <KaTeX math={String.raw`\partial L / \partial W^{[1]}`} /> 的传递关系。
        </p>
        <MultiLayerBackpropDemo />
      </section>

      {/* Why efficient */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么反向传播高效？</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">复用中间结果</h3>
            <p className="text-sm text-gray-700">
              前向传播时保存的激活值和线性输出，在反向传播时直接复用，避免重复计算。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">逐层传递</h3>
            <p className="text-sm text-gray-700">
              每层的梯度只依赖于后一层的梯度和本层的局部梯度，计算复杂度与网络层数线性相关。
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-violet-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>反向传播利用链式法则计算梯度。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>先前向传播保存中间结果，再反向传递梯度。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>它是神经网络能够高效训练的关键。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 单神经元计算图：前向 + 反向传播                                          */
/* -------------------------------------------------------------------------- */
function ComputationGraphDemo() {
  const [x, setX] = useState([2.0]);
  const [w, setW] = useState([1.5]);
  const [b, setB] = useState([-1.0]);
  const [y, setY] = useState([0.8]);
  const [step, setStep] = useState(0);

  const z = w[0] * x[0] + b[0];
  const a = 1 / (1 + Math.exp(-z));
  const loss = Math.pow(a - y[0], 2);

  const dL_da = 2 * (a - y[0]);
  const da_dz = a * (1 - a);
  const dz_dw = x[0];
  const dz_db = 1;

  const dL_dz = dL_da * da_dz;
  const dL_dw = dL_dz * dz_dw;
  const dL_db = dL_dz * dz_db;

  const width = 980;
  const height = 520;

  const nodes = {
    w: { cx: 90, cy: 110, label: 'w', value: w[0], grad: step >= 4 ? dL_dw : 0 },
    b: { cx: 90, cy: 260, label: 'b', value: b[0], grad: step >= 4 ? dL_db : 0 },
    x: { cx: 90, cy: 410, label: 'x', value: x[0], grad: 0 },
    z: { cx: 360, cy: 260, label: 'z', value: z, grad: step >= 3 ? dL_dz : 0 },
    a: { cx: 620, cy: 260, label: 'a', value: a, grad: step >= 2 ? dL_da : 0 },
    y: { cx: 620, cy: 410, label: 'y', value: y[0], grad: 0 },
    L: { cx: 860, cy: 260, label: 'L', value: loss, grad: step >= 1 ? 1 : 0 },
  };

  type NodeKey = keyof typeof nodes;

  const edges = useMemo(
    () => [
      { from: 'w' as NodeKey, to: 'z' as NodeKey, label: String.raw`\frac{\partial z}{\partial w} = ${x[0].toFixed(6)}`, showGrad: step >= 4, labelPos: 'above' as const },
      { from: 'b' as NodeKey, to: 'z' as NodeKey, label: String.raw`\frac{\partial z}{\partial b} = 1.000000`, showGrad: step >= 4, labelPos: 'below' as const },
      { from: 'x' as NodeKey, to: 'z' as NodeKey, label: String.raw`\frac{\partial z}{\partial x} = ${w[0].toFixed(6)}`, showGrad: step >= 3, labelPos: 'below' as const },
      { from: 'z' as NodeKey, to: 'a' as NodeKey, label: String.raw`\frac{\partial a}{\partial z} = ${da_dz.toFixed(6)}`, showGrad: step >= 2, labelPos: 'above' as const },
      { from: 'a' as NodeKey, to: 'L' as NodeKey, label: String.raw`\frac{\partial L}{\partial a} = ${dL_da.toFixed(6)}`, showGrad: step >= 1, labelPos: 'above' as const },
      { from: 'y' as NodeKey, to: 'L' as NodeKey, label: String.raw`\frac{\partial L}{\partial y} = ${(-dL_da).toFixed(6)}`, showGrad: step >= 1, labelPos: 'below' as const },
    ],
    [step, w, x, da_dz, dL_da]
  );

  function arrowPath(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;
    const startR = 34;
    const endR = 34;
    const sx = x1 + ux * startR;
    const sy = y1 + uy * startR;
    const ex = x2 - ux * endR;
    const ey = y2 - uy * endR;
    return { sx, sy, ex, ey, ux, uy };
  }

  function labelCenter(from: NodeKey, to: NodeKey, pos: 'above' | 'below') {
    const n1 = nodes[from];
    const n2 = nodes[to];
    const { sx, sy, ex, ey, ux, uy } = arrowPath(n1.cx, n1.cy, n2.cx, n2.cy);
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const dir = pos === 'above' ? -1 : 1;
    const off = 38;
    return { x: mx - uy * off * dir, y: my + ux * off * dir };
  }

  const nodeKeys = Object.keys(nodes) as Array<NodeKey>;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      {/* controls */}
      <div className="grid md:grid-cols-4 gap-4 text-sm">
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>输入 x</span>
            <span className="text-blue-600">{x[0].toFixed(6)}</span>
          </label>
          <Slider min={-3} max={3} step={0.1} value={x} onValueChange={setX} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>权重 w</span>
            <span className="text-blue-600">{w[0].toFixed(6)}</span>
          </label>
          <Slider min={-3} max={3} step={0.1} value={w} onValueChange={setW} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>偏置 b</span>
            <span className="text-blue-600">{b[0].toFixed(6)}</span>
          </label>
          <Slider min={-3} max={3} step={0.1} value={b} onValueChange={setB} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>标签 y</span>
            <span className="text-blue-600">{y[0].toFixed(6)}</span>
          </label>
          <Slider min={0} max={1} step={0.05} value={y} onValueChange={setY} />
        </div>
      </div>

      {/* step buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { s: 0, label: '1. 前向传播', activeColor: 'bg-blue-600 border-blue-600' },
          { s: 1, label: '2. ∂L/∂a', activeColor: 'bg-violet-600 border-violet-600' },
          { s: 2, label: '3. ∂L/∂z', activeColor: 'bg-violet-600 border-violet-600' },
          { s: 4, label: '4. 完整反向传播', activeColor: 'bg-emerald-600 border-emerald-600' },
        ].map((btn) => (
          <button
            key={btn.s}
            onClick={() => setStep(btn.s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${
              step >= btn.s ? `${btn.activeColor} text-white` : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {btn.s === 4 && <Play className="w-4 h-4" />}
            {btn.label}
          </button>
        ))}
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" /> 重置
        </button>
      </div>

      {/* graph */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 520 }}>
        {/* forward edges (no labels) */}
        {edges.map((e, idx) => {
          const from = nodes[e.from];
          const to = nodes[e.to];
          const { sx, sy, ex, ey } = arrowPath(from.cx, from.cy, to.cx, to.cy);
          return (
            <line
              key={`line-${idx}`}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke="#d1d5db"
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* gradient labels */}
        {edges.map((e, idx) => {
          if (!e.showGrad) return null;
          const { x, y } = labelCenter(e.from, e.to, e.labelPos);
          return (
            <g key={`label-${idx}`}>
              <rect x={x - 70} y={y - 16} width={140} height={32} rx={8} fill="#ffffff" stroke="#7c3aed" strokeWidth={1.5} />
              <foreignObject x={x - 66} y={y - 14} width={132} height={28}>
                <div className="text-[11px] text-violet-800 text-center leading-[28px] whitespace-nowrap overflow-hidden">
                  <KaTeX math={e.label} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* active gradient strokes on top */}
        {edges.map((e, idx) => {
          if (!e.showGrad) return null;
          const from = nodes[e.from];
          const to = nodes[e.to];
          const { sx, sy, ex, ey } = arrowPath(from.cx, from.cy, to.cx, to.cy);
          return (
            <line
              key={`active-${idx}`}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke="#7c3aed"
              strokeWidth={3}
              strokeDasharray="6 4"
              markerEnd="url(#arrowhead-active)"
            />
          );
        })}

        {/* nodes */}
        {nodeKeys.map((key) => {
          const n = nodes[key];
          const hasGrad = Math.abs(n.grad) > 1e-9;
          return (
            <g key={key}>
              <circle cx={n.cx} cy={n.cy} r={32} fill={hasGrad ? '#f3e8ff' : '#eff6ff'} stroke={hasGrad ? '#7c3aed' : '#2563eb'} strokeWidth={2} />
              <text x={n.cx} y={n.cy - 5} textAnchor="middle" fontSize={16} fontWeight={600} fill={hasGrad ? '#5b21b6' : '#1e40af'}>
                {n.label}
              </text>
              <text x={n.cx} y={n.cy + 12} textAnchor="middle" fontSize={12} fill="#374151">
                {n.value.toFixed(6)}
              </text>
              {hasGrad && (
                <g>
                  <rect x={n.cx - 58} y={n.cy + 40} width={116} height={26} rx={6} fill="#ffffff" stroke="#7c3aed" strokeWidth={1.5} />
                  <foreignObject x={n.cx - 54} y={n.cy + 41} width={108} height={24}>
                    <div className="text-[11px] text-violet-800 text-center leading-[24px] whitespace-nowrap overflow-hidden">
                      <KaTeX math={String.raw`\frac{\partial L}{\partial ${n.label}}=${n.grad.toFixed(6)}`} />
                    </div>
                  </foreignObject>
                </g>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
          </marker>
        </defs>
      </svg>

      {/* formula cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
          <p className="font-medium text-gray-700 mb-2">前向计算</p>
          <div className="space-y-1 text-gray-600 font-mono text-xs">
            <p>z = {w[0].toFixed(6)} × {x[0].toFixed(6)} + ({b[0].toFixed(6)}) = {z.toFixed(6)}</p>
            <p>a = σ({z.toFixed(6)}) = {a.toFixed(6)}</p>
            <p>L = ({a.toFixed(6)} − {y[0].toFixed(6)})² = {loss.toFixed(6)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
          <p className="font-medium text-gray-700 mb-2">反向梯度</p>
          <div className="space-y-1 text-gray-600 font-mono text-xs">
            <p>∂L/∂a = {dL_da.toFixed(6)}</p>
            <p>∂L/∂z = {dL_da.toFixed(6)} × {da_dz.toFixed(6)} = {dL_dz.toFixed(6)}</p>
            <p>∂L/∂w = {dL_dz.toFixed(6)} × {dz_dw.toFixed(6)} = {dL_dw.toFixed(6)}</p>
            <p>∂L/∂b = {dL_dz.toFixed(6)} × 1 = {dL_db.toFixed(6)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 两层网络反向传播演示                                                      */
/* -------------------------------------------------------------------------- */
function MultiLayerBackpropDemo() {
  const [x, setX] = useState([1.0]);
  const [w1, setW1] = useState([1.2]);
  const [b1, setB1] = useState([-0.5]);
  const [w2, setW2] = useState([1.5]);
  const [b2, setB2] = useState([0.0]);
  const [y, setY] = useState([1.0]);
  const [step, setStep] = useState(0);

  const z1 = w1[0] * x[0] + b1[0];
  const a1 = Math.max(0, z1);
  const z2 = w2[0] * a1 + b2[0];
  const a2 = 1 / (1 + Math.exp(-z2));
  const loss = Math.pow(a2 - y[0], 2);

  const dL_da2 = 2 * (a2 - y[0]);
  const da2_dz2 = a2 * (1 - a2);
  const dL_dz2 = dL_da2 * da2_dz2;
  const dL_dw2 = dL_dz2 * a1;
  const dL_db2 = dL_dz2;

  const dL_da1 = dL_dz2 * w2[0];
  const reluPrime = z1 > 0 ? 1 : 0;
  const dL_dz1 = dL_da1 * reluPrime;
  const dL_dw1 = dL_dz1 * x[0];
  const dL_db1 = dL_dz1;

  const width = 1080;
  const height = 520;

  const nodes = {
    x: { cx: 90, cy: 390, label: 'x', value: x[0], grad: 0 },
    w1: { cx: 90, cy: 90, label: 'W⁽¹⁾', value: w1[0], grad: step >= 5 ? dL_dw1 : 0 },
    b1: { cx: 90, cy: 240, label: 'b⁽¹⁾', value: b1[0], grad: step >= 5 ? dL_db1 : 0 },
    z1: { cx: 300, cy: 240, label: 'z₁', value: z1, grad: step >= 4 ? dL_dz1 : 0 },
    a1: { cx: 500, cy: 240, label: 'a₁', value: a1, grad: step >= 3 ? dL_da1 : 0 },
    w2: { cx: 500, cy: 90, label: 'W⁽²⁾', value: w2[0], grad: step >= 5 ? dL_dw2 : 0 },
    b2: { cx: 500, cy: 390, label: 'b⁽²⁾', value: b2[0], grad: step >= 5 ? dL_db2 : 0 },
    z2: { cx: 710, cy: 240, label: 'z₂', value: z2, grad: step >= 2 ? dL_dz2 : 0 },
    a2: { cx: 910, cy: 240, label: 'a₂', value: a2, grad: step >= 1 ? dL_da2 : 0 },
    y: { cx: 910, cy: 390, label: 'y', value: y[0], grad: 0 },
    L: { cx: 910, cy: 90, label: 'L', value: loss, grad: step >= 0 ? 1 : 0 },
  };

  type NodeKey = keyof typeof nodes;

  const forwardEdges = useMemo(
    () => [
      { from: 'x' as NodeKey, to: 'z1' as NodeKey },
      { from: 'w1' as NodeKey, to: 'z1' as NodeKey },
      { from: 'b1' as NodeKey, to: 'z1' as NodeKey },
      { from: 'z1' as NodeKey, to: 'a1' as NodeKey },
      { from: 'a1' as NodeKey, to: 'z2' as NodeKey },
      { from: 'w2' as NodeKey, to: 'z2' as NodeKey },
      { from: 'b2' as NodeKey, to: 'z2' as NodeKey },
      { from: 'z2' as NodeKey, to: 'a2' as NodeKey },
      { from: 'a2' as NodeKey, to: 'L' as NodeKey },
      { from: 'y' as NodeKey, to: 'L' as NodeKey },
    ],
    []
  );

  const gradientEdges = useMemo(
    () => [
      { from: 'L' as NodeKey, to: 'a2' as NodeKey, label: String.raw`\frac{\partial L}{\partial a_2} = ${dL_da2.toFixed(6)}`, show: step >= 1, labelPos: 'left' as const },
      { from: 'a2' as NodeKey, to: 'z2' as NodeKey, label: String.raw`\frac{\partial a_2}{\partial z_2} = ${da2_dz2.toFixed(6)}`, show: step >= 2, labelPos: 'below' as const },
      { from: 'z2' as NodeKey, to: 'a1' as NodeKey, label: String.raw`\frac{\partial z_2}{\partial a_1} = ${w2[0].toFixed(6)}`, show: step >= 3, labelPos: 'below' as const },
      { from: 'a1' as NodeKey, to: 'z1' as NodeKey, label: String.raw`\frac{\partial a_1}{\partial z_1} = ${reluPrime.toFixed(6)}`, show: step >= 4, labelPos: 'below' as const },
      { from: 'z1' as NodeKey, to: 'w1' as NodeKey, label: String.raw`\frac{\partial z_1}{\partial W^{[1]}} = ${x[0].toFixed(6)}`, show: step >= 5, labelPos: 'left' as const },
      { from: 'z1' as NodeKey, to: 'b1' as NodeKey, label: String.raw`\frac{\partial z_1}{\partial b^{[1]}} = 1.000000`, show: step >= 5, labelPos: 'left' as const },
    ],
    [step, dL_da2, da2_dz2, w2, reluPrime, x]
  );

  function arrowPath(x1: number, y1: number, x2: number, y2: number, offset = 34) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;
    return {
      sx: x1 + ux * offset,
      sy: y1 + uy * offset,
      ex: x2 - ux * offset,
      ey: y2 - uy * offset,
      ux,
      uy,
    };
  }

  function labelCenter(from: NodeKey, to: NodeKey, pos: 'left' | 'right' | 'above' | 'below') {
    const n1 = nodes[from];
    const n2 = nodes[to];
    const { sx, sy, ex, ey, ux, uy } = arrowPath(n1.cx, n1.cy, n2.cx, n2.cy);
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    let dir = 1;
    if (pos === 'above') dir = -1;
    else if (pos === 'below') dir = 1;
    else if (pos === 'left') dir = -1;
    else if (pos === 'right') dir = 1;
    const off = pos === 'left' || pos === 'right' ? 42 : 36;
    if (pos === 'left' || pos === 'right') {
      return { x: mx + uy * off * dir, y: my - ux * off * dir };
    }
    return { x: mx - uy * off * dir, y: my + ux * off * dir };
  }

  const nodeKeys = Object.keys(nodes) as Array<NodeKey>;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>输入 x</span>
            <span className="text-blue-600">{x[0].toFixed(6)}</span>
          </label>
          <Slider min={-2} max={2} step={0.1} value={x} onValueChange={setX} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>第一层权重 W⁽¹⁾</span>
            <span className="text-blue-600">{w1[0].toFixed(6)}</span>
          </label>
          <Slider min={-2} max={2} step={0.1} value={w1} onValueChange={setW1} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>第一层偏置 b⁽¹⁾</span>
            <span className="text-blue-600">{b1[0].toFixed(6)}</span>
          </label>
          <Slider min={-2} max={2} step={0.1} value={b1} onValueChange={setB1} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>第二层权重 W⁽²⁾</span>
            <span className="text-blue-600">{w2[0].toFixed(6)}</span>
          </label>
          <Slider min={-2} max={2} step={0.1} value={w2} onValueChange={setW2} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>第二层偏置 b⁽²⁾</span>
            <span className="text-blue-600">{b2[0].toFixed(6)}</span>
          </label>
          <Slider min={-2} max={2} step={0.1} value={b2} onValueChange={setB2} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>标签 y</span>
            <span className="text-blue-600">{y[0].toFixed(6)}</span>
          </label>
          <Slider min={0} max={1} step={0.05} value={y} onValueChange={setY} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              step === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === 0 && '前向'}
            {s === 1 && '∂L/∂a₂'}
            {s === 2 && '∂L/∂z₂'}
            {s === 3 && '∂L/∂a₁'}
            {s === 4 && '∂L/∂z₁'}
            {s === 5 && '∂L/∂W⁽¹⁾, ∂L/∂b⁽¹⁾'}
          </button>
        ))}
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" /> 重置
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 520 }}>
        {/* forward edges (no labels) */}
        {forwardEdges.map((e, idx) => {
          const from = nodes[e.from];
          const to = nodes[e.to];
          const { sx, sy, ex, ey } = arrowPath(from.cx, from.cy, to.cx, to.cy);
          return (
            <line
              key={`f-${idx}`}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke="#d1d5db"
              strokeWidth={2}
              markerEnd="url(#arrowhead-bp)"
            />
          );
        })}

        {/* gradient labels */}
        {gradientEdges.map((e, idx) => {
          if (!e.show) return null;
          const { x, y } = labelCenter(e.from, e.to, e.labelPos);
          return (
            <g key={`g-label-${idx}`}>
              <rect x={x - 70} y={y - 16} width={140} height={32} rx={8} fill="#ffffff" stroke="#7c3aed" strokeWidth={1.5} />
              <foreignObject x={x - 66} y={y - 14} width={132} height={28}>
                <div className="text-[11px] text-violet-800 text-center leading-[28px] whitespace-nowrap overflow-hidden">
                  <KaTeX math={e.label} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* active gradient strokes on top */}
        {gradientEdges.map((e, idx) => {
          if (!e.show) return null;
          const from = nodes[e.from];
          const to = nodes[e.to];
          const { sx, sy, ex, ey } = arrowPath(from.cx, from.cy, to.cx, to.cy);
          return (
            <line
              key={`g-line-${idx}`}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke="#7c3aed"
              strokeWidth={3}
              strokeDasharray="6 4"
              markerEnd="url(#arrowhead-bp-active)"
            />
          );
        })}

        {/* nodes */}
        {nodeKeys.map((key) => {
          const n = nodes[key];
          const hasGrad = Math.abs(n.grad) > 1e-9;
          return (
            <g key={key}>
              <circle cx={n.cx} cy={n.cy} r={30} fill={hasGrad ? '#f3e8ff' : '#ffffff'} stroke={hasGrad ? '#7c3aed' : '#2563eb'} strokeWidth={2} />
              <text x={n.cx} y={n.cy - 5} textAnchor="middle" fontSize={15} fontWeight={600} fill={hasGrad ? '#5b21b6' : '#1e40af'}>
                {n.label}
              </text>
              <text x={n.cx} y={n.cy + 12} textAnchor="middle" fontSize={12} fill="#374151">
                {n.value.toFixed(6)}
              </text>
              {hasGrad && (
                <g>
                  <rect x={n.cx - 54} y={n.cy + 40} width={108} height={26} rx={6} fill="#ffffff" stroke="#7c3aed" strokeWidth={1.5} />
                  <foreignObject x={n.cx - 50} y={n.cy + 41} width={100} height={24}>
                    <div className="text-[11px] text-violet-800 text-center leading-[24px] whitespace-nowrap overflow-hidden">
                      <KaTeX math={String.raw`\frac{\partial L}{\partial ${n.label}}=${n.grad.toFixed(6)}`} />
                    </div>
                  </foreignObject>
                </g>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arrowhead-bp" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
          <marker id="arrowhead-bp-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
          </marker>
        </defs>
      </svg>

      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
        <p className="font-medium text-gray-700 mb-2">当前步骤说明</p>
        {step === 0 && <p className="text-gray-600">前向传播：计算每一层的 z 与 a，直到损失 L。</p>}
        {step === 1 && <p className="text-gray-600">从输出开始：先求损失对输出的梯度 ∂L/∂a₂。</p>}
        {step === 2 && <p className="text-gray-600">穿过 Sigmoid：∂L/∂z₂ = ∂L/∂a₂ · ∂a₂/∂z₂，同时可得到 ∂L/∂W⁽²⁾ 与 ∂L/∂b⁽²⁾。</p>}
        {step === 3 && <p className="text-gray-600">传向隐藏层：∂L/∂a₁ = ∂L/∂z₂ · ∂z₂/∂a₁。</p>}
        {step === 4 && <p className="text-gray-600">穿过 ReLU：∂L/∂z₁ = ∂L/∂a₁ · ∂a₁/∂z₁（ReLU 在负数处导数为 0，该神经元的梯度被置零）。</p>}
        {step === 5 && <p className="text-gray-600">到达第一层参数：∂L/∂W⁽¹⁾ = ∂L/∂z₁ · ∂z₁/∂W⁽¹⁾，∂L/∂b⁽¹⁾ = ∂L/∂z₁ · 1。</p>}
      </div>
    </div>
  );
}
