import { useRef, useEffect, useState, useMemo } from 'react';
import { TrendingDown, Target, Mountain, Map, MapPin, Ruler, BarChart3 } from 'lucide-react';
import KaTeX from '../components/KaTeX';
import FormulaCard from '../components/FormulaCard';

/* ── data gen ── */
interface DataPoint {
  x: number;
  y: number;
}

function generateData(): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 10;
    const noise = (Math.random() - 0.5) * 4;
    const y = 2 * x + 1 + noise;
    points.push({ x, y });
  }
  return points;
}

function computeOLS(data: DataPoint[]) {
  const m = data.length;
  const sumX = data.reduce((s, p) => s + p.x, 0);
  const sumY = data.reduce((s, p) => s + p.y, 0);
  const sumXX = data.reduce((s, p) => s + p.x * p.x, 0);
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0);

  const denom = m * sumXX - sumX * sumX;

  if (Math.abs(denom) < 1e-12) {
    return { theta0: 0, theta1: 0 };
  }

  const theta1 = (m * sumXY - sumX * sumY) / denom;
  const theta0 = (sumY - theta1 * sumX) / m;

  return { theta0, theta1 };
}

/* ── cost contour drawer ── */
function drawContour(
  svgEl: SVGSVGElement,
  data: DataPoint[],
  currentT0: number,
  currentT1: number,
  olsT0: number,
  olsT1: number,
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('font-family', 'Inter, sans-serif');

  const W = 500;
  const H = 400;
  const PAD = { top: 30, right: 30, bottom: 50, left: 55 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const t0Min = -4, t0Max = 6;
  const t1Min = -0.5, t1Max = 4.5;

  const toX = (t0: number) => PAD.left + ((t0 - t0Min) / (t0Max - t0Min)) * IW;
  const toY = (t1: number) => PAD.top + IH - ((t1 - t1Min) / (t1Max - t1Min)) * IH;

  const costAt = (t0: number, t1: number) => {
    let s = 0;
    data.forEach((d) => {
      const err = t0 + t1 * d.x - d.y;
      s += err * err;
    });
    return s / (2 * data.length);
  };

  // compute cost grid
  const GRID = 80;
  const gridVals: number[][] = [];
  for (let r = 0; r < GRID; r++) {
    gridVals[r] = [];
    for (let c = 0; c < GRID; c++) {
      const t0 = t0Min + (c / (GRID - 1)) * (t0Max - t0Min);
      const t1 = t1Min + ((GRID - 1 - r) / (GRID - 1)) * (t1Max - t1Min);
      gridVals[r][c] = costAt(t0, t1);
    }
  }

  // color bands
  const bands = [
    { lo: 0, hi: 0.5, color: '#eff6ff' },
    { lo: 0.5, hi: 1.0, color: '#dbeafe' },
    { lo: 1.0, hi: 2.0, color: '#bfdbfe' },
    { lo: 2.0, hi: 4.0, color: '#93c5fd' },
    { lo: 4.0, hi: 8.0, color: '#60a5fa' },
    { lo: 8.0, hi: 16.0, color: '#3b82f6' },
    { lo: 16.0, hi: 32.0, color: '#2563eb' },
    { lo: 32.0, hi: Infinity, color: '#1d4ed8' },
  ];

  const cellW = IW / (GRID - 1);
  const cellH = IH / (GRID - 1);

  // draw cells
  for (let r = 0; r < GRID - 1; r++) {
    for (let c = 0; c < GRID - 1; c++) {
      const j = gridVals[r][c];
      for (const band of bands) {
        if (j >= band.lo && j < band.hi) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(toX(t0Min + (c / (GRID - 1)) * (t0Max - t0Min)) - cellW / 2));
          rect.setAttribute('y', String(toY(t1Min + ((GRID - 1 - r) / (GRID - 1)) * (t1Max - t1Min)) - cellH / 2));
          rect.setAttribute('width', String(cellW + 1));
          rect.setAttribute('height', String(cellH + 1));
          rect.setAttribute('fill', band.color);
          svg.appendChild(rect);
          break;
        }
      }
    }
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

  // tick labels
  for (let t0 = t0Min; t0 <= t0Max; t0 += 2) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(toX(t0)));
    text.setAttribute('y', String(H - PAD.bottom + 18));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(t0);
    svg.appendChild(text);
  }

  for (let t1 = t1Min; t1 <= t1Max; t1 += 1) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(PAD.left - 8));
    text.setAttribute('y', String(toY(t1) + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(t1);
    svg.appendChild(text);
  }

  // axis titles
  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', String(W / 2));
  xTitle.setAttribute('y', String(H - 6));
  xTitle.setAttribute('text-anchor', 'middle');
  xTitle.setAttribute('font-size', '13');
  xTitle.setAttribute('font-weight', '600');
  xTitle.setAttribute('fill', '#374151');
  xTitle.textContent = 'θ0';
  svg.appendChild(xTitle);

  const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitle.setAttribute('x', String(14));
  yTitle.setAttribute('y', String(H / 2));
  yTitle.setAttribute('text-anchor', 'middle');
  yTitle.setAttribute('font-size', '13');
  yTitle.setAttribute('font-weight', '600');
  yTitle.setAttribute('fill', '#374151');
  yTitle.setAttribute('transform', `rotate(-90, 14, ${H / 2})`);
  yTitle.textContent = 'θ1';
  svg.appendChild(yTitle);

  // OLS minimum point for the current sample
  const minCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  minCircle.setAttribute('cx', String(toX(olsT0)));
  minCircle.setAttribute('cy', String(toY(olsT1)));
  minCircle.setAttribute('r', '7');
  minCircle.setAttribute('fill', '#10b981');
  minCircle.setAttribute('stroke', 'white');
  minCircle.setAttribute('stroke-width', '2.5');
  svg.appendChild(minCircle);

  const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  minLabel.setAttribute('x', String(toX(olsT0) + 12));
  minLabel.setAttribute('y', String(toY(olsT1) - 8));
  minLabel.setAttribute('font-size', '11');
  minLabel.setAttribute('font-weight', '600');
  minLabel.setAttribute('fill', '#059669');
  minLabel.textContent = `OLS θ̂ = (${olsT0.toFixed(2)}, ${olsT1.toFixed(2)})`;
  svg.appendChild(minLabel);

  // current point
  const curCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  curCircle.setAttribute('cx', String(toX(currentT0)));
  curCircle.setAttribute('cy', String(toY(currentT1)));
  curCircle.setAttribute('r', '7');
  curCircle.setAttribute('fill', '#ef4444');
  curCircle.setAttribute('stroke', 'white');
  curCircle.setAttribute('stroke-width', '2.5');
  svg.appendChild(curCircle);

  const curLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  curLabel.setAttribute('x', String(toX(currentT0) + 12));
  curLabel.setAttribute('y', String(toY(currentT1) + 18));
  curLabel.setAttribute('font-size', '11');
  curLabel.setAttribute('font-weight', '600');
  curLabel.setAttribute('fill', '#dc2626');
  curLabel.textContent = `当前 θ = (${currentT0.toFixed(1)}, ${currentT1.toFixed(1)})`;
  svg.appendChild(curLabel);

  // legend
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('transform', `translate(${W - 140}, ${PAD.top + 10})`);

  const legBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  legBg.setAttribute('width', '120');
  legBg.setAttribute('height', '60');
  legBg.setAttribute('rx', '6');
  legBg.setAttribute('fill', 'white');
  legBg.setAttribute('stroke', '#e5e7eb');
  legend.appendChild(legBg);

  const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  p1.setAttribute('cx', '18');
  p1.setAttribute('cy', '22');
  p1.setAttribute('r', '6');
  p1.setAttribute('fill', '#10b981');
  legend.appendChild(p1);

  const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t1.setAttribute('x', '30');
  t1.setAttribute('y', '26');
  t1.setAttribute('font-size', '10');
  t1.setAttribute('fill', '#374151');
  t1.textContent = 'OLS解';
  legend.appendChild(t1);

  const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  p2.setAttribute('cx', '18');
  p2.setAttribute('cy', '44');
  p2.setAttribute('r', '6');
  p2.setAttribute('fill', '#ef4444');
  legend.appendChild(p2);

  const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t2.setAttribute('x', '30');
  t2.setAttribute('y', '48');
  t2.setAttribute('font-size', '10');
  t2.setAttribute('fill', '#374151');
  t2.textContent = '当前位置';
  legend.appendChild(t2);

  svg.appendChild(legend);
}

/* ── residual plot drawer ── */
function drawResiduals(
  svgEl: SVGSVGElement,
  data: DataPoint[],
  theta0: number,
  theta1: number,
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const M = { top: 15, right: 15, bottom: 35, left: 45 };
  const W = 320;
  const H = 220;
  const IW = W - M.left - M.right;
  const IH = H - M.top - M.bottom;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const xMax = 10;
  const yMin = Math.min(-2, ...data.map((d) => d.y));
  const yMax = Math.max(22, ...data.map((d) => d.y));

  const xS = (x: number) => M.left + (x / xMax) * IW;
  const yS = (y: number) => M.top + IH - ((y - yMin) / (yMax - yMin)) * IH;

  // axes
  const xAx = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAx.setAttribute('x1', String(M.left));
  xAx.setAttribute('y1', String(H - M.bottom));
  xAx.setAttribute('x2', String(W - M.right));
  xAx.setAttribute('y2', String(H - M.bottom));
  xAx.setAttribute('stroke', '#374151');
  xAx.setAttribute('stroke-width', '1.5');
  svg.appendChild(xAx);

  const yAx = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAx.setAttribute('x1', String(M.left));
  yAx.setAttribute('y1', String(M.top));
  yAx.setAttribute('x2', String(M.left));
  yAx.setAttribute('y2', String(H - M.bottom));
  yAx.setAttribute('stroke', '#374151');
  yAx.setAttribute('stroke-width', '1.5');
  svg.appendChild(yAx);

  // predicted line
  const y0 = theta0 + theta1 * 0;
  const y10 = theta0 + theta1 * 10;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(xS(0)));
  line.setAttribute('y1', String(yS(y0)));
  line.setAttribute('x2', String(xS(10)));
  line.setAttribute('y2', String(yS(y10)));
  line.setAttribute('stroke', '#2563eb');
  line.setAttribute('stroke-width', '2.5');
  svg.appendChild(line);

  // residual lines + points
  data.forEach((d) => {
    const pred = theta0 + theta1 * d.x;
    const ptX = xS(d.x);
    const ptY = yS(d.y);
    const predY = yS(pred);

    // residual line
    const resLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    resLine.setAttribute('x1', String(ptX));
    resLine.setAttribute('y1', String(ptY));
    resLine.setAttribute('x2', String(ptX));
    resLine.setAttribute('y2', String(predY));
    resLine.setAttribute('stroke', '#ef4444');
    resLine.setAttribute('stroke-width', '1.5');
    resLine.setAttribute('stroke-dasharray', '3,2');
    resLine.setAttribute('opacity', '0.7');
    svg.appendChild(resLine);

    // point
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(ptX));
    circle.setAttribute('cy', String(ptY));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#3b82f6');
    circle.setAttribute('stroke', '#1d4ed8');
    circle.setAttribute('stroke-width', '1');
    svg.appendChild(circle);
  });

  // labels
  for (let i = 0; i <= 10; i += 2) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(xS(i)));
    text.setAttribute('y', String(H - M.bottom + 15));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '9');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(i);
    svg.appendChild(text);
  }

  // x label
  const xl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xl.setAttribute('x', String(W / 2));
  xl.setAttribute('y', String(H - 2));
  xl.setAttribute('text-anchor', 'middle');
  xl.setAttribute('font-size', '10');
  xl.setAttribute('fill', '#4b5563');
  xl.textContent = 'x';
  svg.appendChild(xl);
}

/* ── Page component ── */
export default function CostFunctionPage() {
  const [theta0, setTheta0] = useState(0);
  const [theta1, setTheta1] = useState(1);
  const contourRef = useRef<SVGSVGElement>(null);
  const residualRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => generateData(), []);
  const ols = useMemo(() => computeOLS(data), [data]);

  useEffect(() => {
    if (contourRef.current) {
      drawContour(contourRef.current, data, theta0, theta1, ols.theta0, ols.theta1);
    }
  }, [data, theta0, theta1, ols]);

  useEffect(() => {
    if (residualRef.current) {
      drawResiduals(residualRef.current, data, theta0, theta1);
    }
  }, [data, theta0, theta1]);

  const cost = () => {
    let s = 0;
    data.forEach((d) => {
      const err = theta0 + theta1 * d.x - d.y;
      s += err * err;
    });
    return s / (2 * data.length);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-3">
          <TrendingDown className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">代价函数</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          代价函数（Cost Function）用于衡量假设函数的预测值与真实值之间的差距。
          通过最小化代价函数，我们可以找到最优的模型参数。
        </p>
      </section>

      {/* Mean Squared Error */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">平方误差代价函数（Half-MSE）</h2>
        <p className="text-gray-700 mb-4">
          在线性回归中，最常用的代价函数是<strong>均方误差的一半</strong>（Half-MSE，也称平方误差代价）。对于一组参数 θ，
          代价函数定义为所有训练样本上预测误差的平方和的平均再乘以 1/2：
        </p>

        <FormulaCard
          title="代价函数定义"
          formula={
            <KaTeX
              math={"J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^{m} \\left( h_\\theta(x^{(i)}) - y^{(i)} \\right)^2"}
              display
            />
          }
          description={
            <span>
              其中 m 是样本数量，
              <KaTeX math={"h_\\theta(x^{(i)})"} /> 是第 i 个样本的预测值，
              <KaTeX math={"y^{(i)}"} /> 是第 i 个样本的真实值。
              这里的 J(θ) 是 MSE 的一半；加入 1/2 不会改变最优解，只是为了让求导后的系数更简洁。
            </span>
          }
        />

        {/* Cost Intuition Section */}
        <div className="mt-8 bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl border border-rose-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-rose-600" />
            <h3 className="text-lg font-bold text-rose-800">代价的直觉理解：预测误差</h3>
          </div>

          <p className="text-gray-700 mb-4">
            想象你是一位射箭运动员，每个数据点就是<strong>靶心</strong>（真实值），
            你的预测值就是射出的<strong>箭</strong>。代价函数就是衡量你射箭水平的&quot;总得分&quot;——
            箭离靶心越远，扣的分数越多。
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-lg p-4 border border-rose-200 text-center">
              <Target className="w-8 h-8 mx-auto text-rose-600 mb-2" />
              <span className="text-sm font-semibold text-rose-700 block mb-1">预测误差</span>
              <span className="text-xs text-gray-600">
                沿 y 轴方向的预测残差 ={" "}
                <KaTeX math={"h_\\theta(x^{(i)}) - y^{(i)}"} />
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 border border-rose-200 text-center">
              <Ruler className="w-8 h-8 mx-auto text-rose-600 mb-2" />
              <span className="text-sm font-semibold text-rose-700 block mb-1">平方和</span>
              <span className="text-xs text-gray-600">
                把所有误差的距离<strong>平方</strong>后加总
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 border border-rose-200 text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-rose-600 mb-2" />
              <span className="text-sm font-semibold text-rose-700 block mb-1">取平均并乘 1/2</span>
              <span className="text-xs text-gray-600">
                除以 {" "}
                <KaTeX math={"2m"} /> 得到 half-MSE 代价
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-rose-200">
              <h4 className="font-semibold text-rose-800 mb-2">为什么要用平方？</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">1.</span>
                  <span>
                    <strong>正负变正：</strong>如果预测比真实值高（正误差）或低（负误差），
                    平方后都变成正数，不会因为方向不同而互相抵消。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">2.</span>
                  <span>
                    <strong>放大严重错误：</strong>平方会让大的误差变得更大。偏离 10 的误差
                    比偏离 5 的误差严重 4 倍（而不是 2 倍），这样模型会更重视修正大错。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">3.</span>
                  <span>
                    <strong>数学上更好处理：</strong>平方函数处处可导，且求导后形式简洁。
                    用绝对值的话在 0 点不可导，优化起来更麻烦。
                  </span>
                </li>
              </ul>
            </div>

            {/* 1/2m intuition */}
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">
                <KaTeX math={"\\frac{1}{2m}"} /> 的含义
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="mb-1">
                    <strong>
                      <KaTeX math={"\\frac{1}{m}"} />：取平均
                    </strong>
                  </p>
                  <p>
                    除以样本数 m 让代价函数不依赖于数据集大小。
                    100 个样本和 1000 个样本的代价可以在同一尺度上比较。
                  </p>
                </div>
                <div>
                  <p className="mb-1">
                    <strong>
                      <KaTeX math={"\\frac{1}{2}"} />：数学便利
                    </strong>
                  </p>
                  <p>
                    求导时，平方项会产生因子 2，前面的 1/2 正好抵消。
                    就像给公式&quot;预留&quot;了一个位置，让最终结果更简洁优雅。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 rounded-lg border border-amber-200 p-4">
          <h3 className="font-semibold text-amber-800 mb-2">
            为什么用 <KaTeX math={"\\frac{1}{2m}"} /> 而不是 <KaTeX math={"\\frac{1}{m}"} />？
          </h3>
          <p className="text-gray-700 mb-2">
            系数 <KaTeX math={"\\frac{1}{2}"} /> 是一个数学上的便利选择。当我们对 J(θ) 求导时，
            平方项会产生一个因子 2：
          </p>
          <div className="formula-block">
            <KaTeX
              math={"\\frac{\\partial}{\\partial \\theta_j} \\left( h_\\theta(x^{(i)}) - y^{(i)} \\right)^2 = 2 \\left( h_\\theta(x^{(i)}) - y^{(i)} \\right) \\cdot x_j^{(i)}"}
              display
            />
          </div>
          <p className="text-gray-700 mt-2">
            前面的 <KaTeX math={"\\frac{1}{2}"} /> 正好与这个 2 抵消，使得梯度表达式更加简洁。
            这个选择不会影响最优解的位置，因为代价函数乘以一个正的常数不会改变其极值点。
          </p>
        </div>
      </section>

      {/* Residual Visualization */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">残差可视化</h2>
        <p className="text-gray-700 mb-4">
          从几何角度看，代价函数衡量的是预测值与真实值之间沿 y 轴方向的差异。
          每个样本的误差 <KaTeX math={"h_\\theta(x^{(i)}) - y^{(i)}"} /> 就是该样本的预测残差（prediction residual），
          也称预测误差。代价函数是所有残差平方的平均值再乘以 1/2（half-MSE）。
        </p>

        {/* Enhanced residual explanation */}
        <div className="mb-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 p-5">
          <h3 className="font-semibold text-red-800 mb-3">
            红色虚线的长度平方和就是代价
          </h3>
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="w-full md:w-1/2">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <svg
                  ref={residualRef}
                  className="w-full h-auto"
                  style={{ maxHeight: 260 }}
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              <p className="text-gray-700 text-sm">
                左侧图中，<strong style={{ color: '#2563eb' }}>蓝色实线</strong>是当前的预测直线，
                <strong style={{ color: '#3b82f6' }}>蓝色圆点</strong>是训练数据，
                <strong style={{ color: '#ef4444' }}>红色虚线</strong>是每个样本的预测残差（沿 y 轴方向的预测误差）。
              </p>
              <p className="text-gray-700 text-sm">
                代价函数 J(θ) 就是这些红色线段长度的<strong>平方和的平均值</strong>（乘以 1/2）。
                当直线完美穿过所有点时，所有残差为 0，代价 J(θ) = 0。
              </p>
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-1">代价 = 所有红色虚线² 的平均</p>
                <p className="text-xs text-gray-600">
                  J(θ) ={" "}
                  <KaTeX math={"\\frac{1}{2m} \\sum (\\text{红色虚线长度})^2"} />
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  当前假设: <KaTeX math={"h(x) = " + theta0.toFixed(1) + " + " + theta1.toFixed(1) + "x"} />
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  代价 J(θ) = <span className="font-mono font-bold">{cost().toFixed(3)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mt-4">
          调整下方&quot;参数控制&quot;面板中的滑块，观察红色虚线长度的变化——
          当这些残差线整体缩短时，代价 J(θ) 会减小。对于当前带噪声的数据，最优直线通常仍会保留非零残差；
          最小二乘的目标是让残差平方和最小，而不是要求每个残差都变成 0。
        </p>
      </section>

      {/* 3D Contour Visualization */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">代价函数的可视化：碗形曲面</h2>
        <p className="text-gray-700 mb-4">
          对于单变量线性回归，代价函数 <KaTeX math={"J(\\theta_0, \\theta_1)"} /> 是两个参数的函数，
          其图像是一个三维的&quot;碗形&quot;曲面（抛物面）。在二维平面上，我们用<strong>代价值热力图/色带图</strong>来表示这个曲面——
          颜色越深代表代价值越大。
        </p>
        <p className="text-gray-700 mb-4">
          热力图的中心附近颜色最浅，中心点（绿色点）就是当前样本上代价函数的<strong>最小值</strong>，对应最小二乘（OLS）参数。
          注意：真实生成参数是 (1, 2)，但当前样本的 OLS 解通常与它不同。
          在右侧控制面板中调整参数，观察红色点在热力图中的移动。
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Contour Plot */}
          <div className="w-full lg:w-[70%]">
            <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-hidden">
              <svg
                ref={contourRef}
                className="w-full h-auto"
                style={{ maxHeight: 420 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-[30%]">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
              <h3 className="font-semibold text-gray-800">参数控制</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <KaTeX math={"\\theta_0"} />（偏置）= <span className="text-blue-700 font-mono font-bold">{theta0.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  aria-label="参数 theta 0"
                  min="-4"
                  max="6"
                  step="0.1"
                  value={theta0}
                  onChange={(e) => setTheta0(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>-4</span>
                  <span>6</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <KaTeX math={"\\theta_1"} />（斜率）= <span className="text-blue-700 font-mono font-bold">{theta1.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  aria-label="参数 theta 1"
                  min="-0.5"
                  max="4.5"
                  step="0.1"
                  value={theta1}
                  onChange={(e) => setTheta1(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>-0.5</span>
                  <span>4.5</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold">
                  当前 J(θ) = <span className="font-mono">{cost().toFixed(3)}</span>
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
                <p>
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1 align-middle" />
                  绿色点：当前样本的 OLS 解 θ̂
                </p>
                <p>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />
                  红色点：当前选择的位置
                </p>
                <p>
                  <span className="inline-block w-3 h-3 rounded-sm bg-blue-600 mr-1 align-middle opacity-50" />
                  颜色越深，代价值越大
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Analogy */}
        <div className="mt-6 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border border-sky-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mountain className="w-6 h-6 text-sky-600" />
            <h3 className="text-lg font-bold text-sky-800">热力图的地理类比：寻找山谷最低点</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-lg p-4 border border-sky-200 text-center">
              <Mountain className="w-8 h-8 mx-auto text-sky-600 mb-2" />
              <span className="text-sm font-semibold text-sky-700 block mb-1">碗形曲面 = 山谷地形</span>
              <span className="text-xs text-gray-600">
                代价函数的图像就像一座碗状的山谷，四周高中间低
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 border border-sky-200 text-center">
              <Map className="w-8 h-8 mx-auto text-sky-600 mb-2" />
              <span className="text-sm font-semibold text-sky-700 block mb-1">颜色深浅 = 代价值大小</span>
              <span className="text-xs text-gray-600">
                热力图颜色越深，代价值越大，就像海拔越高
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 border border-sky-200 text-center">
              <MapPin className="w-8 h-8 mx-auto text-sky-600 mb-2" />
              <span className="text-sm font-semibold text-sky-700 block mb-1">中心点 = OLS解</span>
              <span className="text-xs text-gray-600">
                山谷最低处就是当前样本代价最小的地方，对应最小二乘参数
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-sky-200">
            <p className="text-gray-700 text-sm mb-3">
              <strong>爬山者的视角：</strong>想象你站在一座山上（当前参数位置，红色点），
              目标是走到山谷的最低点（最优参数，绿色点）。但你被蒙住了眼睛，只能感受到脚下的坡度——
              这就是<strong>梯度下降</strong>算法的处境！你只能一步一步地往最陡的下坡方向走，
              最终到达山谷底部。
            </p>
            <p className="text-gray-700 text-sm">
              在这个类比中，<strong>梯度</strong>就是山坡的坡度（指向上升最快的方向），
              而我们每次都往<strong>梯度的反方向</strong>走（下坡），所以叫&quot;梯度下降&quot;。
              热力图中颜色变化越快的地方，坡度越陡；颜色变化越慢的地方，坡度越缓。
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-2">重要性质</h3>
          <p className="text-gray-700 text-sm">
            线性回归的平方误差代价函数是一个<strong>凸函数</strong>（convex function）。
            若设计矩阵 X 满列秩，则它有唯一的全局最优解；若存在完全共线性，则可能存在多个全局最优解。
            因此，使用梯度下降等优化算法时，只要学习率选择得当，通常能收敛到全局最优解。
            这是线性回归相比更复杂模型的一个重要优势。
          </p>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">小结</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">1.</span>
            <p className="text-gray-700">
              代价函数 <KaTeX math={"J(\\theta)"} /> 衡量假设函数在训练数据上的拟合程度，
              值越小表示拟合越好。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">2.</span>
            <p className="text-gray-700">
              线性回归使用 half-MSE（均方误差的一半）作为代价函数，系数 1/2 仅为求导方便。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">3.</span>
            <p className="text-gray-700">
              平方误差代价函数是凸函数；若设计矩阵 X 满列秩，则有唯一全局最优解，可用梯度下降找到。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">4.</span>
            <p className="text-gray-700">
              目标是找到 <KaTeX math={"\\theta"} /> 使得{" "}
              <KaTeX math={"J(\\theta)"} /> 最小：{" "}
              <KaTeX math={"\\min_\\theta J(\\theta)"} />。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
