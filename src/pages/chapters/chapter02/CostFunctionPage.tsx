import { useEffect, useMemo, useRef, useState } from 'react';
import { TrendingDown, AlertTriangle, BarChart3, Target, Info, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

/* ── interactive chart: cost vs predicted probability ── */
function drawCostChart(
  svgEl: SVGSVGElement,
  p: number,
  y: 0 | 1,
  mode: 'log' | 'se',
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const W = 500;
  const H = 300;
  const PAD = { top: 25, right: 25, bottom: 55, left: 60 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const xMin = 0;
  const xMax = 1;
  const yMax = mode === 'log' ? 4 : 0.6;

  const toX = (val: number) => PAD.left + ((val - xMin) / (xMax - xMin)) * IW;
  const toY = (val: number) => PAD.top + IH - (val / yMax) * IH;

  const costAt = (prob: number) => {
    if (mode === 'log') {
      const eps = 1e-6;
      const safeP = Math.max(eps, Math.min(1 - eps, prob));
      return -y * Math.log(safeP) - (1 - y) * Math.log(1 - safeP);
    }
    return 0.5 * (prob - y) ** 2;
  };

  // grid lines
  for (let v = 0.2; v < yMax; v += (mode === 'log' ? 1 : 0.2)) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(PAD.left));
    line.setAttribute('y1', String(toY(v)));
    line.setAttribute('x2', String(W - PAD.right));
    line.setAttribute('y2', String(toY(v)));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', String(PAD.left));
  xAxis.setAttribute('y1', String(H - PAD.bottom));
  xAxis.setAttribute('x2', String(W - PAD.right));
  xAxis.setAttribute('y2', String(H - PAD.bottom));
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', String(PAD.left));
  yAxis.setAttribute('y1', String(PAD.top));
  yAxis.setAttribute('x2', String(PAD.left));
  yAxis.setAttribute('y2', String(H - PAD.bottom));
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);

  // x ticks
  for (let v = 0; v <= 1; v += 0.25) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(toX(v)));
    text.setAttribute('y', String(H - PAD.bottom + 18));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(v);
    svg.appendChild(text);
  }

  // y ticks
  for (let v = 0; v <= yMax + 1e-9; v += (mode === 'log' ? 1 : 0.2)) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(PAD.left - 8));
    text.setAttribute('y', String(toY(v) + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(Number(v.toFixed(1)));
    svg.appendChild(text);
  }

  // axis titles
  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', String(W / 2));
  xTitle.setAttribute('y', String(H - 10));
  xTitle.setAttribute('text-anchor', 'middle');
  xTitle.setAttribute('font-size', '12');
  xTitle.setAttribute('font-weight', '600');
  xTitle.setAttribute('fill', '#374151');
  xTitle.textContent = '预测概率 h_θ(x)';
  svg.appendChild(xTitle);

  const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitle.setAttribute('x', String(16));
  yTitle.setAttribute('y', String(H / 2));
  yTitle.setAttribute('text-anchor', 'middle');
  yTitle.setAttribute('font-size', '12');
  yTitle.setAttribute('font-weight', '600');
  yTitle.setAttribute('fill', '#374151');
  yTitle.setAttribute('transform', `rotate(-90, 16, ${H / 2})`);
  yTitle.textContent = mode === 'log' ? '对数损失' : '平方误差';
  svg.appendChild(yTitle);

  // curve
  const steps = 200;
  let d = '';
  let first = true;
  for (let i = 0; i <= steps; i++) {
    const prob = xMin + (i / steps) * (xMax - xMin);
    const c = costAt(prob);
    const clipped = Math.min(c, yMax);
    const x = toX(prob);
    const yPos = toY(clipped);
    if (c > yMax) {
      first = true;
      continue;
    }
    d += first ? `M ${x} ${yPos}` : ` L ${x} ${yPos}`;
    first = false;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', mode === 'log' ? '#2563eb' : '#ef4444');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  // current vertical line
  const curX = toX(p);
  const curCost = Math.min(costAt(p), yMax);
  const curY = toY(curCost);

  const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  vLine.setAttribute('x1', String(curX));
  vLine.setAttribute('y1', String(PAD.top));
  vLine.setAttribute('x2', String(curX));
  vLine.setAttribute('y2', String(curY));
  vLine.setAttribute('stroke', '#6b7280');
  vLine.setAttribute('stroke-width', '1.5');
  vLine.setAttribute('stroke-dasharray', '4,3');
  vLine.setAttribute('opacity', '0.7');
  svg.appendChild(vLine);

  // current point
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', String(curX));
  dot.setAttribute('cy', String(curY));
  dot.setAttribute('r', '6');
  dot.setAttribute('fill', mode === 'log' ? '#2563eb' : '#ef4444');
  dot.setAttribute('stroke', 'white');
  dot.setAttribute('stroke-width', '2');
  svg.appendChild(dot);

  // current label（靠近右缘时改到左侧并右对齐，避免超出画布）
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const labelRight = curX > W - PAD.right - 95;
  label.setAttribute('x', String(labelRight ? curX - 10 : curX + 10));
  label.setAttribute('y', String(curY - 10));
  if (labelRight) label.setAttribute('text-anchor', 'end');
  label.setAttribute('font-size', '11');
  label.setAttribute('font-weight', '600');
  label.setAttribute('fill', mode === 'log' ? '#1d4ed8' : '#dc2626');
  label.textContent = `p=${p.toFixed(2)}, J=${costAt(p).toFixed(2)}`;
  svg.appendChild(label);
}

/* ── Page component ── */
export default function CostFunctionPage() {
  const [p, setP] = useState(0.7);
  const [y, setY] = useState<0 | 1>(1);
  const logChartRef = useRef<SVGSVGElement>(null);
  const seChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (logChartRef.current) {
      drawCostChart(logChartRef.current, p, y, 'log');
    }
    if (seChartRef.current) {
      drawCostChart(seChartRef.current, p, y, 'se');
    }
  }, [p, y]);

  const logLoss = useMemo(() => {
    const eps = 1e-6;
    const safeP = Math.max(eps, Math.min(1 - eps, p));
    return -y * Math.log(safeP) - (1 - y) * Math.log(1 - safeP);
  }, [p, y]);

  const squaredError = useMemo(() => 0.5 * (p - y) ** 2, [p, y]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-3">
          <TrendingDown className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="text-sm font-medium text-emerald-600 mb-2 tracking-wide uppercase">
          第二章 · 分类与逻辑回归
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">代价函数</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          在逻辑回归中，代价函数用于衡量预测概率与真实标签之间的差异。
          当 logits 是输入的线性函数时，交叉熵负对数似然关于参数是凸函数；
          当有限最优解存在或加入适当正则化时，梯度下降可以收敛到全局最优解。
          需要注意：如果数据线性可分且没有正则化，最大似然估计可能没有有限的最优解。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Why not squared error */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么不用均方误差？</h2>
        <p className="text-gray-700 mb-4">
          线性回归的假设函数是线性的，当设计矩阵满列秩时，均方误差（MSE）代价函数是一个漂亮的<strong>凸函数</strong>，
          有唯一全局最小值。但逻辑回归的假设函数是 Sigmoid：
        </p>

        <FormulaCard
          title="逻辑回归假设函数"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = \frac{1}{1 + e^{-\theta^\top x}}`}
              display
            />
          }
          description="输出被压缩到 (0, 1) 区间，可以解释为样本属于正类的概率。"
        />

        <p className="text-gray-700 mt-4 mb-4">
          如果直接把 Sigmoid 代入均方误差，代价函数关于参数 <KaTeX math={String.raw`\theta`} /> 通常<strong>不再具有凸性保证</strong>。
          这意味着梯度下降可能遇到多个局部极小或鞍点，无法保证收敛到全局最优。
        </p>

        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl border border-rose-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <h3 className="text-lg font-bold text-rose-800">非凸性的直观图示</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="w-full md:w-1/2">
              <svg viewBox="0 0 520 180" className="w-full h-auto bg-white rounded-lg border border-gray-200">
                {/* convex log loss */}
                <path
                  d="M 60 120 Q 260 20 460 120"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* non-convex squared error landscape */}
                <path
                  d="M 60 120 C 140 120 160 40 230 80 C 300 120 340 140 460 60"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* axis */}
                <line x1="50" y1="150" x2="480" y2="150" stroke="#374151" strokeWidth="2" />
                <line x1="50" y1="150" x2="50" y2="20" stroke="#374151" strokeWidth="2" />
                {/* labels */}
                <text x="265" y="170" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="600">参数 θ</text>
                <text x="20" y="85" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="600" transform="rotate(-90, 20, 85)">J(θ)</text>
                <text x="200" y="155" fontSize="11" fill="#10b981" fontWeight="600">对数损失（凸）</text>
                <text x="340" y="55" fontSize="11" fill="#ef4444" fontWeight="600">均方误差 + Sigmoid（非凸）</text>
              </svg>
            </div>
            <div className="w-full md:w-1/2 space-y-3 text-sm text-gray-700">
              <p>
                <strong style={{ color: '#10b981' }}>绿色曲线</strong>代表对数损失：
                在线性 logits 假设下，它关于参数是凸函数。
              </p>
              <p>
                <strong style={{ color: '#ef4444' }}>红色曲线</strong>代表把 Sigmoid 套进均方误差后的代价：
                通常不再具有凸性保证，曲面可能出现起伏。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Log loss for one example */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">单个样本的代价：对数损失</h2>
        <p className="text-gray-700 mb-4">
          在线性 logits 假设下，为了让优化问题保持凸性，我们采用<strong>对数损失</strong>（Log Loss），
          也称为<strong>交叉熵损失</strong>（Cross-Entropy Loss）。
          对于单个训练样本，代价定义为：
        </p>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
          <strong>注意：</strong>如果数据线性可分且没有正则化，为了把正例概率推到 1，
          参数可以沿某个方向无限增大，此时最大似然估计可能没有有限的最优解。
          加入正则化或早停可以避免这种情况。
        </div>

        <FormulaCard
          title="单个样本的对数损失"
          formula={
            <KaTeX
              math={String.raw`\mathrm{Cost}(h_\theta(x), y) = -y \log(h_\theta(x)) - (1 - y) \log(1 - h_\theta(x))`}
              display
            />
          }
          description={
            <span>
              其中 <KaTeX math={String.raw`y \in \{0, 1\}`} /> 是真实标签，
              <KaTeX math={String.raw`h_\theta(x) \in (0, 1)`} /> 是预测概率。
            </span>
          }
        />

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-800 mb-2">当 y = 1 时</h4>
            <p className="text-gray-700 text-sm mb-2">
              代价简化为 <KaTeX math={String.raw`-\log(h_\theta(x))`} />。
            </p>
            <p className="text-gray-700 text-sm">
              预测概率越接近 1，代价越接近 0；预测概率越接近 0，代价急剧增大，
              惩罚模型“过于自信地犯错”。
            </p>
          </div>
          <div className="bg-rose-50 rounded-lg border border-rose-200 p-4">
            <h4 className="font-semibold text-rose-800 mb-2">当 y = 0 时</h4>
            <p className="text-gray-700 text-sm mb-2">
              代价简化为 <KaTeX math={String.raw`-\log(1 - h_\theta(x))`} />。
            </p>
            <p className="text-gray-700 text-sm">
              预测概率越接近 0，代价越接近 0；预测概率越接近 1，代价急剧增大，
              同样惩罚过于自信的错分。
            </p>
          </div>
        </div>
      </section>

      {/* Full cost function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">完整代价函数</h2>
        <p className="text-gray-700 mb-4">
          把所有 m 个训练样本的对数损失求平均，就得到逻辑回归的完整代价函数：
        </p>

        <FormulaCard
          title="逻辑回归代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \left[ y^{(i)} \log(h_\theta(x^{(i)})) + (1 - y^{(i)}) \log(1 - h_\theta(x^{(i)})) \right]`}
              display
            />
          }
          description="对所有样本的交叉熵求平均。最小化 J(θ) 等价于让模型预测的概率分布尽可能接近真实标签。"
        />

        <div className="mt-6 bg-amber-50 rounded-lg border border-amber-200 p-4">
          <h3 className="font-semibold text-amber-800 mb-2">为什么前面没有 1/2？</h3>
          <p className="text-gray-700 text-sm">
            线性回归的代价函数中常写 <KaTeX math={String.raw`\frac{1}{2m}`} />，
            那里的 <KaTeX math={String.raw`\frac{1}{2}`} /> 只是为了抵消平方求导后的因子 2。
            对数损失的导数本身没有额外的因子 2，所以逻辑回归里只需要 <KaTeX math={String.raw`\frac{1}{m}`} />。
          </p>
        </div>
      </section>

      {/* Interpretation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">直观解释：错得越狠，罚得越重</h2>
        <p className="text-gray-700 mb-4">
          对数损失有一个非常符合直觉的性质：当预测方向正确且信心满满时，代价几乎为 0；
          当预测方向错误且非常“自信”时，代价会趋向无穷大。
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-lg p-4 border border-emerald-200 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <span className="text-sm font-semibold text-emerald-700 block mb-1">正确且自信</span>
            <span className="text-xs text-gray-600">
              真实 <KaTeX math={String.raw`y=1`} />，预测 <KaTeX math={String.raw`h \approx 1`} />，
              代价 ≈ 0
            </span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200 text-center">
            <HelpCircle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
            <span className="text-sm font-semibold text-amber-700 block mb-1">不确定</span>
            <span className="text-xs text-gray-600">
              预测接近 0.5，无论标签是什么，代价都是中等大小
            </span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-rose-200 text-center">
            <XCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
            <span className="text-sm font-semibold text-rose-700 block mb-1">错误且自信</span>
            <span className="text-xs text-gray-600">
              真实 <KaTeX math={String.raw`y=1`} />，预测 <KaTeX math={String.raw`h \approx 0`} />，
              代价 → +∞
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border border-sky-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-6 h-6 text-sky-600" />
            <h3 className="text-lg font-bold text-sky-800">概率解释</h3>
          </div>
          <p className="text-gray-700 text-sm">
            从概率角度看，最小化对数损失等价于对训练数据进行<strong>最大似然估计</strong>（MLE）。
            我们假设标签服从以 <KaTeX math={String.raw`h_\theta(x)`} /> 为参数的伯努利分布，
            代价函数 <KaTeX math={String.raw`J(\theta)`} /> 就是负对数似然。最小化它，
            就是找到让训练数据出现概率最大的参数 <KaTeX math={String.raw`\theta`} />。
          </p>
        </div>
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互式演示：预测概率与代价</h2>
        <p className="text-gray-700 mb-4">
          调整下方的真实标签和预测概率，观察<strong>对数损失</strong>与<strong>平方误差</strong>曲线的形状差异。
          注意对数损失在“自信地犯错”时会急剧上升，而平方误差的惩罚始终有界。
        </p>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Controls */}
          <div className="w-full lg:w-[35%] bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              参数控制
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">真实标签 y</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setY(1)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    y === 1
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  y = 1
                </button>
                <button
                  type="button"
                  onClick={() => setY(0)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    y === 0
                      ? 'bg-rose-100 border-rose-400 text-rose-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  y = 0
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预测概率 h_θ(x) = <span className="text-blue-700 font-mono font-bold">{p.toFixed(2)}</span>
              </label>
              <input
                type="range"
                aria-label="预测概率"
                min="0.01"
                max="0.99"
                step="0.01"
                value={p}
                onChange={(e) => setP(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0.01</span>
                <span>0.99</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold mb-1">对数损失</p>
                <p className="text-2xl font-mono font-bold text-blue-700">{logLoss.toFixed(3)}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <p className="text-sm text-rose-800 font-semibold mb-1">平方误差（1/2 系数）</p>
                <p className="text-2xl font-mono font-bold text-rose-700">{squaredError.toFixed(3)}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="w-full lg:w-[65%] space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                对数损失曲线（y = {y}）
              </h3>
              <svg
                ref={logChartRef}
                className="w-full h-auto"
                style={{ maxHeight: 320 }}
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-600" />
                平方误差曲线（y = {y}）
              </h3>
              <svg
                ref={seChartRef}
                className="w-full h-auto"
                style={{ maxHeight: 320 }}
              />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
          <h3 className="font-semibold text-emerald-800 mb-2">关键观察</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">1.</span>
              <span>
                <strong>对数损失</strong>在预测正确时接近 0，在预测错误且接近 0 或 1 时迅速趋向无穷大，
                因此会强烈惩罚“过度自信的错误”。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">2.</span>
              <span>
                <strong>平方误差</strong>的惩罚最大只有 0.5，对错误预测的区分度不如对数损失；
                更重要的是，它与 Sigmoid 组合后可能导致非凸优化问题。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">3.</span>
              <span>
                因此，逻辑回归通常选择<strong>对数损失 / 交叉熵</strong>作为代价函数；
                在线性 logits 假设下，它关于参数是凸函数；当有限最优解存在或加入适当正则化时，梯度下降可以稳定收敛。
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">小结</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">1.</span>
            <p className="text-gray-700">
              逻辑回归通常不用线性回归的均方误差，因为把 Sigmoid 套进 MSE 后，
              代价函数关于参数通常<strong>不再具有凸性保证</strong>。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">2.</span>
            <p className="text-gray-700">
              单个样本的代价使用<strong>对数损失</strong>：
              <KaTeX math={String.raw`-y \log(h_\theta(x)) - (1-y) \log(1 - h_\theta(x))`} />。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">3.</span>
            <p className="text-gray-700">
              完整代价函数是所有样本对数损失的均值，等价于<strong>最大似然估计</strong>的负对数似然。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">4.</span>
            <p className="text-gray-700">
              对数损失对“自信的错误”惩罚极大，从而鼓励模型输出校准良好的概率；
              在线性 logits 假设下，<KaTeX math={String.raw`J(\theta)`} /> 关于参数是凸函数；
              当有限最优解存在或加入正则化时，梯度下降可以稳定收敛到全局最优解。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
