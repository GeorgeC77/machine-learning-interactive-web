import { useRef, useEffect, useState, useMemo } from 'react';
import { Brain, AlertTriangle, Lightbulb } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import InteractiveDemo from '@/components/InteractiveDemo';
import InteractivePanel from '@/components/InteractivePanel';
import { Button } from '@/components/ui/button';

/* ── Raw SVG perceptron demo ── */
interface DataPoint {
  x1: number;
  x2: number;
  y: number; // true label -1 or +1
}

const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };
const WIDTH = 520;
const HEIGHT = 420;
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const X_MIN = -1;
const X_MAX = 7;
const Y_MIN = -1;
const Y_MAX = 7;

function generateData(): DataPoint[] {
  const points: DataPoint[] = [];
  const seeds = [
    { x1: 0.5, x2: 2.5 }, { x1: 1.2, x2: 3.8 }, { x1: 2.0, x2: 4.5 },
    { x1: 2.8, x2: 5.2 }, { x1: 3.5, x2: 5.8 }, { x1: 4.5, x2: 6.2 },
    { x1: 1.0, x2: 0.5 }, { x1: 2.2, x2: 1.2 }, { x1: 3.0, x2: 1.8 },
    { x1: 4.0, x2: 2.5 }, { x1: 5.0, x2: 3.2 }, { x1: 5.8, x2: 4.0 },
  ];
  for (const s of seeds) {
    points.push({
      x1: s.x1 + (Math.random() - 0.5) * 0.6,
      x2: s.x2 + (Math.random() - 0.5) * 0.6,
      y: s.x2 > s.x1 + 0.5 ? 1 : -1,
    });
  }
  return points;
}

function xScale(x: number) {
  return ((x - X_MIN) / (X_MAX - X_MIN)) * INNER_W;
}

function yScale(y: number) {
  return INNER_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * INNER_H;
}

function drawPerceptronChart(
  svgEl: SVGSVGElement,
  data: DataPoint[],
  theta0: number,
  theta1: number,
  theta2: number,
  highlightIndex: number | null = null,
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${MARGIN.left},${MARGIN.top})`);
  svg.appendChild(g);

  for (let v = 0; v <= 6; v += 1) {
    const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineX.setAttribute('x1', String(xScale(v)));
    lineX.setAttribute('y1', String(0));
    lineX.setAttribute('x2', String(xScale(v)));
    lineX.setAttribute('y2', String(INNER_H));
    lineX.setAttribute('stroke', '#e5e7eb');
    lineX.setAttribute('stroke-dasharray', '3,3');
    g.appendChild(lineX);

    const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineY.setAttribute('x1', String(0));
    lineY.setAttribute('y1', String(yScale(v)));
    lineY.setAttribute('x2', String(INNER_W));
    lineY.setAttribute('y2', String(yScale(v)));
    lineY.setAttribute('stroke', '#e5e7eb');
    lineY.setAttribute('stroke-dasharray', '3,3');
    g.appendChild(lineY);
  }

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

  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', String(INNER_W / 2));
  xLabel.setAttribute('y', String(INNER_H + 38));
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '12');
  xLabel.setAttribute('fill', '#6b7280');
  xLabel.textContent = 'x₁';
  g.appendChild(xLabel);

  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', String(-40));
  yLabel.setAttribute('y', String(INNER_H / 2));
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '12');
  yLabel.setAttribute('fill', '#6b7280');
  yLabel.setAttribute('transform', `rotate(-90, -40, ${INNER_H / 2})`);
  yLabel.textContent = 'x₂';
  g.appendChild(yLabel);

  // 决策边界 θ0 + θ1·x1 + θ2·x2 = 0：把线段裁剪到绘图矩形内，而不是整条丢弃
  {
    const candidates: { x: number; y: number }[] = [];
    if (Math.abs(theta2) > 1e-6) {
      for (const x of [X_MIN, X_MAX]) {
        const y = -(theta0 + theta1 * x) / theta2;
        if (y >= Y_MIN - 1e-9 && y <= Y_MAX + 1e-9) candidates.push({ x, y });
      }
    }
    if (Math.abs(theta1) > 1e-6) {
      for (const y of [Y_MIN, Y_MAX]) {
        const x = -(theta0 + theta2 * y) / theta1;
        if (x >= X_MIN - 1e-9 && x <= X_MAX + 1e-9) candidates.push({ x, y });
      }
    }
    // 去重（角点可能被计算两次）
    const unique = candidates.filter(
      (p, i) => candidates.findIndex((q) => Math.abs(q.x - p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9) === i,
    );
    if (unique.length >= 2) {
      const boundary = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      boundary.setAttribute('x1', String(xScale(unique[0].x)));
      boundary.setAttribute('y1', String(yScale(unique[0].y)));
      boundary.setAttribute('x2', String(xScale(unique[1].x)));
      boundary.setAttribute('y2', String(yScale(unique[1].y)));
      boundary.setAttribute('stroke', '#7c3aed');
      boundary.setAttribute('stroke-width', '3');
      g.appendChild(boundary);
    }
  }

  data.forEach((point, idx) => {
    const cx = xScale(point.x1);
    const cy = yScale(point.x2);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(idx === highlightIndex ? '7' : '5'));
    circle.setAttribute('fill', point.y === 1 ? '#e25b5b' : '#3a7bd5');
    circle.setAttribute('stroke', idx === highlightIndex ? '#f59e0b' : '#fff');
    circle.setAttribute('stroke-width', String(idx === highlightIndex ? '3' : '2'));
    g.appendChild(circle);
  });
}

export default function PerceptronPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const data = useMemo(() => generateData(), []);
  const [theta0, setTheta0] = useState(-0.5);
  const [theta1, setTheta1] = useState(0.5);
  const [theta2, setTheta2] = useState(-0.8);
  const thetaRef = useRef<[number, number, number]>([-0.5, 0.5, -0.8]);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [converged, setConverged] = useState(false);

  useEffect(() => {
    if (svgRef.current) {
      drawPerceptronChart(svgRef.current, data, theta0, theta1, theta2, highlightIndex);
    }
  }, [data, theta0, theta1, theta2, highlightIndex]);

  useEffect(() => {
    if (!isRunning) return;
    let count = 0;
    let index = 0;

    const interval = setInterval(() => {
      const [currentTheta0, currentTheta1, currentTheta2] = thetaRef.current;
      // 先检查是否已全部分类正确；是则停止并提示收敛
      const allCorrect = data.every(
        (p) => (currentTheta0 + currentTheta1 * p.x1 + currentTheta2 * p.x2 >= 0 ? 1 : -1) === p.y,
      );
      if (allCorrect) {
        setIsRunning(false);
        setConverged(true);
        setHighlightIndex(null);
        clearInterval(interval);
        return;
      }

      if (count >= 200) {
        // 数据加抖动后理论上可能不可分；加一个安全上限，避免无限运行
        setIsRunning(false);
        setHighlightIndex(null);
        clearInterval(interval);
        return;
      }

      const point = data[index % data.length];
      const prediction = currentTheta0 + currentTheta1 * point.x1 + currentTheta2 * point.x2 >= 0 ? 1 : -1;
      setHighlightIndex(index % data.length);

      if (prediction !== point.y) {
        const nextTheta: [number, number, number] = [
          currentTheta0 + point.y,
          currentTheta1 + point.y * point.x1,
          currentTheta2 + point.y * point.x2,
        ];
        thetaRef.current = nextTheta;
        setTheta0(nextTheta[0]);
        setTheta1(nextTheta[1]);
        setTheta2(nextTheta[2]);
        count += 1;
        setStepCount((prev) => prev + 1);
      }

      index += 1;
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, data]);

  const handleReset = () => {
    setIsRunning(false);
    setTheta0(-0.5);
    setTheta1(0.5);
    setTheta2(-0.8);
    thetaRef.current = [-0.5, 0.5, -0.8];
    setStepCount(0);
    setHighlightIndex(null);
    setConverged(false);
  };

  const chartNode = <svg ref={svgRef} width={WIDTH} height={HEIGHT} className="w-full h-auto" />;

  const controlsNode = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          偏置 θ₀ = {theta0.toFixed(2)}
        </label>
        <input
          type="range"
          min="-4"
          max="4"
          step="0.1"
          value={theta0}
          aria-label="偏置 theta 0"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            thetaRef.current = [value, thetaRef.current[1], thetaRef.current[2]];
            setTheta0(value);
          }}
          disabled={isRunning}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          权重 θ₁ = {theta1.toFixed(2)}
        </label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          value={theta1}
          aria-label="权重 theta 1"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            thetaRef.current = [thetaRef.current[0], value, thetaRef.current[2]];
            setTheta1(value);
          }}
          disabled={isRunning}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          权重 θ₂ = {theta2.toFixed(2)}
        </label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          value={theta2}
          aria-label="权重 theta 2"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            thetaRef.current = [thetaRef.current[0], thetaRef.current[1], value];
            setTheta2(value);
          }}
          disabled={isRunning}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => {
            if (!isRunning) setConverged(false);
            setIsRunning(!isRunning);
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? '暂停' : '运行感知机算法'}
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          重置
        </Button>
      </div>
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p>已更新步数：<span className="font-semibold text-blue-700">{stepCount}</span></p>
        {converged && (
          <p className="mt-1 text-xs font-medium text-emerald-600">已收敛：所有样本分类正确。</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          红色点 = 正类 (+1)，蓝色点 = 负类 (-1)。紫色线为当前决策边界。
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <section className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <Brain className="w-12 h-12 text-blue-600" />
        </div>
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第二章 · 分类与逻辑回归
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          感知机学习算法
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          感知机是最简单的线性分类算法之一。它通过迭代调整决策边界，
          直到所有训练样本都被正确分类。本页将介绍感知机的假设、更新规则及其几何意义。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">感知机假设</h2>
        <p className="text-gray-700 mb-4">
          在二分类问题中，我们不再预测连续值，而是预测样本属于哪一个类别。感知机使用符号函数作为假设：
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <FormulaCard
            title="感知机假设函数"
            formula={
              <KaTeX
                math={String.raw`h_\theta(x) = g(\theta^T x) = \begin{cases} 1 & \text{if } \theta^T x \geq 0 \\ -1 & \text{if } \theta^T x < 0 \end{cases}`}
                display
              />
            }
            description="注意这里的 g 是符号函数（与本章其他页面的 sigmoid 记号不同）。直接根据 θᵀx 的符号输出类别，不使用概率。"
          />
          <FormulaCard
            title="决策边界"
            formula={
              <KaTeX
                math={String.raw`\theta^T x = \theta_0 + \theta_1 x_1 + \theta_2 x_2 = 0`}
                display
              />
            }
            description="一条直线（或超平面），将两类样本分开。"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">感知机更新规则</h2>
        <p className="text-gray-700 mb-4">
          感知机算法每次遇到一个分类错误的样本时，就更新参数 <KaTeX math={String.raw`\theta`} />，
          使决策边界向该样本方向移动。学习率 <KaTeX math={String.raw`\alpha`} /> 通常取 1。
        </p>
        <FormulaCard
          title="感知机更新规则"
          formula={
            <KaTeX
              math={String.raw`\theta := \theta + \alpha \, y \, x \quad (\text{仅当预测错误时})`}
              display
            />
          }
          description="预测正确时不更新。正类样本被错分则 θ 向 +x 方向调整，负类样本被错分则向 -x 方向调整。"
        />
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">直观理解</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            如果一个正类样本被错分为负类，说明它位于决策边界的"错误一侧"。
            更新规则会把边界向这个样本推近，直到它被正确分类。感知机算法会不断遍历训练集，
            直到所有样本都被正确分类（仅当数据线性可分时才能保证收敛）。
          </p>
        </div>
      </section>

      <InteractiveDemo title="感知机算法交互演示">
        <InteractivePanel
          chart={chartNode}
          controls={controlsNode}
          hint="调节 θ 手动观察决策边界变化，或点击「运行感知机算法」观看自动学习过程。"
        />
      </InteractiveDemo>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">感知机 vs 逻辑回归</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left text-gray-800">特性</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-gray-800">感知机</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-gray-800">逻辑回归</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-2 text-gray-700">输出</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">离散标签 -1 或 +1</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">概率 (0, 1)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-700">假设函数</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">符号函数</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">Sigmoid 函数</td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-2 text-gray-700">目标函数</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">无显式代价函数</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">对数似然 / 交叉熵</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-700">收敛保证</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">仅当数据线性可分时收敛</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-700">凸优化；有限最优解存在时保证收敛</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
