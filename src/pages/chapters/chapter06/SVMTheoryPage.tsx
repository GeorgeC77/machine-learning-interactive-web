import { useState, useMemo } from 'react';
import { ShieldAlert, BookOpen, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function SVMTheoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第六章 · 支持向量机
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">SVM 理论与算法</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          从优化问题到对偶问题，从 KKT 条件到 SMO 算法，本节将梳理 SVM 的完整理论脉络，
          并展示核技巧如何自然融入 SVM 框架。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Primal problem */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">原始优化问题</h2>
        </div>
        <p className="text-gray-700 mb-4">
          最大间隔分类器可以写成如下凸优化问题：
        </p>

        <FormulaCard
          title="SVM 原始问题"
          formula={
            <KaTeX
              math={String.raw`\min_{w, b} \; \frac{1}{2} \|w\|^2 \quad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge 1, \; i = 1, \dots, m`}
              display
            />
          }
          description="约束条件要求所有样本的函数间隔至少为 1，目标是最小化 ||w||²，即最大化几何间隔。"
        />

        <p className="text-gray-700 mb-4">
          为了允许部分样本被误分类，引入松弛变量 <KaTeX math={String.raw`\xi_i`} /> 和惩罚参数 C：
        </p>

        <FormulaCard
          title="软间隔 SVM"
          formula={
            <KaTeX
              math={String.raw`\min_{w, b, \xi} \; \frac{1}{2} \|w\|^2 + C \sum_{i=1}^{m} \xi_i \quad \text{s.t.} \quad y^{(i)}(w^T x^{(i)} + b) \ge 1 - \xi_i, \; \xi_i \ge 0`}
              display
            />
          }
          description="C 越大，对误分类的惩罚越重，间隔越窄；C 越小，允许更多误分类，间隔更宽。"
        />
      </section>

      {/* Dual problem */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">对偶问题</h2>
        <p className="text-gray-700 mb-4">
          通过拉格朗日乘子法，可以得到 SVM 的对偶问题。对偶问题只涉及样本之间的内积，
          这为核技巧的应用打开了大门。
        </p>

        <FormulaCard
          title="SVM 对偶问题"
          formula={
            <KaTeX
              math={String.raw`\max_{\alpha} \; \sum_{i=1}^{m} \alpha_i - \frac{1}{2} \sum_{i,j=1}^{m} y^{(i)} y^{(j)} \alpha_i \alpha_j \langle x^{(i)}, x^{(j)} \rangle`}
              display
            />
          }
          description="约束条件：0 ≤ α_i ≤ C，且 Σ α_i y^(i) = 0。"
        />

        <FormulaCard
          title="决策函数"
          formula={
            <KaTeX
              math={String.raw`h_{w,b}(x) = \sum_{i=1}^{m} \alpha_i y^{(i)} \langle x^{(i)}, x \rangle + b`}
              display
            />
          }
          description="只有 α_i > 0 的样本才是支持向量。在软间隔 SVM 中，0 < α_i < C 的点通常位于间隔边界上，α_i = C 的点往往是间隔内或被误分类的样本；它们都可能影响最终决策边界。"
        />
      </section>

      {/* Kernel SVM */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核 SVM</h2>
        <p className="text-gray-700 mb-4">
          对偶问题中的内积 <KaTeX math={String.raw`\langle x^{(i)}, x^{(j)} \rangle`} /> 可以直接替换为核函数 <KaTeX math={String.raw`K(x^{(i)}, x^{(j)})`} />：
        </p>

        <FormulaCard
          title="核 SVM 决策函数"
          formula={
            <KaTeX
              math={String.raw`h(x) = \sum_{i=1}^{m} \alpha_i y^{(i)} K(x^{(i)}, x) + b`}
              display
            />
          }
          description="这样就在高维特征空间中训练了线性 SVM，却不需要显式计算 φ(x)。"
        />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：C 参数与间隔宽度</h2>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
          注意：该图不是实时求解 SVM 优化问题，而是为了直观展示 C 参数作用而构造的简化示意图。
        </p>
        <p className="text-gray-700 mb-4">
          下面用一个简化的二维数据集演示软间隔 SVM 中 C 参数的作用。
          C 控制对误分类的惩罚强度：C 越大，间隔越窄，越不允许误分类；C 越小，间隔越宽，允许更多样本穿过间隔边界。
        </p>
        <SoftMarginDemo />
      </section>

      {/* SMO algorithm */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SMO 算法</h2>
        <p className="text-gray-700 mb-4">
          SMO（Sequential Minimal Optimization）是求解 SVM 对偶问题的高效算法。
          它每次只优化两个拉格朗日乘子 <KaTeX math={String.raw`\alpha_i`} /> 和 <KaTeX math={String.raw`\alpha_j`} />，
          而将其他乘子固定。
        </p>

        <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
          <h3 className="font-semibold text-violet-800 mb-2">SMO 的核心步骤</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>选择一对违反 KKT 条件的乘子 α_i 和 α_j。</li>
            <li>在保持其他乘子不变的约束下，优化这两个乘子。</li>
            <li>更新阈值 b。</li>
            <li>重复直到所有乘子满足 KKT 条件。</li>
          </ol>
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
            <span>SVM 原始问题是带约束的凸二次规划问题。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>对偶问题只涉及样本内积，便于引入核函数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>软间隔参数 C 控制间隔宽度与误分类惩罚之间的权衡。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>SMO 算法通过每次优化两个乘子来高效求解对偶问题。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function SoftMarginDemo() {
  const [cValue, setCValue] = useState(1.0);

  // Dataset: most +1 points in upper-right, most -1 points in lower-left,
  // with one outlier (-1) mixed into the +1 region to show soft margin effect.
  const points = useMemo(
    () => [
      { x: 3.0, y: 3.0, label: 1 },
      { x: 4.0, y: 3.0, label: 1 },
      { x: 3.0, y: 4.0, label: 1 },
      { x: 4.0, y: 4.0, label: 1 },
      { x: 5.0, y: 3.0, label: 1 },
      { x: 1.0, y: 1.0, label: -1 },
      { x: 2.0, y: 1.0, label: -1 },
      { x: 1.0, y: 2.0, label: -1 },
      { x: 2.0, y: 2.0, label: -1 },
      { x: 3.0, y: 1.0, label: -1 },
      // outlier: a -1 point in the +1 region
      { x: 3.5, y: 3.5, label: -1, isOutlier: true },
    ],
    []
  );

  // Approximate decision boundary for visualization.
  // Boundary: x + y = s(C). Larger C moves boundary toward the outlier.
  const boundaryShift = useMemo(() => {
    // C 小 -> 忽略异常点的最大间隔边界：x + y ≈ 5（负类最大 x+y=4，正类最小 x+y=6 的中点）
    // C 增大 -> 边界向异常点移动：x + y ≈ 6（但异常点仍无法在不误伤正类点 (3,3) 的前提下被正确分类）
    return 5.0 + 1.0 * (1 - Math.exp(-cValue));
  }, [cValue]);

  const margin = useMemo(() => {
    // Wider margin for small C, narrower for large C
    // C 很小时 ≈ 0.7 ≈ (6−5)/√2，与忽略异常点时的几何间隔一致
    return 0.2 + 0.5 * Math.exp(-0.5 * cValue);
  }, [cValue]);

  const width = 520;
  const height = 420;
  const padding = 40;
  const xMin = 0;
  const xMax = 6;
  const yMin = 0;
  const yMax = 5;

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Boundary line: x + y = boundaryShift => y = boundaryShift - x
  const boundaryPoints: { x: number; y: number }[] = [];
  const marginPos: { x: number; y: number }[] = [];
  const marginNeg: { x: number; y: number }[] = [];

  for (let x = xMin; x <= xMax; x += 0.1) {
    const y = boundaryShift - x;
    if (y >= yMin && y <= yMax) boundaryPoints.push({ x, y });

    const yPos = boundaryShift - x + margin;
    const yNeg = boundaryShift - x - margin;
    if (yPos >= yMin && yPos <= yMax) marginPos.push({ x, y: yPos });
    if (yNeg >= yMin && yNeg <= yMax) marginNeg.push({ x, y: yNeg });
  }

  const pathD = boundaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const pathPos = marginPos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');
  const pathNeg = marginNeg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  const misclassifiedCount = points.filter((p) => p.label * (p.x + p.y - boundaryShift) <= 0).length;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          软间隔参数 C = <span className="font-mono">{cValue.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0.05}
          max={5}
          step={0.05}
          value={cValue}
          onChange={(e) => setCValue(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>C 小：允许误分类，间隔宽</span>
          <span>C 大：惩罚更重，间隔窄</span>
        </div>
      </div>

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        该图为简化示意图，用于直观展示 C 参数对间隔宽度与误分类的影响，并非真实 SVM 优化器的实时求解结果。
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 420 }}>
        {/* grid */}
        {[0, 1, 2, 3, 4, 5, 6].map((x) => (
          <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((y) => (
          <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
        ))}
        {/* axes */}
        <line x1={padding} y1={yScale(yMin)} x2={width - padding} y2={yScale(yMin)} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={padding} y1={yScale(yMin)} x2={padding} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />
        {/* ticks */}
        {[0, 1, 2, 3, 4, 5, 6].map((x) => (
          <g key={`xt-${x}`}>
            <line x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMin) + 5} stroke="#6b7280" />
            <text x={xScale(x)} y={yScale(yMin) + 18} textAnchor="middle" fontSize={10} fill="#4b5563">{x}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map((y) => (
          <g key={`yt-${y}`}>
            <line x1={padding - 5} y1={yScale(y)} x2={padding} y2={yScale(y)} stroke="#6b7280" />
            <text x={padding - 8} y={yScale(y) + 3} textAnchor="end" fontSize={10} fill="#4b5563">{y}</text>
          </g>
        ))}

        {/* margin boundaries */}
        {pathPos && <path d={pathPos} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6,4" />}
        {pathNeg && <path d={pathNeg} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6,4" />}

        {/* decision boundary */}
        {pathD && <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={3} />}

        {/* points */}
        {points.map((p, i) => {
          const isMisclassified = p.label * (p.x + p.y - boundaryShift) <= 0;
          return (
            <g key={i}>
              <circle
                cx={xScale(p.x)}
                cy={yScale(p.y)}
                r={p.isOutlier ? 8 : 6}
                fill={p.label === 1 ? '#10b981' : '#f43f5e'}
                stroke={p.isOutlier ? '#f59e0b' : 'white'}
                strokeWidth={p.isOutlier ? 3 : 2}
              />
              {isMisclassified && (
                <g stroke="#7f1d1d" strokeWidth={2}>
                  <line x1={xScale(p.x) - 5} y1={yScale(p.y) - 5} x2={xScale(p.x) + 5} y2={yScale(p.y) + 5} />
                  <line x1={xScale(p.x) + 5} y1={yScale(p.y) - 5} x2={xScale(p.x) - 5} y2={yScale(p.y) + 5} />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="grid md:grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">当前误分类样本数</p>
          <p className={`text-xl font-mono font-bold ${misclassifiedCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {misclassifiedCount}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">间隔宽度（近似）</p>
          <p className="text-xl font-mono font-bold text-blue-600">{margin.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        橙色外圈的点是异常点。C 较小时，边界近似 x+y=5，仅异常点被误分类、间隔较宽；
        C 增大时，边界向异常点移动、间隔变窄，但异常点仍难以在不误伤正类点 (3,3) 的情况下被正确分类。
        这是用于演示 C 参数影响的简化可视化。
      </div>
    </div>
  );
}
