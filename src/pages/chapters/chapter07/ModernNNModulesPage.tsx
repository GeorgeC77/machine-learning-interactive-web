import { useState } from 'react';
import { ShieldAlert, Layers, CheckCircle2, GitBranch, Gauge , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

const IMAGE = [
  [2, 1, 0, 1, 2],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [2, 1, 0, 1, 2],
];

const KERNEL = [
  [0, 1, 0],
  [1, -4, 1],
  [0, 1, 0],
];

export default function ModernNNModulesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第七章 · 深度学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">现代神经网络模块</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          除了全连接层，现代神经网络还包含卷积层、残差连接、层归一化等模块。
          这些模块让网络更适合处理图像、序列等结构化数据，并缓解深层网络的训练困难。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Fully connected */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">全连接层</h2>
        </div>
        <p className="text-gray-700 mb-4">
          全连接层（Dense / Linear）中，每个输入神经元都与每个输出神经元相连：
        </p>

        <FormulaCard
          title="全连接层"
          formula={
            <KaTeX
              math={String.raw`a^{[l]} = f\bigl(W^{[l]} a^{[l-1]} + b^{[l]}\bigr)`}
              display
            />
          }
          description="参数量大，适合处理特征向量，但会忽略空间结构。"
        />
      </section>

      {/* Residual connections */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">残差连接：让梯度“抄近路”</h2>
        </div>
        <p className="text-gray-700 mb-4">
          经典讲义将残差块简化为 <KaTeX math={String.raw`\mathrm{Res}(z) = z + \mathrm{MM}(\phi(\mathrm{MM}(z)))`} display={false} />。
          通过把输入直接加到输出，网络只需学习残差 <KaTeX math={String.raw`F(z)`} display={false} />；
          当残差接近 0 时，深层网络至少可以“复制”浅层输入，缓解梯度消失。
        </p>

        <FormulaCard
          title="残差块"
          formula={
            <KaTeX
              math={String.raw`\mathrm{Res}(z) = z + F(z), \quad F(z)=W^{[2]}\phi(W^{[1]}z+b^{[1]})+b^{[2]}`}
              display
            />
          }
          description="跳跃连接让信息直接传递，也让反向传播时梯度有一条高速公路。"
        />

        <div className="mt-6">
          <ResidualDemo />
        </div>
      </section>

      {/* Layer normalization */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">层归一化：稳定数值尺度</h2>
        </div>
        <p className="text-gray-700 mb-4">
          层归一化按单个样本的指定特征维度计算均值与方差，再通过可学习的缩放 <KaTeX math={String.raw`\gamma`} display={false} /> 和平移 <KaTeX math={String.raw`\beta`} display={false} /> 恢复表达能力。
          它不依赖同一批量中的其他样本，常用于 Transformer 等序列模型。
        </p>

        <FormulaCard
          title="层归一化"
          formula={
            <KaTeX
              math={String.raw`
                \begin{aligned}
                \hat{\mu} &= \frac{1}{d}\sum_{j=1}^{d}z_j, \qquad
                \hat{\sigma}^{2}=\frac{1}{d}\sum_{j=1}^{d}(z_j-\hat{\mu})^2 \\
                \mathrm{LN}(z_j) &= \gamma_j\frac{z_j-\hat{\mu}}{\sqrt{\hat{\sigma}^{2}+\epsilon}}+\beta_j
                \end{aligned}
              `}
              display
            />
          }
          description="这里 d 是参与归一化的特征数，ε 防止方差为 0 时发生除零。LayerNorm 使用总体方差形式除以 d，而不是无偏样本方差中的 d−1。"
        />

        <div className="mt-6">
          <LayerNormDemo />
        </div>
      </section>

      {/* Convolution */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">卷积层</h2>
        <p className="text-gray-700 mb-4">
          卷积层使用可学习的卷积核在输入上滑动，提取局部特征。它通过权重共享大幅减少参数量，
          并保留空间结构。
        </p>

        <FormulaCard
          title="卷积操作"
          formula={
            <KaTeX
              math={String.raw`(I * K)_{i,j} = \sum_{m}\sum_{n} I_{i+m, j+n} \, K_{m,n}`}
              display
            />
          }
          description="卷积核 K 在输入 I 上滑动，逐元素相乘再求和。"
        />

        <p className="text-xs text-gray-500 mt-3">
          深度学习库通常实现不翻转卷积核的互相关（cross-correlation），但习惯上仍称为“卷积”；本页公式与演示采用这一约定。
        </p>

        {/* Interactive demo */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">交互演示：卷积核滑动</h3>
          <p className="text-gray-600 text-sm mb-4">
            点击网格中的位置，观察 3×3 卷积核在该位置计算出的输出值。
          </p>
          <ConvolutionDemo />
        </div>
      </section>

      {/* Other modules */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">其他常见模块</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">池化层（Pooling）</h3>
            <p className="text-sm text-gray-700">
              通过取局部最大值或平均值降低特征图尺寸，减少计算量并提供一定平移不变性。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">Dropout</h3>
            <p className="text-sm text-gray-700">
              训练时随机屏蔽部分激活，减少网络对单一路径的依赖，可作为缓解过拟合的正则化方法。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">批归一化（BatchNorm）</h3>
            <p className="text-sm text-gray-700">
              在小批量上估计每个通道或特征的统计量，通常能稳定训练并支持较大的学习率。与层归一化不同，它依赖批次统计量。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">自注意力（Self-Attention）</h3>
            <p className="text-sm text-gray-700">
              让序列中每个位置都能根据所有位置的信息动态加权聚合，是 Transformer 的核心。
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>全连接层适合向量输入，但参数量大。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>残差连接让网络学习残差映射，缓解深层梯度消失。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>层归一化稳定中间层数值尺度，是现代大语言模型的基础模块。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-emerald-500 mt-0.5 mt-1" />
            <span>卷积层通过局部连接和权重共享高效处理图像等网格数据。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 残差连接演示                                                              */
/* -------------------------------------------------------------------------- */
function ResidualDemo() {
  const [input, setInput] = useState([2]);
  const [degradation, setDegradation] = useState([0.3]);

  const z = input[0];
  // F(z): a residual branch that has been weakened (simulating near-identity mapping)
  const fz = degradation[0] * Math.tanh(z);
  const withResidual = z + fz;
  const withoutResidual = fz;

  const width = 520;
  const height = 260;
  const padding = 40;
  const xMin = -4;
  const xMax = 4;
  const yMin = -5;
  const yMax = 5;

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Plot y = x (identity), y = F(z), y = z + F(z)
  const identityPts: string[] = [];
  const residualPts: string[] = [];
  const plainPts: string[] = [];
  for (let x = xMin; x <= xMax; x += 0.1) {
    const f = degradation[0] * Math.tanh(x);
    identityPts.push(`${xScale(x)},${yScale(x)}`);
    residualPts.push(`${xScale(x)},${yScale(x + f)}`);
    plainPts.push(`${xScale(x)},${yScale(f)}`);
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>输入 z</span>
              <span className="text-blue-600">{z.toFixed(2)}</span>
            </label>
            <Slider aria-label="残差块输入 z" min={-3} max={3} step={0.1} value={input} onValueChange={setInput} />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>残差分支强度（退化程度）</span>
              <span className="text-blue-600">{degradation[0].toFixed(2)}</span>
            </label>
            <Slider aria-label="残差分支强度" min={0} max={1.5} step={0.05} value={degradation} onValueChange={setDegradation} />
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">F(z) = α·tanh(z):</span>
              <span className="font-mono font-medium">{fz.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">无残差输出 F(z):</span>
              <span className="font-mono font-medium text-rose-600">{withoutResidual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">有残差输出 z + F(z):</span>
              <span className="font-mono font-medium text-emerald-600">{withResidual.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 260 }} role="img" aria-label="残差连接与普通分支输出对比">
          <title>残差连接输出对比</title>
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => (
            <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
          ))}
          {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((y) => (
            <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
          ))}
          <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
          <line x1={xScale(0)} y1={yScale(yMin)} x2={xScale(0)} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />

          <polyline points={identityPts.join(' ')} fill="none" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 3" />
          <polyline points={plainPts.join(' ')} fill="none" stroke="#f43f5e" strokeWidth={3} />
          <polyline points={residualPts.join(' ')} fill="none" stroke="#2563eb" strokeWidth={3} />

          {/* current input marker */}
          <circle cx={xScale(z)} cy={yScale(withResidual)} r={5} fill="#2563eb" />
          <circle cx={xScale(z)} cy={yScale(withoutResidual)} r={5} fill="#f43f5e" />

          <g transform={`translate(${padding + 8}, ${padding})`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke="#2563eb" strokeWidth={3} />
            <text x={28} y={4} fontSize={11} fill="#374151">z + F(z)</text>
            <line x1={0} y1={18} x2={20} y2={18} stroke="#f43f5e" strokeWidth={3} />
            <text x={28} y={22} fontSize={11} fill="#374151">F(z)</text>
            <line x1={0} y1={36} x2={20} y2={36} stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 3" />
            <text x={28} y={40} fontSize={11} fill="#374151">y = z</text>
          </g>
        </svg>
      </div>

      <p className="text-sm text-gray-600">
        当残差分支 <KaTeX math={String.raw`F(z)`} display={false} /> 很小时，有残差的输出（蓝线）仍然贴近恒等映射 <KaTeX math={String.raw`y=z`} display={false} />（灰虚线），
        因此残差块保留了一条直接传递输入和梯度的路径；而无残差的输出（红线）在本演示中会被压缩到 0 附近。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 层归一化演示                                                              */
/* -------------------------------------------------------------------------- */
const DEFAULT_VECTOR = [2, -1, 3, 0, -2];

function LayerNormDemo() {
  const [vec, setVec] = useState(DEFAULT_VECTOR);
  const [gamma, setGamma] = useState([1]);
  const [beta, setBeta] = useState([0]);

  const mean = vec.reduce((a, b) => a + b, 0) / vec.length;
  const variance = vec.reduce((a, b) => a + (b - mean) ** 2, 0) / vec.length;
  const std = Math.sqrt(variance + 1e-6);
  const normalized = vec.map((v) => (v - mean) / std);
  const ln = normalized.map((v) => gamma[0] * v + beta[0]);

  const barHeight = (v: number) => Math.min(80, Math.max(4, Math.abs(v) * 18 + 4));
  const barColor = (v: number) => (v >= 0 ? '#2563eb' : '#f43f5e');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">调整原始向量 z 的每个维度：</p>
          {vec.map((v, i) => (
            <div key={i}>
              <label className="flex justify-between text-xs text-gray-600 mb-1">
                <span>z_{i + 1}</span>
                <span className="text-blue-600">{v.toFixed(2)}</span>
              </label>
              <Slider
                aria-label={`层归一化输入 z ${i + 1}`}
                min={-4}
                max={4}
                step={0.1}
                value={[v]}
                onValueChange={([nv]) => {
                  const next = [...vec];
                  next[i] = nv;
                  setVec(next);
                }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>缩放 γ</span>
              <span className="text-violet-600">{gamma[0].toFixed(2)}</span>
            </label>
            <Slider aria-label="层归一化缩放 gamma" min={0.1} max={2} step={0.05} value={gamma} onValueChange={setGamma} />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>平移 β</span>
              <span className="text-violet-600">{beta[0].toFixed(2)}</span>
            </label>
            <Slider aria-label="层归一化平移 beta" min={-2} max={2} step={0.05} value={beta} onValueChange={setBeta} />
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">均值 μ̂：</span>
              <span className="font-mono font-medium">{mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">标准差 σ̂：</span>
              <span className="font-mono font-medium">{std.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LN-S 均值 / 标准差：</span>
              <span className="font-mono font-medium text-emerald-600">{(normalized.reduce((a, b) => a + b, 0) / normalized.length).toFixed(2)} / {Math.sqrt(normalized.reduce((a, b) => a + b * b, 0) / normalized.length).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="font-medium text-gray-700 mb-2">原始 z</p>
          <div className="flex items-end gap-1 h-24">
            {vec.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t"
                  style={{ height: barHeight(v), backgroundColor: barColor(v) }}
                />
                <span className="text-[10px] text-gray-500">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="font-medium text-gray-700 mb-2">LN-S(z) = (z − μ̂)/σ̂</p>
          <div className="flex items-end gap-1 h-24">
            {normalized.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t"
                  style={{ height: barHeight(v), backgroundColor: barColor(v) }}
                />
                <span className="text-[10px] text-gray-500">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="font-medium text-gray-700 mb-2">LN(z) = γ·LN-S + β</p>
          <div className="flex items-end gap-1 h-24">
            {ln.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t"
                  style={{ height: barHeight(v), backgroundColor: barColor(v) }}
                />
                <span className="text-[10px] text-gray-500">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        先把向量归一化到 0 均值、1 标准差，再通过 γ 和 β 恢复模型想要的尺度和偏移。
        为便于观察，本演示让所有维度共享一对标量 γ、β；实际网络通常为每个特征分别学习 γⱼ、βⱼ。
        注意均值与标准差本身也是输入的函数，反向传播时需要对它们求导。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 卷积演示                                                                  */
/* -------------------------------------------------------------------------- */
function ConvolutionDemo() {
  const [row, setRow] = useState(1);
  const [col, setCol] = useState(1);

  const outputValue = computeConvolution(IMAGE, KERNEL, row, col);

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">输入图像（点击选择卷积核中心位置）</p>
          <div className="inline-grid grid-cols-5 gap-1">
            {IMAGE.map((rowArr, r) =>
              rowArr.map((val, c) => {
                const inKernel = Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={r < 1 || r > 3 || c < 1 || c > 3}
                    aria-label={r >= 1 && r <= 3 && c >= 1 && c <= 3 ? `选择卷积核中心，第 ${r + 1} 行第 ${c + 1} 列` : `边界像素，第 ${r + 1} 行第 ${c + 1} 列`}
                    aria-pressed={r === row && c === col}
                    onClick={() => {
                      setRow(r);
                      setCol(c);
                    }}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-medium rounded transition-colors ${
                      inKernel ? 'bg-blue-300 text-blue-900' : 'bg-white text-gray-700 border border-gray-200'
                    } ${r >= 1 && r <= 3 && c >= 1 && c <= 3 ? 'cursor-pointer hover:bg-blue-100' : 'cursor-default disabled:opacity-70'}`}
                  >
                    {val}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">卷积核（边缘检测）</p>
            <div className="inline-grid grid-cols-3 gap-1">
              {KERNEL.map((rowArr, r) =>
                rowArr.map((val, c) => (
                  <div
                    key={`k-${r}-${c}`}
                    className="w-10 h-10 flex items-center justify-center text-xs font-medium rounded bg-violet-100 text-violet-900"
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">中心位置：({row}, {col})</p>
            <p className="text-sm text-gray-600">卷积输出：</p>
            <p className="text-2xl font-mono font-bold text-blue-700">{outputValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeConvolution(image: number[][], kernel: number[][], centerRow: number, centerCol: number): number {
  let sum = 0;
  for (let kr = 0; kr < 3; kr++) {
    for (let kc = 0; kc < 3; kc++) {
      const r = centerRow + kr - 1;
      const c = centerCol + kc - 1;
      sum += image[r][c] * kernel[kr][kc];
    }
  }
  return sum;
}
