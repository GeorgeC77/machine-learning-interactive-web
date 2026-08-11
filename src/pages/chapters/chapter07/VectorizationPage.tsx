import { useState, useMemo } from 'react';
import { ShieldAlert, Zap, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function VectorizationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第七章 · 深度学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">训练样本的向量化</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          向量化是高效训练神经网络的关键。通过把多个样本组织成矩阵，可以利用线性代数库和 GPU 并行计算，
          大幅提升训练速度。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Why vectorize */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么要向量化？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设一个训练批量有 m 个样本，每个样本维度为 n。如果用循环逐个计算，
          不仅代码冗长，而且无法充分利用现代硬件的并行计算能力。
        </p>

        <FormulaCard
          title="向量化前向传播"
          formula={
            <KaTeX
              math={String.raw`Z = W X + b`}
              display
            />
          }
          description="X 是 n×m 的输入矩阵，每一列是一个样本；W 是权重矩阵；b 通过广播机制加到每一列。"
        />

        <p className="text-gray-700 mb-4">
          一次矩阵乘法就可以同时处理批量中的所有样本。与解释器层面的逐样本循环相比，
          它在批量较大并使用优化线性代数库或 GPU 时通常更快；实际加速比取决于矩阵规模、硬件和实现。
        </p>
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：矩阵乘法与批量计算</h2>
        <p className="text-gray-700 mb-4">
          下面展示如何把最多 4 个样本组成输入矩阵 X，再通过矩阵乘法一次性得到当前批量的全部输出。
        </p>
        <VectorizationDemo />
      </section>

      {/* Benefits */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">向量化的优势</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">代码简洁</h3>
            <p className="text-sm text-gray-700">
              用矩阵运算替代嵌套循环，代码更短、更易读、更不容易出错。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">计算高效</h3>
            <p className="text-sm text-gray-700">
              线性代数库经过高度优化，能够充分利用 CPU 缓存和 SIMD 指令。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">GPU 加速</h3>
            <p className="text-sm text-gray-700">
              GPU 擅长并行执行大规模矩阵运算，向量化让深度学习训练速度大幅提升。
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-0.5 mt-1" />
            <span>向量化把多个样本组织成矩阵，避免显式循环。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-0.5 mt-1" />
            <span>矩阵运算可以利用高度优化的线性代数库和 GPU 并行能力。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-amber-500 mt-0.5 mt-1" />
            <span>向量化是高效训练神经网络的基础。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function VectorizationDemo() {
  const [batchSize, setBatchSize] = useState(4);

  // Fixed weight vector and input samples for visualization
  const W = [1.5, -0.5];
  const b = 0.5;
  const samples = useMemo(
    () => [
      [2.0, 1.0],
      [1.0, 3.0],
      [-1.0, 2.0],
      [0.5, -0.5],
    ],
    []
  );

  const outputs = samples.map((x) => W[0] * x[0] + W[1] * x[1] + b);
  const visibleSamples = samples.slice(0, batchSize);
  const visibleOutputs = outputs.slice(0, batchSize);
  const xMatrix = String.raw`X=\begin{bmatrix}${visibleSamples.map((x) => x[0].toFixed(1)).join(' & ')} \\ ${visibleSamples.map((x) => x[1].toFixed(1)).join(' & ')}\end{bmatrix}`;
  const zMatrix = String.raw`Z=\begin{bmatrix}${visibleOutputs.map((z) => z.toFixed(2)).join(' & ')}\end{bmatrix}`;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          批量大小 = <span className="font-mono">{batchSize}</span>
        </label>
        <input
          type="range"
          aria-label="批量大小"
          min={1}
          max={4}
          step={1}
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <caption className="sr-only">逐样本计算结果，用于核对向量化矩阵运算</caption>
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="py-2 px-3">样本</th>
              <th className="py-2 px-3">输入 x</th>
              <th className="py-2 px-3">计算</th>
              <th className="py-2 px-3">输出 z = Wx + b</th>
            </tr>
          </thead>
          <tbody>
            {visibleSamples.map((x, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-3 font-medium">{i + 1}</td>
                <td className="py-2 px-3 font-mono">[{x[0].toFixed(1)}, {x[1].toFixed(1)}]</td>
                <td className="py-2 px-3 font-mono">
                  {W[0].toFixed(1)}·{x[0].toFixed(1)} + {W[1].toFixed(1)}·{x[1].toFixed(1)} + {b.toFixed(1)}
                </td>
                <td className="py-2 px-3 font-mono font-bold text-blue-700">{outputs[i].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-700 mb-2">
          当前批量的矩阵形状为 <span className="font-mono">X∈ℝ<sup>2×{batchSize}</sup></span>、
          <span className="font-mono">W∈ℝ<sup>1×2</sup></span>、<span className="font-mono">Z∈ℝ<sup>1×{batchSize}</sup></span>：
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="overflow-x-auto"><KaTeX math={xMatrix} display /></div>
          <div className="overflow-x-auto"><KaTeX math={zMatrix} display /></div>
        </div>
        <KaTeX math={String.raw`Z = W X + b\mathbf{1}^{T}`} display />
        <p className="text-sm text-gray-600 mt-2">
          其中 <KaTeX math={String.raw`\mathbf{1}\in\mathbb{R}^{m}`} />；写成代码时，框架通常通过广播自动把偏置 b 加到每一列。
        </p>
      </div>
    </div>
  );
}
