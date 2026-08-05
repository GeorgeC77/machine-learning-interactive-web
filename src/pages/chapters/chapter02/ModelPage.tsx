import { useRef, useEffect, useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, FunctionSquare, Activity, Brain } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import InteractiveDemo from '@/components/InteractiveDemo';
import InteractivePanel from '@/components/InteractivePanel';

/* ── Raw SVG logistic regression demo ── */
interface DataPoint {
  x: number;
  y: number; // true label 0 or 1
}

const MARGIN = { top: 20, right: 30, bottom: 45, left: 55 };
const WIDTH = 640;
const HEIGHT = 400;
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const X_MIN = -2;
const X_MAX = 12;
const Y_MIN = -0.08;
const Y_MAX = 1.08;

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

function generateData(): DataPoint[] {
  // 使用固定种子，保证每次打开页面看到同一批数据，便于复现
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const points: DataPoint[] = [];
  // 20 points: class 1 when x > 5 (with a little overlap)
  for (let i = 0; i < 20; i++) {
    const x = rand() * 10; // 0 ~ 10
    const noise = (rand() - 0.5) * 1.5;
    const y = x + noise > 5 ? 1 : 0;
    points.push({ x, y });
  }
  return points;
}

function xScale(x: number) {
  return ((x - X_MIN) / (X_MAX - X_MIN)) * INNER_W;
}

function yScale(y: number) {
  return INNER_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * INNER_H;
}

function drawLogisticChart(
  svgEl: SVGSVGElement,
  data: DataPoint[],
  theta0: number,
  theta1: number,
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  svg.appendChild(g);

  // grid lines
  const xGrid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let x = 0; x <= 10; x += 2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(xScale(x)));
    line.setAttribute('y1', String(0));
    line.setAttribute('x2', String(xScale(x)));
    line.setAttribute('y2', String(INNER_H));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-dasharray', '3,3');
    xGrid.appendChild(line);
  }
  g.appendChild(xGrid);

  const yGrid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let y = 0; y <= 1; y += 0.25) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(0));
    line.setAttribute('y1', String(yScale(y)));
    line.setAttribute('x2', String(INNER_W));
    line.setAttribute('y2', String(yScale(y)));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-dasharray', '3,3');
    yGrid.appendChild(line);
  }
  g.appendChild(yGrid);

  // axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', String(0));
  xAxis.setAttribute('y1', String(INNER_H));
  xAxis.setAttribute('x2', String(INNER_W));
  xAxis.setAttribute('y2', String(INNER_H));
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '1.5');
  g.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', String(0));
  yAxis.setAttribute('y1', String(0));
  yAxis.setAttribute('x2', String(0));
  yAxis.setAttribute('y2', String(INNER_H));
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '1.5');
  g.appendChild(yAxis);

  // x labels
  for (let x = 0; x <= 10; x += 2) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(xScale(x)));
    text.setAttribute('y', String(INNER_H + 18));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(x);
    g.appendChild(text);
  }

  // y labels
  for (let y = 0; y <= 1; y += 0.25) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(-8));
    text.setAttribute('y', String(yScale(y) + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = y.toFixed(2);
    g.appendChild(text);
  }

  // axis titles
  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', String(INNER_W / 2));
  xTitle.setAttribute('y', String(INNER_H + 38));
  xTitle.setAttribute('text-anchor', 'middle');
  xTitle.setAttribute('font-size', '12');
  xTitle.setAttribute('fill', '#374151');
  xTitle.textContent = 'x';
  g.appendChild(xTitle);

  const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitle.setAttribute('x', String(-36));
  yTitle.setAttribute('y', String(INNER_H / 2));
  yTitle.setAttribute('text-anchor', 'middle');
  yTitle.setAttribute('font-size', '12');
  yTitle.setAttribute('fill', '#374151');
  yTitle.setAttribute('transform', `rotate(-90, -36, ${INNER_H / 2})`);
  yTitle.textContent = 'h_θ(x)';
  g.appendChild(yTitle);

  // decision boundary
  const boundary = theta1 !== 0 ? -theta0 / theta1 : null;
  if (boundary !== null && boundary >= X_MIN && boundary <= X_MAX) {
    const bx = xScale(boundary);

    // shaded regions (account for sign of θ₁)
    const predictOneLeft = theta1 < 0;
    const leftColor = predictOneLeft ? '#86efac' : '#fca5a5';
    const rightColor = predictOneLeft ? '#fca5a5' : '#86efac';

    const leftRegion = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    leftRegion.setAttribute('x', String(xScale(X_MIN)));
    leftRegion.setAttribute('y', String(0));
    leftRegion.setAttribute('width', String(bx - xScale(X_MIN)));
    leftRegion.setAttribute('height', String(INNER_H));
    leftRegion.setAttribute('fill', leftColor);
    leftRegion.setAttribute('opacity', '0.12');
    g.appendChild(leftRegion);

    const rightRegion = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rightRegion.setAttribute('x', String(bx));
    rightRegion.setAttribute('y', String(0));
    rightRegion.setAttribute('width', String(xScale(X_MAX) - bx));
    rightRegion.setAttribute('height', String(INNER_H));
    rightRegion.setAttribute('fill', rightColor);
    rightRegion.setAttribute('opacity', '0.12');
    g.appendChild(rightRegion);

    // boundary line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(bx));
    line.setAttribute('y1', String(0));
    line.setAttribute('x2', String(bx));
    line.setAttribute('y2', String(INNER_H));
    line.setAttribute('stroke', '#6b7280');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '6,4');
    g.appendChild(line);

    // boundary label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(bx));
    label.setAttribute('y', String(-6));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#4b5563');
    label.textContent = `边界 x=${boundary.toFixed(1)}`;
    g.appendChild(label);
  }

  // sigmoid curve path
  const steps = 200;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
    const z = theta0 + theta1 * x;
    const h = sigmoid(z);
    const sx = xScale(x);
    const sy = yScale(h);
    d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#2563eb');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  g.appendChild(path);

  // threshold line at 0.5
  const halfLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  halfLine.setAttribute('x1', String(0));
  halfLine.setAttribute('y1', String(yScale(0.5)));
  halfLine.setAttribute('x2', String(INNER_W));
  halfLine.setAttribute('y2', String(yScale(0.5)));
  halfLine.setAttribute('stroke', '#9ca3af');
  halfLine.setAttribute('stroke-width', '1');
  halfLine.setAttribute('stroke-dasharray', '4,4');
  g.appendChild(halfLine);

  // data points
  data.forEach((pt) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(xScale(pt.x)));
    circle.setAttribute('cy', String(yScale(pt.y)));
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', pt.y === 1 ? '#10b981' : '#ef4444');
    circle.setAttribute('stroke', pt.y === 1 ? '#047857' : '#b91c1c');
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('opacity', '0.85');
    g.appendChild(circle);
  });

  // legend
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('transform', `translate(10, 10)`);

  const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  legendBg.setAttribute('width', '150');
  legendBg.setAttribute('height', '70');
  legendBg.setAttribute('rx', '6');
  legendBg.setAttribute('fill', 'white');
  legendBg.setAttribute('stroke', '#e5e7eb');
  legend.appendChild(legendBg);

  const sigLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  sigLine.setAttribute('x1', '10');
  sigLine.setAttribute('y1', '18');
  sigLine.setAttribute('x2', '30');
  sigLine.setAttribute('y2', '18');
  sigLine.setAttribute('stroke', '#2563eb');
  sigLine.setAttribute('stroke-width', '3');
  legend.appendChild(sigLine);

  const sigText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sigText.setAttribute('x', '36');
  sigText.setAttribute('y', '22');
  sigText.setAttribute('font-size', '10');
  sigText.setAttribute('fill', '#374151');
  sigText.textContent = 'h_θ(x) = g(θᵀx)';
  legend.appendChild(sigText);

  const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c1.setAttribute('cx', '20');
  c1.setAttribute('cy', '38');
  c1.setAttribute('r', '4');
  c1.setAttribute('fill', '#10b981');
  legend.appendChild(c1);

  const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t1.setAttribute('x', '36');
  t1.setAttribute('y', '42');
  t1.setAttribute('font-size', '10');
  t1.setAttribute('fill', '#374151');
  t1.textContent = 'y = 1';
  legend.appendChild(t1);

  const c0 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c0.setAttribute('cx', '20');
  c0.setAttribute('cy', '56');
  c0.setAttribute('r', '4');
  c0.setAttribute('fill', '#ef4444');
  legend.appendChild(c0);

  const t0 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t0.setAttribute('x', '36');
  t0.setAttribute('y', '60');
  t0.setAttribute('font-size', '10');
  t0.setAttribute('fill', '#374151');
  t0.textContent = 'y = 0';
  legend.appendChild(t0);

  g.appendChild(legend);
}

/* ── Page component ── */
export default function ModelPage() {
  const [theta0, setTheta0] = useState(-5);
  const [theta1, setTheta1] = useState(1);
  const chartRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => generateData(), []);

  useEffect(() => {
    if (chartRef.current) {
      drawLogisticChart(chartRef.current, data, theta0, theta1);
    }
  }, [data, theta0, theta1]);

  const boundary = theta1 !== 0 ? -theta0 / theta1 : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第二章 · 分类与逻辑回归
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">模型表示</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          逻辑回归虽然名字里带着"回归"，但它实际上是一种分类算法。我们通过 Sigmoid 函数
          把线性组合 θᵀx 映射到 (0, 1) 区间，从而得到样本属于正类的概率。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Classification Problem */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">分类问题</h2>
        <p className="text-gray-700 mb-4">
          在分类问题中，输出变量（标签）y 只能取有限的离散值。对于二分类问题，我们通常把两个类别记为 0 和 1：
        </p>

        <FormulaCard
          title="二分类标签"
          formula={<KaTeX math={String.raw`y \in \{0, 1\}`} display />}
          description="y = 1 表示正类（例如：通过考试、患病、是垃圾邮件），y = 0 表示负类。"
        />

        <div className="mt-4 space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-800">回归 vs 分类</strong>
            <span className="text-gray-700 ml-2">
              线性回归预测连续值（如房价），而分类算法预测离散类别（如邮件是否为垃圾邮件）。
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <strong className="text-gray-800">概率视角</strong>
            <span className="text-gray-700 ml-2">
              我们希望模型输出的是一个概率：给定输入 x，样本属于正类的可能性有多大。
            </span>
          </div>
        </div>
      </section>

      {/* Why Linear Regression Doesn't Fit */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么线性回归不适合分类？</h2>
        <p className="text-gray-700 mb-4">
          直觉上，我们可以直接用线性回归拟合 0/1 标签，然后设定一个阈值（例如 0.5）来判断类别。但这样做会遇到几个问题：
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h3 className="font-bold text-red-800 mb-2">输出范围不受限</h3>
            <p className="text-gray-700 text-sm">
              线性回归的假设 <KaTeX math={String.raw`h_\theta(x) = \theta^T x`} /> 可以取任意实数值，
              而概率必须在 0 到 1 之间。
            </p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h3 className="font-bold text-red-800 mb-2">对异常值敏感</h3>
            <p className="text-gray-700 text-sm">
              一个远离分类边界的样本会显著拉动拟合直线，导致阈值 0.5 处的决策边界发生偏移。
            </p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h3 className="font-bold text-red-800 mb-2">概率解释缺失</h3>
            <p className="text-gray-700 text-sm">
              线性回归最小化的是平方误差，它并不直接优化"预测正确的概率"。
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700 text-sm">
            <strong>核心问题：</strong>我们需要一个函数，能把任意实数输入"压缩"到 (0, 1) 区间，
            并且具有良好的概率解释。这就是 Sigmoid 函数的作用。
          </p>
        </div>
      </section>

      {/* Sigmoid Function */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FunctionSquare className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sigmoid / Logistic 函数</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Sigmoid 函数（又称 Logistic 函数）能把任意实数 z 映射到 0 和 1 之间，形状像字母"S"：
        </p>

        <FormulaCard
          title="Sigmoid 函数"
          formula={
            <KaTeX
              math={String.raw`g(z) = \frac{1}{1 + e^{-z}}`}
              display
            />
          }
          description="当 z → +∞ 时 g(z) → 1，当 z → -∞ 时 g(z) → 0，g(0) = 0.5。"
        />

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2">重要性质</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <KaTeX math={String.raw`0 < g(z) < 1`} />，输出可解释为概率。
              </li>
              <li>
                <KaTeX math={String.raw`g(0) = 0.5`} />，是分类的天然阈值。
              </li>
              <li>
                <KaTeX math={String.raw`g'(z) = g(z)(1 - g(z))`} />，导数形式简洁，便于梯度下降。
              </li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2">函数图像</h3>
            <p className="text-sm text-gray-700">
              Sigmoid 曲线在原点附近最陡峭，远离原点时逐渐趋于 0 或 1。输入 z 越大，
              模型对正类的信心越足；输入 z 越小，越倾向于负类。
            </p>
          </div>
        </div>
      </section>

      {/* Hypothesis for Logistic Regression */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">逻辑回归的假设函数</h2>
        <p className="text-gray-700 mb-4">
          在线性回归中，我们用 <KaTeX math={String.raw`\theta^T x`} /> 直接作为预测值。在逻辑回归中，
          我们把它作为 Sigmoid 函数的输入：
        </p>

        <FormulaCard
          title="逻辑回归假设"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = g(\theta^T x) = \frac{1}{1 + e^{-\theta^T x}}`}
              display
            />
          }
          description="其中 θ 是参数向量，x 是特征向量（包含 x₀ = 1）。"
        />

        <p className="text-gray-700 mt-4 mb-4">
          这里 <KaTeX math={String.raw`z = \theta^T x`} /> 仍然是一个线性组合，但经过 Sigmoid 变换后，
          输出始终落在 (0, 1) 之间。参数 θ 控制了 Sigmoid 曲线的"位置"和"陡峭程度"，
          从而决定了分类的决策边界。
        </p>
      </section>

      {/* Probabilistic Interpretation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">概率解释</h2>
        </div>
        <p className="text-gray-700 mb-4">
          逻辑回归的输出有自然的概率含义。我们可以把 <KaTeX math={String.raw`h_\theta(x)`} /> 理解为：
          给定输入 x 和参数 θ，样本属于正类的概率。
        </p>

        <FormulaCard
          title="正类概率"
          formula={
            <KaTeX
              math={String.raw`h_\theta(x) = P(y = 1 \mid x; \theta)`}
              display
            />
          }
          description="模型认为当前样本是 y = 1 的置信度。"
        />

        <FormulaCard
          title="负类概率"
          formula={
            <KaTeX
              math={String.raw`P(y = 0 \mid x; \theta) = 1 - h_\theta(x)`}
              display
            />
          }
          description="由于只有两类，两个概率之和为 1。"
        />

        <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
          <p className="text-gray-700 text-sm">
            <strong>例子：</strong>如果模型预测 <KaTeX math={String.raw`h_\theta(x) = 0.85`} />，
            说明它有 85% 的把握认为该样本属于正类。我们通常会设定阈值 0.5，
            当概率 ≥ 0.5 时预测为正类。
          </p>
        </div>
      </section>

      {/* Decision Boundary */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">决策边界</h2>
        <p className="text-gray-700 mb-4">
          当我们用 0.5 作为阈值时，预测规则是：
        </p>

        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <KaTeX
            math={String.raw`\hat{y} = \begin{cases} 1, & \text{if } h_\theta(x) \geq 0.5 \\ 0, & \text{if } h_\theta(x) < 0.5 \end{cases}`}
            display
          />
        </div>

        <p className="text-gray-700 mb-4">
          由于 Sigmoid 函数是单调递增的，<KaTeX math={String.raw`h_\theta(x) \geq 0.5`} /> 等价于
          <KaTeX math={String.raw`\theta^T x \geq 0`} />。因此，决策边界由下面的等式决定：
        </p>

        <FormulaCard
          title="决策边界"
          formula={<KaTeX math={String.raw`\theta^T x = 0`} display />}
          description="决策边界是一个超平面，将特征空间分成两个区域：一侧预测 y = 1，另一侧预测 y = 0。"
        />

        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-2">一维情形的直观理解</h3>
          <p className="text-gray-700 text-sm">
            当只有一个特征时，<KaTeX math={String.raw`\theta^T x = \theta_0 + \theta_1 x`} />，
            决策边界是数轴上的一个点：
          </p>
          <div className="my-2">
            <KaTeX math={String.raw`x = -\frac{\theta_0}{\theta_1}`} display />
          </div>
          <p className="text-gray-700 text-sm">
            改变 <KaTeX math={String.raw`\theta_0`} /> 会平移边界位置，改变 <KaTeX math={String.raw`\theta_1`} /> 的绝对值会改变 Sigmoid 曲线在边界附近的陡峭程度。
          </p>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveDemo title="交互演示：Sigmoid 曲线与决策边界">
        <p className="text-gray-700 mb-4">
          下方的训练数据是围绕真实边界 x = 5 生成的二分类样本。红色点表示 y = 0，绿色点表示 y = 1。
          拖动滑块调整 <KaTeX math={String.raw`\theta_0`} /> 和 <KaTeX math={String.raw`\theta_1`} />，
          观察蓝色 Sigmoid 曲线和灰色虚线决策边界如何变化。
        </p>

        <InteractivePanel
          hint="提示：当 θᵀx ≥ 0 时预测 y = 1；决策边界出现在 θ₀ + θ₁x = 0 处。"
          chart={
            <svg
              ref={chartRef}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full h-auto"
              style={{ maxHeight: 420 }}
            />
          }
          controls={
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  偏置项 <KaTeX math={String.raw`\theta_0`} /> = <span className="text-blue-700 font-mono">{theta0.toFixed(1)}</span>
                </label>
                <Slider
                  value={[theta0]}
                  onValueChange={(v) => setTheta0(v[0])}
                  min={-10}
                  max={5}
                  step={0.1}
                />
                <p className="text-xs text-gray-500 mt-1">平移决策边界的位置</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  权重 <KaTeX math={String.raw`\theta_1`} /> = <span className="text-blue-700 font-mono">{theta1.toFixed(1)}</span>
                </label>
                <Slider
                  value={[theta1]}
                  onValueChange={(v) => setTheta1(v[0])}
                  min={-2}
                  max={3}
                  step={0.1}
                />
                <p className="text-xs text-gray-500 mt-1">控制 Sigmoid 曲线在边界处的陡峭程度</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold">
                  当前假设:{' '}
                  <KaTeX math={`h(x) = g(${theta0.toFixed(1)} ${theta1 >= 0 ? '+' : '-'} ${Math.abs(theta1).toFixed(1)}x)`} />
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  决策边界:{' '}
                  <span className="font-mono font-semibold text-gray-800">
                    {boundary !== null ? `x = ${boundary.toFixed(2)}` : '不存在（θ₁ = 0）'}
                  </span>
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <Activity className="w-4 h-4 inline-block mr-1" />
                  {boundary !== null ? (
                    theta1 > 0 ? (
                      <>预测规则：当 x ≥ {boundary.toFixed(2)} 时，预测 y = 1。</>
                    ) : (
                      <>预测规则：当 x ≤ {boundary.toFixed(2)} 时，预测 y = 1。</>
                    )
                  ) : (
                    <>决策边界不存在（θ₁ = 0）。</>
                  )}
                </p>
              </div>
            </div>
          }
        />
      </InteractiveDemo>
    </div>
  );
}
