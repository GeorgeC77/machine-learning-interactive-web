import { useState, useMemo } from 'react';
import { ShieldAlert, Network, CheckCircle2, ArrowRight, Lightbulb, Sigma , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ACTIVATIONS = [
  { name: 'Sigmoid', fn: (z: number) => 1 / (1 + Math.exp(-z)) },
  { name: 'ReLU', fn: (z: number) => Math.max(0, z) },
  { name: 'Tanh', fn: (z: number) => Math.tanh(z) },
];

export default function NeuralNetworksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第七章 · 深度学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">神经网络</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          神经网络由大量相互连接的神经元组成。通过堆叠多层非线性变换，
          神经网络可以学习从简单特征到复杂概念的层次化表示。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* 1. Single neuron with ReLU */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">从单个神经元开始：ReLU 与“拐点”</h2>
        </div>
        <p className="text-gray-700 mb-4">
          我们用房价预测引入神经网络：房价不应为负，因此在某个价格之下输出被“截断”为 0。
          这就是单个神经元：
        </p>

        <FormulaCard
          title="单神经元输出"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = \max(wx + b, 0) \;\;\text{（ReLU）}`}
              display
            />
          }
          description="ReLU(rectified linear unit) 是最简单的非线性激活函数之一，负责产生曲线中的“拐点”。"
        />

        <p className="text-gray-700 mt-4 text-sm">
          对于 ReLU 网络，多个 ReLU 单元组合后通常形成分段线性的非线性函数或决策边界。
        </p>

        <div className="mt-6">
          <SingleNeuronDemo />
        </div>
      </section>

      {/* 2. Activation function comparison */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：激活函数对比</h2>
        <p className="text-gray-700 mb-4">
          不同的激活函数有不同的饱和特性和梯度行为。点击切换，观察它们的形状差异。
        </p>
        <ActivationFunctionDemo />
      </section>

      {/* 3. Stacking neurons: house network */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">堆叠神经元：从手工特征到网络图</h2>
        </div>
        <p className="text-gray-700 mb-4">
          把多个神经元“堆叠”起来，就形成网络。下例是一个房价预测网络：输入是房屋面积、卧室数、邮编、社区富裕程度；
          隐藏层分别推断“家庭规模”“步行便利性”“学区质量”，最后预测房价。
        </p>

        <FormulaCard
          title="带手工结构的网络"
          formula={
            <KaTeX
              math={String.raw`
                \begin{aligned}
                a_1 &= \mathrm{ReLU}(\theta_1 x_1 + \theta_2 x_2 + \theta_3) \\
                a_2 &= \mathrm{ReLU}(\theta_4 x_3 + \theta_5) \\
                a_3 &= \mathrm{ReLU}(\theta_6 x_3 + \theta_7 x_4 + \theta_8) \\
                h_\theta(x) &= \theta_9 a_1 + \theta_{10} a_2 + \theta_{11} a_3 + \theta_{12}
                \end{aligned}
              `}
              display
            />
          }
          description="这种结构需要我们先验地知道哪些输入该组合成哪些中间特征；全连接网络则让数据自己学习这些连接。"
        />

        <div className="mt-6">
          <HouseNetworkDemo />
        </div>
      </section>

      {/* 4. Why non-linearity matters */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sigma className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么必须非线性？线性坍塌实验</h2>
        </div>
        <p className="text-gray-700 mb-4">
          若把激活函数换成恒等映射，两层网络会退化为一个等价的线性模型：
          <KaTeX math={String.raw`h(x) = W^{[2]}(W^{[1]}x+b^{[1]})+b^{[2]}=\widetilde{W}x+\widetilde{b}`} display={false} />。
          下面的交互实验让你直观感受“去掉 ReLU”后表达能力的坍塌。
        </p>

        <div className="mt-6">
          <LinearCollapseDemo />
        </div>
      </section>

      {/* 5. Connection to kernel method */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ArrowRight className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">与核方法的联系：自动学习特征映射</h2>
        </div>
        <p className="text-gray-700 mb-4">
          传统方法需要我们手工设计特征映射 <KaTeX math={String.raw`\phi(x)`} display={false} />；
          神经网络则把最后一层之前的输出 <KaTeX math={String.raw`a^{[r-1]}`} display={false} /> 当作“自动学习到的特征”，
          再在上面做线性分类。切换数据分布或调整隐藏神经元方向，观察隐藏特征如何让线性输出层解决原空间中的非线性问题。
        </p>

        <FormulaCard
          title="神经网络 = 学习特征 + 线性模型"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = W^{[r]} \underbrace{\phi(x; \theta_{\text{rest}})}_{a^{[r-1]}} + b^{[r]}`}
              display
            />
          }
          description="固定前面层的参数，神经网络就是特征空间中的线性模型；训练时我们同时学习特征映射本身。"
        />

        <div className="mt-6">
          <LearnedFeaturesDemo />
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>单个神经元通过激活函数产生非线性，例如 ReLU 会在房价曲线中制造“拐点”。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>把神经元堆叠成层，网络可以组合简单特征得到复杂函数；全连接让数据自己学习连接方式。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>去掉非线性激活，多层网络会坍塌为单层线性模型，失去表达能力。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>深度学习可视为自动学习特征映射，最终层是在学习到的特征上做线性预测。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 单神经元 ReLU 房价拐点演示                                                 */
/* -------------------------------------------------------------------------- */
function SingleNeuronDemo() {
  const [w, setW] = useState([0.25]);
  const [b, setB] = useState([-100]);

  const width = 520;
  const height = 300;
  const padding = 44;
  const xMin = 0;
  const xMax = 5000;
  const yMin = 0;
  const maxOutput = Math.max(0, w[0] * xMin + b[0], w[0] * xMax + b[0]);
  const yMax = Math.max(200, Math.ceil(maxOutput / 200) * 200);

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let x = xMin; x <= xMax; x += 50) {
      const z = w[0] * x + b[0];
      const y = Math.max(0, z);
      pts.push({ x, y });
    }
    return pts;
  }, [w, b]);

  const kinkX = Math.max(xMin, Math.min(xMax, -b[0] / (w[0] || 1e-6)));
  const kinkY = 0;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 flex justify-between mb-2">
              <span>权重 w</span>
              <span className="text-blue-600">{w[0].toFixed(3)}</span>
            </label>
            <Slider aria-label="单神经元权重 w" min={0.05} max={0.5} step={0.01} value={w} onValueChange={setW} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex justify-between mb-2">
              <span>偏置 b</span>
              <span className="text-blue-600">{b[0].toFixed(0)}</span>
            </label>
            <Slider aria-label="单神经元偏置 b" min={-500} max={0} step={10} value={b} onValueChange={setB} />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              拐点位置：x = <strong>{kinkX.toFixed(0)}</strong> sq.ft
            </p>
            <p className="text-xs text-gray-500">
              当 wx + b &lt; 0 时 ReLU 输出 0；超过拐点后输出随面积线性增长。
            </p>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 300 }} role="img" aria-label="单个 ReLU 神经元的分段线性输出">
          <title>单个 ReLU 神经元输出</title>
          {/* grid */}
          {[0, 1000, 2000, 3000, 4000, 5000].map((x) => (
            <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (i * yMax) / 5).map((y) => (
            <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
          ))}
          {/* axes */}
          <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
          <line x1={xScale(0)} y1={yScale(yMin)} x2={xScale(0)} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />
          {/* curve */}
          <path d={path} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
          {/* kink marker */}
          <circle cx={xScale(kinkX)} cy={yScale(kinkY)} r={5} fill="#dc2626" />
          <text x={xScale(kinkX) + 10} y={yScale(kinkY) + 20} fill="#dc2626" fontSize={12}>
            拐点
          </text>
          {/* labels */}
          <text x={width / 2} y={height - 8} textAnchor="middle" fill="#6b7280" fontSize={12}>面积 (sq.ft)</text>
          <text x={14} y={height / 2} textAnchor="middle" fill="#6b7280" fontSize={12} transform={`rotate(-90, 14, ${height / 2})`}>房价 ($1000)</text>
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 激活函数对比                                                              */
/* -------------------------------------------------------------------------- */
function ActivationFunctionDemo() {
  const [activeIndex, setActiveIndex] = useState(1);
  const active = ACTIVATIONS[activeIndex];

  const width = 520;
  const height = 280;
  const padding = 40;
  const xMin = -5;
  const xMax = 5;
  const yMin = active.name === 'ReLU' ? -0.2 : -1.2;
  const yMax = active.name === 'ReLU' ? 5.2 : 1.2;

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let x = xMin; x <= xMax; x += 0.05) {
      pts.push({ x, y: active.fn(x) });
    }
    return pts;
  }, [active, xMin, xMax]);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div className="flex justify-center gap-2">
        {ACTIVATIONS.map((a, i) => (
          <button
            key={a.name}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeIndex === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 280 }} role="img" aria-label={`${active.name} 激活函数曲线`}>
        <title>{active.name} 激活函数曲线</title>
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => (
          <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
        ))}
        {(active.name === 'ReLU' ? [0, 1, 2, 3, 4, 5] : [-1, -0.5, 0, 0.5, 1]).map((y) => (
          <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
        ))}
        <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={xScale(0)} y1={yScale(yMin)} x2={xScale(0)} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
      </svg>

      <div className="text-sm text-gray-600 text-center">
        当前激活函数：<strong>{active.name}</strong>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 房价网络拓扑：手工结构 vs 全连接                                          */
/* -------------------------------------------------------------------------- */
const INPUTS = [
  { key: 'size', label: '面积', unit: 'sq.ft' },
  { key: 'bedrooms', label: '卧室数', unit: '间' },
  { key: 'zip', label: '邮编', unit: '' },
  { key: 'wealth', label: '富裕度', unit: '' },
];

const HIDDEN = [
  { key: 'family', label: '家庭规模' },
  { key: 'walkable', label: '步行便利' },
  { key: 'school', label: '学区质量' },
];

// 手工结构：经典示例
const HANDCRAFT_WEIGHTS: Record<string, number[]> = {
  family: [0.0003, 0.15, 0, 0, -0.5],   // size, bedrooms, zip, wealth, bias
  walkable: [0, 0, 0.008, 0, -0.4],
  school: [0, 0, 0.003, 0.25, -0.6],
};
const HANDCRAFT_OUT_WEIGHTS = [0.5, 0.3, 0.4];
const HANDCRAFT_OUT_BIAS = 0.2;

// 全连接：每个隐藏节点都看所有输入（预设演示权重）
const FC_WEIGHTS: Record<string, number[]> = {
  family: [0.00025, 0.12, 0.002, 0.05, -0.6],
  walkable: [0.0001, 0.05, 0.007, 0.08, -0.5],
  school: [0.00005, 0.02, 0.004, 0.3, -0.7],
};
const FC_OUT_WEIGHTS = [0.45, 0.35, 0.35];
const FC_OUT_BIAS = 0.15;

function HouseNetworkDemo() {
  const [mode, setMode] = useState<'handcraft' | 'fc'>('handcraft');
  const [values, setValues] = useState({ size: 2500, bedrooms: 3, zip: 60, wealth: 7 });

  const weights = mode === 'handcraft' ? HANDCRAFT_WEIGHTS : FC_WEIGHTS;
  const outWeights = mode === 'handcraft' ? HANDCRAFT_OUT_WEIGHTS : FC_OUT_WEIGHTS;
  const outBias = mode === 'handcraft' ? HANDCRAFT_OUT_BIAS : FC_OUT_BIAS;

  const inputArr = [values.size, values.bedrooms, values.zip, values.wealth];

  const hiddenVals: Record<string, number> = {};
  HIDDEN.forEach((h) => {
    const w = weights[h.key];
    const z = w.slice(0, 4).reduce((sum, wi, i) => sum + wi * inputArr[i], 0) + w[4];
    hiddenVals[h.key] = Math.max(0, z);
  });

  const output =
    HIDDEN.reduce((sum, h, i) => sum + hiddenVals[h.key] * outWeights[i], 0) + outBias;

  // Layout (SVG)
  const nodePositions = {
    size: { x: 80, y: 60 },
    bedrooms: { x: 80, y: 140 },
    zip: { x: 80, y: 220 },
    wealth: { x: 80, y: 300 },
    family: { x: 320, y: 80 },
    walkable: { x: 320, y: 180 },
    school: { x: 320, y: 280 },
    output: { x: 560, y: 180 },
  };

  function lineOpacity(w: number) {
    if (w === 0) return 0.35;
    return Math.min(1, Math.abs(w) * 6 + 0.25);
  }

  const scale = (v: number) => Math.min(0.55, Math.max(0, v / 4));

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'handcraft' | 'fc')} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="handcraft">手工结构（经典示例）</TabsTrigger>
          <TabsTrigger value="fc">全连接网络</TabsTrigger>
        </TabsList>
        <TabsContent value="handcraft" className="text-sm text-gray-600 text-center mt-2">
          灰色连线表示权重为 0：网络只把特定输入连到对应隐藏特征。
        </TabsContent>
        <TabsContent value="fc" className="text-sm text-gray-600 text-center mt-2">
          所有输入都参与每个隐藏特征，网络自己学习哪些连接重要。
        </TabsContent>
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {INPUTS.map((inp) => (
            <div key={inp.key}>
              <label className="text-sm font-medium text-gray-700 flex justify-between mb-1">
                <span>
                  {inp.label} {inp.unit ? `(${inp.unit})` : ''}
                </span>
                <span className="text-blue-600">
                  {values[inp.key as keyof typeof values]}
                  {inp.unit}
                </span>
              </label>
              <Slider
                aria-label={`${inp.label}${inp.unit ? ` ${inp.unit}` : ''}`}
                min={inp.key === 'size' ? 500 : inp.key === 'zip' ? 10 : 0}
                max={inp.key === 'size' ? 5000 : inp.key === 'zip' ? 100 : inp.key === 'wealth' ? 10 : 6}
                step={inp.key === 'size' ? 50 : inp.key === 'zip' ? 1 : inp.key === 'wealth' ? 0.1 : 1}
                value={[values[inp.key as keyof typeof values]]}
                onValueChange={([v]) => setValues((prev) => ({ ...prev, [inp.key]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="relative">
          <svg viewBox="0 0 640 360" className="w-full h-auto bg-white rounded-lg border border-gray-200" role="img" aria-label={`${mode === 'handcraft' ? '手工连接' : '全连接'}房价神经网络`}>
            <title>{mode === 'handcraft' ? '手工结构房价网络' : '全连接房价网络'}</title>
            {/* connections input -> hidden */}
            {INPUTS.map((inp, i) =>
              HIDDEN.map((h) => {
                const w = weights[h.key][i];
                const from = nodePositions[inp.key as keyof typeof nodePositions];
                const to = nodePositions[h.key as keyof typeof nodePositions];
                return (
                  <line
                    key={`${inp.key}-${h.key}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={w > 0 ? '#2563eb' : w < 0 ? '#dc2626' : '#9ca3af'}
                    strokeWidth={Math.abs(w) * 4 + 1.5}
                    opacity={lineOpacity(w)}
                  />
                );
              })
            )}
            {/* connections hidden -> output */}
            {HIDDEN.map((h, i) => {
              const w = outWeights[i];
              const from = nodePositions[h.key as keyof typeof nodePositions];
              const to = nodePositions.output;
              return (
                <line
                  key={`${h.key}-out`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={w > 0 ? '#2563eb' : '#dc2626'}
                  strokeWidth={Math.abs(w) * 4 + 1.5}
                  opacity={0.7}
                />
              );
            })}

            {/* nodes */}
            {INPUTS.map((inp) => (
              <g key={inp.key}>
                <circle
                  cx={nodePositions[inp.key as keyof typeof nodePositions].x}
                  cy={nodePositions[inp.key as keyof typeof nodePositions].y}
                  r={22}
                  fill="#eff6ff"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <text
                  x={nodePositions[inp.key as keyof typeof nodePositions].x}
                  y={nodePositions[inp.key as keyof typeof nodePositions].y + 5}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#1e40af"
                >
                  {inp.label}
                </text>
              </g>
            ))}

            {HIDDEN.map((h) => {
              const pos = nodePositions[h.key as keyof typeof nodePositions];
              const v = hiddenVals[h.key];
              return (
                <g key={h.key}>
                  <circle cx={pos.x} cy={pos.y} r={26} fill="#fff7ed" stroke="#f59e0b" strokeWidth={2} />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="url(#hiddenGradient)"
                    fillOpacity={scale(v)}
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fill="#92400e">
                    {h.label}
                  </text>
                  <text x={pos.x} y={pos.y + 42} textAnchor="middle" fontSize={11} fill="#4b5563">
                    a = {v.toFixed(2)}
                  </text>
                </g>
              );
            })}

            <g>
              <circle cx={nodePositions.output.x} cy={nodePositions.output.y} r={28} fill="#ecfdf5" stroke="#10b981" strokeWidth={2} />
              <text x={nodePositions.output.x} y={nodePositions.output.y + 4} textAnchor="middle" fontSize={12} fill="#065f46">
                房价
              </text>
              <text x={nodePositions.output.x} y={nodePositions.output.y + 46} textAnchor="middle" fontSize={12} fill="#4b5563">
                {output.toFixed(2)}
              </text>
            </g>

            <defs>
              <radialGradient id="hiddenGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </radialGradient>
            </defs>
          </svg>
          <p className="text-xs text-gray-500 text-center mt-2">
            节点颜色深浅反映激活值大小；连线粗细/颜色反映权重绝对值/正负。
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 线性坍塌演示：ReLU vs Identity                                            */
/* -------------------------------------------------------------------------- */
function LinearCollapseDemo() {
  const [w1, setW1] = useState([1.5]);
  const [b1, setB1] = useState([-1.5]);
  const [w2, setW2] = useState([-1.2]);
  const [b2, setB2] = useState([1]);
  const [wOut, setWOut] = useState([1]);
  const [bOut, setBOut] = useState([0.3]);

  const width = 760;
  const height = 420;
  const padding = 56;
  const xMin = -3;
  const xMax = 5;

  const { reluPts, linearPts, yMin, yMax } = useMemo(() => {
    const rPts: { x: number; y: number }[] = [];
    const lPts: { x: number; y: number }[] = [];
    for (let x = xMin; x <= xMax; x += 0.05) {
      const z1 = w1[0] * x + b1[0];
      const z2 = w2[0] * x + b2[0];
      const a1 = Math.max(0, z1);
      const a2 = Math.max(0, z2);
      const reluY = wOut[0] * a1 + a2 * 0.5 + bOut[0];
      const linearY = wOut[0] * z1 + z2 * 0.5 + bOut[0];
      rPts.push({ x, y: reluY });
      lPts.push({ x, y: linearY });
    }
    const allY = rPts.concat(lPts).map((p) => p.y);
    const dataMin = Math.min(...allY);
    const dataMax = Math.max(...allY);
    const margin = Math.max(0.6, (dataMax - dataMin) * 0.12);
    return {
      reluPts: rPts,
      linearPts: lPts,
      yMin: Math.min(-1, dataMin - margin),
      yMax: Math.max(3, dataMax + margin),
    };
  }, [w1, b1, w2, b2, wOut, bOut, xMin, xMax]);

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const reluPath = reluPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const linearPath = linearPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  // generate grid lines based on current y range
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.ceil((yMax - yMin) / 8);
    const start = Math.floor(yMin / step) * step;
    for (let y = start; y <= yMax; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [yMin, yMax]);

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>神经元 1 权重 w₁</span>
            <span className="text-blue-600">{w1[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="神经元 1 权重" min={-2} max={3} step={0.1} value={w1} onValueChange={setW1} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>神经元 1 偏置 b₁</span>
            <span className="text-blue-600">{b1[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="神经元 1 偏置" min={-3} max={3} step={0.1} value={b1} onValueChange={setB1} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>输出权重 w_out</span>
            <span className="text-blue-600">{wOut[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="输出权重" min={-2} max={2} step={0.1} value={wOut} onValueChange={setWOut} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>神经元 2 权重 w₂</span>
            <span className="text-rose-600">{w2[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="神经元 2 权重" min={-2} max={3} step={0.1} value={w2} onValueChange={setW2} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>神经元 2 偏置 b₂</span>
            <span className="text-rose-600">{b2[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="神经元 2 偏置" min={-3} max={3} step={0.1} value={b2} onValueChange={setB2} />
        </div>
        <div>
          <label className="flex justify-between text-gray-700 mb-1">
            <span>输出偏置 b_out</span>
            <span className="text-emerald-600">{bOut[0].toFixed(2)}</span>
          </label>
          <Slider aria-label="输出偏置" min={-2} max={2} step={0.1} value={bOut} onValueChange={setBOut} />
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 420 }} role="img" aria-label="带 ReLU 与恒等激活的网络输出对比">
        <title>非线性激活与线性坍塌对比</title>
        {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => (
          <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
        ))}
        {yTicks.map((y) => (
          <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
        ))}
        <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={xScale(0)} y1={yScale(yMin)} x2={xScale(0)} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />

        {/* linear collapse curve */}
        <path d={linearPath} fill="none" stroke="#9ca3af" strokeWidth={3} strokeDasharray="6 4" strokeLinecap="round" />
        {/* ReLU curve */}
        <path d={reluPath} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />

        {/* legend */}
        <g transform={`translate(${width - padding - 170}, ${padding})`}>
          <line x1={0} y1={0} x2={24} y2={0} stroke="#2563eb" strokeWidth={3} />
          <text x={30} y={4} fontSize={12} fill="#374151">带 ReLU（非线性）</text>
          <line x1={0} y1={20} x2={24} y2={20} stroke="#9ca3af" strokeWidth={3} strokeDasharray="6 4" />
          <text x={30} y={24} fontSize={12} fill="#374151">恒等激活（线性坍塌）</text>
        </g>
      </svg>

      <p className="text-sm text-gray-600">
        蓝色曲线是两个 ReLU 神经元的叠加，可以形成分段线性、非单调的函数；灰色虚线是去掉激活函数后的等效单一线性函数，
        无论怎么调参数都只是一条直线。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 学到的特征：隐藏层让线性分类器解决非线性问题                              */
/* -------------------------------------------------------------------------- */
interface DataPoint {
  x: number;
  y: number;
  label: number;
}

const DATASETS: Record<string, DataPoint[]> = {
  xor: [
    { x: -1.2, y: -1.2, label: 0 },
    { x: 1.2, y: 1.2, label: 0 },
    { x: -1.2, y: 1.2, label: 1 },
    { x: 1.2, y: -1.2, label: 1 },
    { x: -0.7, y: -0.9, label: 0 },
    { x: 0.9, y: 1.1, label: 0 },
    { x: -0.9, y: 0.8, label: 1 },
    { x: 0.8, y: -0.7, label: 1 },
  ],
  circle: [
    { x: 0, y: 0, label: 1 },
    { x: 0.5, y: 0.2, label: 1 },
    { x: -0.3, y: 0.4, label: 1 },
    { x: 0.2, y: -0.5, label: 1 },
    { x: 2, y: 0, label: 0 },
    { x: -1.8, y: 0.5, label: 0 },
    { x: 0, y: 2, label: 0 },
    { x: 0.5, y: -1.8, label: 0 },
  ],
};

function LearnedFeaturesDemo() {
  const [dataset, setDataset] = useState<'xor' | 'circle'>('xor');
  const [rotation, setRotation] = useState([0]);
  const [strength, setStrength] = useState([1]);

  // 两组预设参数模拟“已经训练好”的隐藏特征：XOR 使用两组对角绝对值特征，
  // 同心圆使用八个方向的 ReLU 构成近似多边形边界。
  const network = dataset === 'xor'
    ? {
        neurons: [
          { angle: -45, b: 0, out: 1 },
          { angle: 135, b: 0, out: 1 },
          { angle: 45, b: 0, out: -1 },
          { angle: 225, b: 0, out: -1 },
        ],
        outputBias: 0,
      }
    : {
        neurons: Array.from({ length: 8 }, (_, i) => ({ angle: i * 45, b: -0.8, out: -1 })),
        outputBias: 0.6,
      };

  const hidden = network.neurons.map((neuron) => {
    const theta = ((neuron.angle + rotation[0]) * Math.PI) / 180;
    return { wx: Math.cos(theta), wy: Math.sin(theta), b: neuron.b, out: neuron.out };
  });

  const width = 520;
  const height = 360;
  const padding = 32;
  const viewMin = -2.5;
  const viewMax = 2.5;

  const xScale = (x: number) => padding + ((x - viewMin) / (viewMax - viewMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - viewMin) / (viewMax - viewMin)) * (height - 2 * padding);

  const score = (x: number, y: number) => {
    let z = network.outputBias;
    hidden.forEach((neuron) => {
      z += neuron.out * Math.max(0, neuron.wx * x + neuron.wy * y + neuron.b) * strength[0];
    });
    return z;
  };

  const gridSize = 28;
  const cells: { x: number; y: number; pred: number }[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = viewMin + ((i + 0.5) / gridSize) * (viewMax - viewMin);
      const y = viewMin + ((j + 0.5) / gridSize) * (viewMax - viewMin);
      cells.push({ x, y, pred: score(x, y) });
    }
  }

  const correctCount = DATASETS[dataset].filter((point) => (score(point.x, point.y) > 0 ? 1 : 0) === point.label).length;

  // Hidden neuron boundary lines: wx*x + wy*y + b = 0 => y = -(wx*x + b)/wy
  function hiddenLine(h: { wx: number; wy: number; b: number }, idx: number) {
    const x1 = viewMin;
    const x2 = viewMax;
    let y1: number;
    let y2: number;
    if (Math.abs(h.wy) < 1e-6) {
      // vertical line x = -b/wx
      const xv = -h.b / (h.wx || 1e-6);
      y1 = viewMin;
      y2 = viewMax;
      return (
        <line
          key={`hline-v-${idx}`}
          x1={xScale(xv)}
          y1={yScale(y1)}
          x2={xScale(xv)}
          y2={yScale(y2)}
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      );
    }
    y1 = -(h.wx * x1 + h.b) / h.wy;
    y2 = -(h.wx * x2 + h.b) / h.wy;
    return (
      <line
        key={`hline-${idx}`}
        x1={xScale(x1)}
        y1={yScale(y1)}
        x2={xScale(x2)}
        y2={yScale(y2)}
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="4 3"
        opacity={0.7}
      />
    );
  }

  const cellSize = (width - 2 * padding) / gridSize;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex gap-2">
          {(['xor', 'circle'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDataset(d);
                setRotation([0]);
                setStrength([1]);
              }}
              aria-pressed={dataset === d}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                dataset === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d === 'xor' ? 'XOR 分布' : '同心圆'}
            </button>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-sm text-gray-700 mb-1">
              <span>隐藏神经元方向旋转</span>
              <span className="text-blue-600">{rotation[0]}°</span>
            </label>
            <Slider aria-label="隐藏神经元方向旋转角度" min={-60} max={60} step={1} value={rotation} onValueChange={setRotation} />
          </div>
          <div>
            <label className="flex justify-between text-sm text-gray-700 mb-1">
              <span>输出层权重缩放</span>
              <span className="text-blue-600">{strength[0].toFixed(2)}</span>
            </label>
            <Slider aria-label="输出层权重缩放" min={0} max={2} step={0.05} value={strength} onValueChange={setStrength} />
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 360 }} role="img" aria-label={`${dataset === 'xor' ? 'XOR' : '同心圆'}数据的神经网络决策区域`}>
          <title>{dataset === 'xor' ? 'XOR 数据的非线性决策区域' : '同心圆数据的非线性决策区域'}</title>
          {/* background prediction cells */}
          {cells.map((c, idx) => {
            const cx = xScale(c.x) - cellSize / 2;
            const cy = yScale(c.y) - cellSize / 2;
            const pos = c.pred > 0;
            return (
              <rect
                key={idx}
                x={cx}
                y={cy}
                width={cellSize + 1}
                height={cellSize + 1}
                fill={pos ? '#3b82f6' : '#f43f5e'}
                opacity={0.15}
              />
            );
          })}

          {/* hidden neuron boundaries */}
          {hidden.map((h, idx) => hiddenLine(h, idx))}

          {/* axes */}
          <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
          <line x1={xScale(0)} y1={yScale(viewMin)} x2={xScale(0)} y2={yScale(viewMax)} stroke="#6b7280" strokeWidth={1.5} />

          {/* data points */}
          {DATASETS[dataset].map((p, idx) => (
            <g key={idx}>
              <circle cx={xScale(p.x)} cy={yScale(p.y)} r={6} fill={p.label === 1 ? '#2563eb' : '#e11d48'} stroke="white" strokeWidth={2} />
            </g>
          ))}

          {/* legend */}
          <g transform={`translate(${padding}, ${padding})`}>
            <rect x={0} y={0} width={14} height={14} fill="#3b82f6" opacity={0.3} />
            <text x={20} y={12} fontSize={11} fill="#374151">类别 1 区域</text>
            <rect x={0} y={20} width={14} height={14} fill="#f43f5e" opacity={0.3} />
            <text x={20} y={32} fontSize={11} fill="#374151">类别 0 区域</text>
            <line x1={0} y1={46} x2={18} y2={46} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
            <text x={24} y={50} fontSize={11} fill="#374151">隐藏神经元边界</text>
          </g>
        </svg>
      </div>

      <div className={`rounded-lg border p-3 text-sm ${correctCount === DATASETS[dataset].length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        当前训练点准确率：<strong>{correctCount}/{DATASETS[dataset].length}</strong>。
        默认参数是一组预设的可分解；旋转方向或缩放输出权重会改变隐藏特征与最终边界。
      </div>

      <p className="text-sm text-gray-600">
        背景颜色是最终输出 <KaTeX math={String.raw`h(x)=W^{[2]}a^{[1]}+b^{[2]}`} display={false} /> 的符号。
        每个橙色虚线是一个隐藏神经元从激活到 0 的分界线；最终决策边界是这些 ReLU 特征的线性组合，因此可以形成分段线性的非线性边界。
        默认参数展示隐藏特征如何让原本线性不可分的数据变得可分；交互调整后，准确率也会同步反映边界是否仍然合适。
      </p>
    </div>
  );
}
