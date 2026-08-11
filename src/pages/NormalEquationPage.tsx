import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Target, Footprints, Calculator, BarChart3, HelpCircle, User, Car } from 'lucide-react';
import KaTeX from '../components/KaTeX';
import FormulaCard from '../components/FormulaCard';
import InteractiveDemo from '../components/InteractiveDemo';
import InteractivePanel from '../components/InteractivePanel';

/* ------------------------------------------------------------------ */
/*  matrix helpers for 2×2 normal equation                             */
/* ------------------------------------------------------------------ */
function matMul(a: number[][], b: number[][]): number[][] {
  const aRows = a.length;
  const aCols = a[0].length;
  const bCols = b[0].length;
  const out: number[][] = Array.from({ length: aRows }, () => Array(bCols).fill(0));
  for (let i = 0; i < aRows; i++)
    for (let j = 0; j < bCols; j++)
      for (let k = 0; k < aCols; k++) out[i][j] += a[i][k] * b[k][j];
  return out;
}
function inv22(m: number[][]): number[][] | null {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (Math.abs(det) < 1e-12) return null;
  return [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det],
  ];
}
function transpose(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const out: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) out[j][i] = m[i][j];
  return out;
}
function solveNormalEquation(X: number[][], y: number[]): number[] | null {
  const Xt = transpose(X); // 2 × m
  const XtX = matMul(Xt, X); // 2 × 2
  const inv = inv22(XtX);
  if (!inv) return null;
  const Xty = [Xt[0].reduce((s, v, i) => s + v * y[i], 0), Xt[1].reduce((s, v, i) => s + v * y[i], 0)];
  return [inv[0][0] * Xty[0] + inv[0][1] * Xty[1], inv[1][0] * Xty[0] + inv[1][1] * Xty[1]];
}

/* ------------------------------------------------------------------ */
/*  data generator                                                      */
/* ------------------------------------------------------------------ */
function generateData(n: number, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand() * 10;
    const noise = (rand() - 0.5) * 6;
    const y = 2 + 1.5 * x + noise;
    points.push({ x, y });
  }
  return points;
}

/* ------------------------------------------------------------------ */
/*  D3 chart component                                                   */
/* ------------------------------------------------------------------ */
function NormalEquationChart({ points, theta }: { points: { x: number; y: number }[]; theta: number[] | null }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !theta) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 560;
    const height = 360;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xMin = -1;
    const xMax = 11;
    const yMin = -2;
    const yMax = 22;

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    /* axes */
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .text('x');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .text('y');

    /* fitted line */
    const lineX1 = xMin;
    const lineY1 = theta[0] + theta[1] * lineX1;
    const lineX2 = xMax;
    const lineY2 = theta[0] + theta[1] * lineX2;

    g.append('line')
      .attr('x1', xScale(lineX1))
      .attr('y1', yScale(lineY1))
      .attr('x2', xScale(lineX2))
      .attr('y2', yScale(lineY2))
      .attr('stroke', '#3a7bd5')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    /* data points */
    g.selectAll('circle.data')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', '#e25b5b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    /* residual lines */
    points.forEach((d) => {
      const yHat = theta[0] + theta[1] * d.x;
      g.append('line')
        .attr('x1', xScale(d.x))
        .attr('y1', yScale(d.y))
        .attr('x2', xScale(d.x))
        .attr('y2', yScale(yHat))
        .attr('stroke', '#f08a5d')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.6);
    });
  }, [points, theta]);

  return <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: 360 }} />;
}

/* ------------------------------------------------------------------ */
/*  comparison table data                                                */
/* ------------------------------------------------------------------ */
const comparisonRows = [
  { aspect: '学习率 α', ne: '无需选择', gd: '需要手动选择合适值' },
  { aspect: '迭代次数', ne: '无需迭代，直接求解', gd: '需要多次迭代收敛' },
  { aspect: '时间复杂度', ne: '构造 XᵀX：O(mn²)；求解线性系统：~O(n³)', gd: '每次迭代：O(mn)；总成本取决于迭代次数' },
  { aspect: '特征数 n', ne: '适合特征维度较小的问题', gd: '高维或大规模数据通常更实用' },
  { aspect: '适用场景', ne: '特征维度较小的中小规模数据集', gd: '大规模、高维或在线学习场景' },
  { aspect: '数值稳定性', ne: 'XᵀX 可能不可逆或病态', gd: '对病态矩阵通常更鲁棒' },
];

/* ------------------------------------------------------------------ */
/*  main page                                                            */
/* ------------------------------------------------------------------ */
export default function NormalEquationPage() {
  const [pointCount, setPointCount] = useState(20);
  const [data, setData] = useState(() => generateData(20, Math.floor(Math.random() * 1000)));

  const X = useMemo(() => data.map((d) => [1, d.x]), [data]);
  const y = useMemo(() => data.map((d) => d.y), [data]);
  const theta = useMemo(() => solveNormalEquation(X, y), [X, y]);

  const regenerate = useCallback(() => {
    setData(generateData(pointCount, Math.floor(Math.random() * 100000)));
  }, [pointCount]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-deep-blue mb-6">正规方程</h1>
      <p className="text-med-gray mb-8 leading-relaxed">
        正规方程（Normal Equation）提供了一种直接求解线性回归参数的方法，无需迭代，
        通过构造并求解线性方程组得到闭式解。
      </p>

      {/* Section 1 — "One Step" vs "Step by Step" Analogy */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-700" />
            核心对比："一步登天" vs "步步为营"
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                <Footprints className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 梯度下降：步步为营
              </h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                像盲人走迷宫，一步一步试探方向。不知道终点在哪里，每步只看脚下的坡度，
                慢慢向低处移动。需要很多步才能接近答案，但走得起——即使迷宫很大。
              </p>
            </div>
            <div className="bg-white/80 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 正规方程：一步登天
              </h4>
              <p className="text-sm text-emerald-700 leading-relaxed">
                像解方程 x + 3 = 7，直接算出 x = 4。不需要猜测和迭代，
                直接求导等于零，得到闭式解。但如果方程太大（特征数超多），
                求解这个线性系统本身会很慢。
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/60 border border-emerald-200 rounded-lg p-3">
            <p className="text-sm text-emerald-800 leading-relaxed">
              <strong>类比：</strong>正规方程就像用公式直接算出答案（解方程），梯度下降就像用试错法慢慢逼近答案。
              对于简单问题，直接算更快；对于复杂问题，试错法更实用。
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Introduction */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">从梯度下降到直接求解</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          梯度下降通过反复迭代逐步逼近最优参数，而正规方程则直接求解。它的核心思想是：对代价函数 J(θ) 求梯度并令其为零，解出 θ 的解析表达式。
        </p>
        <p className="text-dark-gray leading-relaxed">
          正规方程适合特征维度较小、样本规模适中的问题。它需要构造 XᵀX 并求解线性系统，
          计算和存储成本会随特征维度快速上升。对于高维或大规模数据，梯度下降、随机梯度下降或其他迭代优化方法通常更实用。
        </p>
      </section>

      {/* Section 3 — The Normal Equation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">正规方程公式</h2>
        <FormulaCard
          title="闭式解"
          formula={<KaTeX math={String.raw`\theta = (X^T X)^{-1} X^T y`} display />}
          description={
            <>
              其中 X 是 m × (n+1) 的设计矩阵，第一列为{' '}
              <KaTeX math={String.raw`x_0^{(i)} = 1`} />（截距项），y 是 m × 1 的目标向量。
            </>
          }
        />
      </section>

      {/* Section 4 — Derivation sketch */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">推导过程</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          线性回归的代价函数为最小二乘误差。对其求梯度并令梯度等于零向量：
        </p>
        <div className="formula-block">
          <KaTeX math={String.raw`\nabla_{\theta} J(\theta) = X^T X\theta - X^T y = 0`} display />
        </div>
        <p className="text-dark-gray leading-relaxed mb-4">
          将上式移项整理，假设 XᵀX 可逆，可得：
        </p>
        <div className="formula-block">
          <KaTeX math={String.raw`X^T X \theta = X^T y \quad \Rightarrow \quad \theta = (X^T X)^{-1} X^T y`} display />
        </div>
        <p className="text-dark-gray leading-relaxed">
          这就是正规方程的核心结果。公式中写作 (XᵀX)⁻¹Xᵀy，但代码实现中更推荐使用稳定的线性方程组求解或矩阵分解（如 QR、SVD、Cholesky），
          而不是直接计算矩阵逆。
        </p>
      </section>

      {/* Section 5 — Matrix Perspective Intuition */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            矩阵视角的直觉：寻找最佳线性映射
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">X：所有数据的"简历表"</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  设计矩阵 X 的每一行是一个样本的"简历"——比如一套房子的面积、卧室数、地段等特征。
                  共 m 行（m 套房子），每行 n+1 列（n 个特征 + 1 个偏置项）。
                </p>
              </div>
              <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">y：所有真实答案</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  向量 y 包含每套房子的真实售价。我们的目标是找到一组参数 θ，
                  让 X 乘以 θ 后尽可能接近这些真实价格。
                </p>
              </div>
              <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">(XᵀX)⁻¹Xᵀ：闭式解</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  这个公式给出了当前训练数据上平方误差最小的线性预测关系。
                  它找到了一个最佳线性变换，把房屋特征映射到房价上。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>类比：</strong>想象你是一位资深房产评估师，看过成千上万套房子后，
                总结出了一条经验公式：<KaTeX math={String.raw`\text{房价} = \theta_0 + \theta_1 \times \text{面积} + \theta_2 \times \text{卧室数} + \dots`} />
                正规方程就是自动拟合这条公式的方法——把过去所有交易记录代入，
                直接求解在训练数据上平方误差最小的参数。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Comparison */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">与梯度下降的对比</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-gray rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">对比维度</th>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">正规方程</th>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">梯度下降</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.aspect} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-dark-gray border-b border-border-gray">{row.aspect}</td>
                  <td className="px-4 py-3 text-dark-gray border-b border-border-gray">{row.ne}</td>
                  <td className="px-4 py-3 text-dark-gray border-b border-border-gray">{row.gd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7 — When to Use Which Method */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-violet-700" />
            何时用哪种方法？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                <User className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 小特征数：正规方程通常更快
              </h4>
              <p className="text-sm text-emerald-700 leading-relaxed">
                就像短距离去便利店，走路比开车更快。构造 XᵀX 并求解线性系统的计算量在特征数少时完全可控，
                而且你不需要操心学习率调参，直接得到闭式解。
              </p>
            </div>
            <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 大特征数：梯度下降更实用
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                就像跨省旅行，开车比走路更实际。当特征数巨大时，构造 XᵀX 的 O(mn²) 成本和求解线性系统的 O(n³) 成本会快速上升，
                而批量梯度下降每次迭代只有 O(mn)，迭代多次往往更实用。
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/60 border border-violet-200 rounded-lg p-3">
            <p className="text-sm text-violet-800 leading-relaxed">
              <strong>经验法则：</strong>正规方程适合特征维度较小、样本规模适中的问题；
              当特征维度很高或样本量很大时，梯度下降、随机梯度下降或其他迭代方法通常更实用。
              具体选择还要结合实现效率、数值稳定性和内存限制。
            </p>
          </div>
        </div>
      </section>

      {/* Section 8 — Interactive Demo */}
      <section className="mb-10">
        <InteractiveDemo title="交互式演示：正规方程拟合">
          <InteractivePanel
            hint="生成随机二维数据点，自动通过正规方程计算 θ，并绘制拟合直线"
            chart={<NormalEquationChart points={data} theta={theta} />}
            controls={
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">数据点数量: {pointCount}</label>
                  <input
                    type="range"
                    aria-label="数据点数量"
                    min={5}
                    max={50}
                    value={pointCount}
                    onChange={(e) => setPointCount(Number(e.target.value))}
                    className="w-full accent-med-blue"
                  />
                </div>

                <button
                  onClick={regenerate}
                  className="w-full px-4 py-2 bg-med-blue text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
                >
                  重新生成数据
                </button>

                {theta && (
                  <div className="space-y-2 text-sm">
                    <p className="text-dark-gray font-medium">计算结果：</p>
                    <div className="bg-gray-50 border border-border-gray rounded-lg p-3 space-y-1">
                      <p className="text-dark-gray">
                        θ<sub>0</sub> = <span className="font-mono text-med-blue">{theta[0].toFixed(4)}</span>
                      </p>
                      <p className="text-dark-gray">
                        θ<sub>1</sub> = <span className="font-mono text-med-blue">{theta[1].toFixed(4)}</span>
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-blue-800 font-medium mb-1">拟合直线方程</p>
                      <p className="text-blue-700 font-mono">
                        y = {theta[0].toFixed(3)} + {theta[1].toFixed(3)}x
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-med-gray">
                  <p className="mb-1 font-medium">步骤说明：</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>构造设计矩阵 X（含全1列）</li>
                    <li>计算 XᵀX 与 Xᵀy</li>
                    <li>求解线性方程组 (XᵀX)θ = Xᵀy</li>
                    <li>得到最优参数 θ</li>
                  </ol>
                </div>
              </div>
            }
          />
        </InteractiveDemo>
      </section>

      {/* Design Matrix Note */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">设计矩阵 X</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          设计矩阵 X 的每一行对应一个训练样本，每一列对应一个特征。为了引入截距项 θ<sub>0</sub>，我们在 X 的第一列添加全为 1 的列：
        </p>
        <div className="formula-block">
          <KaTeX
            math={String.raw`X = \begin{bmatrix} 1 & x_1^{(1)} & \cdots & x_n^{(1)} \\ 1 & x_1^{(2)} & \cdots & x_n^{(2)} \\ \vdots & \vdots & \ddots & \vdots \\ 1 & x_1^{(m)} & \cdots & x_n^{(m)} \end{bmatrix}_{m \times (n+1)}`}
            display
          />
        </div>
        <p className="text-dark-gray leading-relaxed">
          这样全部训练样本的预测可以统一写成矩阵形式：{' '}
          <KaTeX math={String.raw`\hat y = X\theta`} />，其中 θ 是 (n+1) × 1 的参数向量；
          对单个样本仍写作 <KaTeX math={String.raw`h_\theta(x)=\theta^T x`} />。
        </p>
      </section>
    </div>
  );
}
