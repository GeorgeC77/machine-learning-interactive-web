import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { AlertTriangle, Circle, Mountain, Sparkles, Map, Play, Pause, RotateCcw } from 'lucide-react';
import KaTeX from '@/components/KaTeX';

// ─── 2D Logistic Regression Dataset ────────────────────────────────────
type DataPoint = { x1: number; x2: number; y: number };

const DATA: DataPoint[] = [
  { x1: 0.8, x2: 1.0, y: 0 },
  { x1: 1.0, x2: 0.9, y: 0 },
  { x1: 1.2, x2: 1.2, y: 0 },
  { x1: 0.9, x2: 1.3, y: 0 },
  { x1: 1.1, x2: 0.8, y: 0 },
  { x1: 1.3, x2: 1.1, y: 0 },
  { x1: 0.7, x2: 0.7, y: 0 },
  { x1: 1.5, x2: 0.6, y: 0 },
  { x1: 0.6, x2: 1.4, y: 0 },
  { x1: 1.4, x2: 1.5, y: 0 },
  { x1: 2.5, x2: 2.6, y: 1 },
  { x1: 2.8, x2: 2.4, y: 1 },
  { x1: 3.0, x2: 3.0, y: 1 },
  { x1: 2.4, x2: 2.8, y: 1 },
  { x1: 2.7, x2: 3.2, y: 1 },
  { x1: 3.2, x2: 2.5, y: 1 },
  { x1: 2.2, x2: 2.3, y: 1 },
  { x1: 3.1, x2: 3.3, y: 1 },
  { x1: 2.6, x2: 2.1, y: 1 },
  { x1: 2.9, x2: 2.9, y: 1 },
];

const M = DATA.length;

// ─── Sigmoid & Cost / Gradient Helpers ─────────────────────────────────
function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

function hypothesis(theta: number[], x1: number, x2: number): number {
  const z = theta[0] + theta[1] * x1 + theta[2] * x2;
  return sigmoid(z);
}

function computeCost(theta: number[]): number {
  let total = 0;
  for (let i = 0; i < M; i++) {
    const d = DATA[i];
    const h = hypothesis(theta, d.x1, d.x2);
    const safeH = Math.max(1e-15, Math.min(1 - 1e-15, h));
    total += d.y === 1 ? -Math.log(safeH) : -Math.log(1 - safeH);
  }
  return total / M;
}

function computeGradients(theta: number[]): [number, number, number] {
  let g0 = 0;
  let g1 = 0;
  let g2 = 0;
  for (let i = 0; i < M; i++) {
    const d = DATA[i];
    const h = hypothesis(theta, d.x1, d.x2);
    const err = h - d.y;
    g0 += err;
    g1 += err * d.x1;
    g2 += err * d.x2;
  }
  return [g0 / M, g1 / M, g2 / M];
}

// ─── Seeded Shuffle (for SGD demo) ─────────────────────────────────────
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], rand: () => number): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Presets ───────────────────────────────────────────────────────────
type Preset = {
  label: string;
  desc: string;
  mode: 'batch' | 'sgd';
  alpha: number;
  beta: number;
  steps: number;
  behavior: string;
  color: string;
};

const PRESETS: Preset[] = [
  {
    label: 'α = 0.2',
    desc: '批量适中',
    mode: 'batch',
    alpha: 0.2,
    beta: 0.92,
    steps: 100,
    behavior: '批量梯度下降配合动量，稳步收敛，决策边界平滑移向最优分类面',
    color: '#00b4a6',
  },
  {
    label: 'α = 0.01',
    desc: '批量过小',
    mode: 'batch',
    alpha: 0.01,
    beta: 0.92,
    steps: 100,
    behavior: '学习率过小，参数更新极慢，100 步后仍远离最优解',
    color: '#f08a5d',
  },
  {
    label: 'SGD α = 0.02',
    desc: '随机梯度',
    mode: 'sgd',
    alpha: 0.02,
    beta: 0,
    steps: 80,
    behavior: '每次只用一个样本更新，边界在正确方向附近震荡、带噪声，但总体仍向最优解靠近',
    color: '#e25b5b',
  },
];

// ─── Gradient Descent Runner ───────────────────────────────────────────
type GdStep = { theta: [number, number, number]; cost: number };

function runGD(preset: Preset, theta0: [number, number, number] = [0, 0, 0]): GdStep[] {
  const history: GdStep[] = [{ theta: [theta0[0], theta0[1], theta0[2]], cost: computeCost(theta0) }];
  const theta: [number, number, number] = [theta0[0], theta0[1], theta0[2]];
  const velocity: [number, number, number] = [0, 0, 0];

  if (preset.mode === 'batch') {
    for (let step = 0; step < preset.steps; step++) {
      const grad = computeGradients(theta);
      for (let j = 0; j < 3; j++) {
        velocity[j] = preset.beta * velocity[j] + (1 - preset.beta) * grad[j];
        theta[j] -= preset.alpha * velocity[j];
      }
      history.push({ theta: [theta[0], theta[1], theta[2]], cost: computeCost(theta) });
    }
  } else {
    const rand = mulberry32(42);
    let updates = 0;
    const epochs = Math.ceil(preset.steps / M);
    outer: for (let epoch = 0; epoch < epochs; epoch++) {
      const order = shuffle(
        Array.from({ length: M }, (_, i) => i),
        rand
      );
      for (const idx of order) {
        const d = DATA[idx];
        const h = hypothesis(theta, d.x1, d.x2);
        const err = h - d.y;
        const grad: [number, number, number] = [err, err * d.x1, err * d.x2];
        for (let j = 0; j < 3; j++) {
          theta[j] -= preset.alpha * grad[j];
        }
        history.push({ theta: [theta[0], theta[1], theta[2]], cost: computeCost(theta) });
        updates += 1;
        if (updates >= preset.steps) break outer;
      }
    }
  }

  return history;
}

// ─── D3 Chart Constants ────────────────────────────────────────────────
const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const WIDTH = 520 - MARGIN.left - MARGIN.right;
const HEIGHT = 380 - MARGIN.top - MARGIN.bottom;

const X_DOMAIN: [number, number] = [-0.5, 4];
const Y_DOMAIN: [number, number] = [-0.5, 4];

// ─── Component ─────────────────────────────────────────────────────────
export default function GradientDescentPage() {
  const [preset, setPreset] = useState<typeof PRESETS[number]>(PRESETS[0]);
  const [history, setHistory] = useState<GdStep[]>(() => runGD(PRESETS[0]));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dataChartRef = useRef<HTMLDivElement>(null);
  const costChartRef = useRef<HTMLDivElement>(null);

  // ─── D3: Data & Decision Boundary Chart ──────────────────────────────
  const drawDataChart = useCallback(() => {
    if (!dataChartRef.current) return;
    const container = dataChartRef.current;
    container.innerHTML = '';

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', WIDTH + MARGIN.left + MARGIN.right)
      .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, WIDTH]);
    const yScale = d3.scaleLinear().domain(Y_DOMAIN).range([HEIGHT, 0]);

    // Grid lines
    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('x₁');

    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(8))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2)
      .attr('y', -45)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('x₂');

    // Scatter points
    svg
      .selectAll('.data-point')
      .data(DATA)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d) => xScale(d.x1))
      .attr('cy', (d) => yScale(d.x2))
      .attr('r', 6)
      .attr('fill', (d) => (d.y === 1 ? '#00b4a6' : '#f08a5d'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${WIDTH - 120}, 12)`);
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('fill', '#00b4a6');
    legend.append('text').attr('x', 12).attr('y', 4).attr('font-size', '12px').attr('fill', '#2d3436').text('y = 1');
    legend.append('circle').attr('cx', 0).attr('cy', 18).attr('r', 5).attr('fill', '#f08a5d');
    legend.append('text').attr('x', 12).attr('y', 22).attr('font-size', '12px').attr('fill', '#2d3436').text('y = 0');

    // Decision boundary helpers
    const boundaryPoints = (theta: [number, number, number]): [number, number][] | null => {
      const [t0, t1, t2] = theta;
      if (Math.abs(t2) < 1e-9) return null;
      const xMin = X_DOMAIN[0];
      const xMax = X_DOMAIN[1];
      const p1: [number, number] = [xMin, -(t0 + t1 * xMin) / t2];
      const p2: [number, number] = [xMax, -(t0 + t1 * xMax) / t2];
      return [p1, p2];
    };

    // Trail boundaries (every few steps, low opacity)
    for (let i = 0; i <= currentStep; i += 5) {
      const step = history[i];
      if (!step) continue;
      const pts = boundaryPoints(step.theta);
      if (!pts) continue;
      svg
        .append('line')
        .attr('x1', xScale(pts[0][0]))
        .attr('y1', yScale(pts[0][1]))
        .attr('x2', xScale(pts[1][0]))
        .attr('y2', yScale(pts[1][1]))
        .attr('stroke', preset.color)
        .attr('stroke-width', 1)
        .attr('opacity', 0.12);
    }

    // Current decision boundary
    const current = history[Math.min(currentStep, history.length - 1)];
    const currentPts = boundaryPoints(current.theta);
    if (currentPts) {
      svg
        .append('line')
        .attr('x1', xScale(currentPts[0][0]))
        .attr('y1', yScale(currentPts[0][1]))
        .attr('x2', xScale(currentPts[1][0]))
        .attr('y2', yScale(currentPts[1][1]))
        .attr('stroke', preset.color)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
    }

    // Title
    svg
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('二维数据与决策边界演变');
  }, [history, currentStep, preset.color]);

  // ─── D3: Cost vs Step Chart ──────────────────────────────────────────
  const maxCost = useMemo(() => {
    const max = history.reduce((acc, s) => Math.max(acc, s.cost), 0);
    return Math.max(1, Math.ceil(max * 1.1));
  }, [history]);

  const drawCostChart = useCallback(() => {
    if (!costChartRef.current) return;
    const container = costChartRef.current;
    container.innerHTML = '';

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', WIDTH + MARGIN.left + MARGIN.right)
      .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear().domain([0, history.length - 1]).range([0, WIDTH]);
    const yScale = d3.scaleLinear().domain([0, maxCost]).range([HEIGHT, 0]);

    // Grid lines
    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('迭代步数 (Step)');

    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(8))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2)
      .attr('y', -45)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('J(θ)');

    // Cost curve
    const line = d3
      .line<{ step: number; cost: number }>()
      .x((d) => xScale(d.step))
      .y((d) => yScale(d.cost))
      .curve(d3.curveLinear);

    const curveData = history.map((s, i) => ({ step: i, cost: s.cost }));
    svg
      .append('path')
      .datum(curveData)
      .attr('fill', 'none')
      .attr('stroke', preset.color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Trail dots
    svg
      .selectAll('.trail-dot')
      .data(curveData.filter((_, i) => i <= currentStep && i % 5 === 0))
      .enter()
      .append('circle')
      .attr('class', 'trail-dot')
      .attr('cx', (d) => xScale(d.step))
      .attr('cy', (d) => yScale(d.cost))
      .attr('r', 2.5)
      .attr('fill', preset.color)
      .attr('opacity', 0.5);

    // Current step vertical line
    svg
      .append('line')
      .attr('x1', xScale(currentStep))
      .attr('x2', xScale(currentStep))
      .attr('y1', 0)
      .attr('y2', HEIGHT)
      .attr('stroke', '#1a3a5c')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0.5);

    // Current position dot
    const current = history[Math.min(currentStep, history.length - 1)];
    svg
      .append('circle')
      .attr('cx', xScale(currentStep))
      .attr('cy', yScale(current.cost))
      .attr('r', 6)
      .attr('fill', preset.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Title
    svg
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('代价函数 J(θ) 随迭代步数的变化');
  }, [history, currentStep, preset.color, maxCost]);

  // ─── Render Charts ───────────────────────────────────────────────────
  useEffect(() => {
    drawDataChart();
  }, [drawDataChart]);

  useEffect(() => {
    drawCostChart();
  }, [drawCostChart]);

  // ─── Animation ───────────────────────────────────────────────────────
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      const frameInterval = 100 / speed;

      if (elapsed >= frameInterval) {
        lastTimeRef.current = timestamp;
        setCurrentStep((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }

      if (isPlaying) {
        animRef.current = requestAnimationFrame(animate);
      }
    },
    [isPlaying, history.length, speed]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, animate]);

  const playAnimation = () => {
    if (currentStep >= history.length - 1) setCurrentStep(0);
    setIsPlaying(true);
  };
  const pauseAnimation = () => setIsPlaying(false);
  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePreset = (newPreset: typeof PRESETS[number]) => {
    setPreset(newPreset);
    const newHistory = runGD(newPreset);
    setHistory(newHistory);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(Number(e.target.value));
    setIsPlaying(false);
  };

  const current = history[Math.min(currentStep, history.length - 1)];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">逻辑回归的梯度下降</h1>
      <p className="text-gray-600 mb-4">Gradient Descent for Logistic Regression</p>

      <p className="mb-8 text-sm text-amber-700 flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>

      {/* ─── Mountain Descent Analogy ────────────────────────────────── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Mountain className="w-6 h-6 text-blue-700" />
            核心类比：蒙眼下山
          </h3>
          <p className="text-blue-700 leading-relaxed mb-4">
            想象你站在山顶，蒙着眼睛，目标是走到山谷的最低点。你每步只能感觉脚下哪个方向最陡，然后朝那个方向迈一步。
            这就是梯度下降！对逻辑回归而言，虽然代价函数从平方误差换成了负对数似然（对数损失），但山坡的形状仍然是凸的；当有限最优解存在或加入正则化时，沿着梯度反方向走就能到达谷底。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">小</div>
                <h4 className="font-semibold text-orange-800 text-sm">小步下山</h4>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                学习率太小 = 小心翼翼地迈步。批量梯度下降每次都用全部样本计算方向，虽然稳妥，但步幅过小会让收敛极其缓慢。
              </p>
            </div>
            <div className="bg-white/80 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">中</div>
                <h4 className="font-semibold text-teal-800 text-sm">中步下山</h4>
              </div>
              <p className="text-xs text-teal-700 leading-relaxed">
                学习率适中 = 稳步前进。批量梯度下降配合动量，能沿着主要方向快速滑向全局最优（当有限最优解存在或加入正则化时），决策边界平滑收敛。
              </p>
            </div>
            <div className="bg-white/80 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">噪</div>
                <h4 className="font-semibold text-red-800 text-sm">随机下山</h4>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                随机梯度下降每次只看一个样本，方向带有噪声，像在山坡上跌跌撞撞。虽然总体趋势正确，但边界会在最优解附近震荡。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Explanation Section ─────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">算法原理</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          逻辑回归的假设函数是 Sigmoid 函数，它把线性组合压缩到 (0, 1) 之间，表示样本属于正类的概率：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`h_\theta(x) = \frac{1}{1 + e^{-\theta^{\top} x}}`} display />
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          对数损失（log loss）代价函数为：
        </p>

        <div className="formula-block">
          <KaTeX
            math={String.raw`J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \Bigl[ y^{(i)} \log h_\theta(x^{(i)}) + (1-y^{(i)}) \log\bigl(1 - h_\theta(x^{(i)})\bigr) \Bigr]`}
            display
          />
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          对 θ_j 求偏导后，Sigmoid 的导数恰好与 log loss 的导数相互抵消，得到一个简洁而优美的结果：
        </p>

        <div className="formula-block">
          <KaTeX
            math={String.raw`\frac{\partial J}{\partial \theta_j} = \frac{1}{m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) \, x_j^{(i)}`}
            display
          />
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          这个形式和线性回归的梯度<strong>一模一样</strong>，只是这里的 h_θ(x) 是 Sigmoid 输出而不是线性预测。参数更新规则仍然相同：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\theta_j := \theta_j - \alpha \cdot \frac{\partial J}{\partial \theta_j}`} display />
        </div>

        {/* ─── Why the Gradient Looks the Same ─────────────────────── */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 mt-4 mb-4">
          <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-700" />
            为什么梯度形式和线性回归相同？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-amber-700 text-sm mb-2">Sigmoid 的导数</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                Sigmoid 函数有一个美妙的性质：
                <KaTeX math={String.raw`\sigma'(z) = \sigma(z) \bigl(1 - \sigma(z)\bigr)`} />
                。它把输入 z 映射成概率，同时给出变化率。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-amber-700 text-sm mb-2">与 log loss 的抵消</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                对 log loss 求导时，分母会出现
                <KaTeX math={String.raw`\sigma(z)`} />
                或
                <KaTeX math={String.raw`1 - \sigma(z)`} />
                ，正好与 Sigmoid 导数中的因子约掉，最终只剩下 (h − y) · x。
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          梯度下降要求所有参数同时进行更新，即在计算完所有偏导数后，再统一更新参数值：
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">同步更新规则：</p>
          <div className="formula-block bg-white border-blue-100">
            <KaTeX
              math={String.raw`\text{temp}_j := \theta_j - \alpha \cdot \frac{1}{m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) x_j^{(i)} \quad \text{(for all } j \text{)}`}
              display
            />
            <div className="mt-2">
              <KaTeX math={String.raw`\theta_j := \text{temp}_j \quad \text{(then update all } \theta_j \text{ simultaneously)}`} display />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Visualization ───────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">交互式可视化</h2>
        <p className="text-gray-600 mb-4">
          选择一个优化方案，观察逻辑回归在不同学习率与更新策略下的收敛行为。左侧显示二维数据与决策边界的演变，右侧显示对数损失随迭代步数的变化。
          注意：本演示数据是线性可分的，因此对数似然没有有限最大值点——边界稳定后参数仍会缓慢增长，这是正常现象，与正文对"可分数据"的说明一致。
        </p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                preset.label === p.label
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
              style={preset.label === p.label ? { backgroundColor: p.color } : {}}
            >
              {p.label} ({p.desc})
            </button>
          ))}
        </div>

        {/* D3 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div ref={dataChartRef} className="bg-white rounded-xl shadow-card border border-gray-200 p-3 overflow-x-auto" />
          <div ref={costChartRef} className="bg-white rounded-xl shadow-card border border-gray-200 p-3 overflow-x-auto" />
        </div>

        {/* Playback controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4 p-4 bg-white rounded-xl shadow-card border border-gray-200">
          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 播放
          </button>
          <button
            onClick={pauseAnimation}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 transition-colors"
          >
            <Pause className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 暂停
          </button>
          <button
            onClick={resetAnimation}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 重置
          </button>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-500">速度:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speed === s
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2 flex-grow min-w-[200px]">
            <span className="text-sm text-gray-500 whitespace-nowrap">步数:</span>
            <input
              type="range"
              min={0}
              max={history.length - 1}
              value={Math.min(currentStep, history.length - 1)}
              onChange={handleSlider}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-700 font-mono min-w-[3ch]">{currentStep}</span>
          </div>
        </div>

        {/* Current step info */}
        <div
          className="mt-3 p-3 rounded-lg border-l-4"
          style={{ borderLeftColor: preset.color, backgroundColor: `${preset.color}10` }}
        >
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-gray-500">当前预设:</span>{' '}
              <strong style={{ color: preset.color }}>
                {preset.label} ({preset.desc})
              </strong>
            </span>
            <span>
              <span className="text-gray-500">Step:</span>{' '}
              <strong className="font-mono">
                {currentStep}
              </strong>{' '}
              / {history.length - 1}
            </span>
            <span>
              <span className="text-gray-500">θ:</span>{' '}
              <strong className="font-mono">
                [{current.theta.map((t) => t.toFixed(3)).join(', ')}]
              </strong>
            </span>
            <span>
              <span className="text-gray-500">J(θ):</span>{' '}
              <strong className="font-mono">{current.cost.toFixed(6)}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Batch vs Stochastic Gradient Descent ────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">批量梯度下降 vs 随机梯度下降</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          上面的交互演示展示了两种经典的梯度下降变体：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">批量梯度下降（Batch GD）</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              每次迭代都遍历全部 m 个样本，计算平均梯度后再更新参数。方向稳定，收敛平滑。
            </p>
            <div className="formula-block">
              <KaTeX
                math={String.raw`\theta_j := \theta_j - \alpha \cdot \frac{1}{m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) x_j^{(i)}`}
                display
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">随机梯度下降（SGD）</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              每次只随机选取一个样本，根据该样本的梯度立即更新参数。单步方向有噪声，但总体向最优解靠近，适合大规模数据。
            </p>
            <div className="formula-block">
              <KaTeX
                math={String.raw`\theta_j := \theta_j - \alpha \cdot \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) x_j^{(i)} \quad \text{(for one random } i \text{)}`}
                display
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cost Function Properties ────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">代价函数特性</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          逻辑回归的对数损失函数是凸函数；这意味着当有限最优解存在或加入正则化时，只要学习率选择得当，梯度下降最终会收敛到全局最优。但它不是二次函数，
          不同区域的曲率差异很大，因此学习率的影响比线性回归更微妙。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
                <span>
                  <strong>θ = 0</strong> 时 h_θ(x) = 0.5，所有样本的损失均为 ln 2，J(θ) ≈ 0.693
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-orange-500 mt-0.5 mt-1" />
                <span>
                  学习率过小时，参数在初始平台区移动极慢，100 步后仍无法分开两类样本
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-teal-500 mt-0.5 mt-1" />
                <span>
                  动量 β = 0.92 累积历史梯度，帮助批量 GD 更快穿越平缓区域
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-purple-500 mt-0.5 mt-1" />
                <span>
                  对数损失无闭式解，必须借助梯度下降等迭代优化算法求解
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-red-500 mt-0.5 mt-1" />
                <span>
                  SGD 单步噪声大，但在大数据集上每次迭代计算量小，收敛更快
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
                <span>
                  由于函数凸，理论上不存在局部最优陷阱，但数值上仍可能因学习率不当而停滞或震荡
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Global Optimum Intuition ────────────────────────────────── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-700" />
            凸地形中的最低点
          </h3>
          <p className="text-purple-700 leading-relaxed mb-4">
            逻辑回归的对数损失是一个凸函数，就像只有一个山谷的盆地。当有限最优解存在或加入正则化时，只要不停朝梯度反方向走，最终一定能到达全局最低点。
            但走法不同，体验也不同：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-2">小学习率：步履蹒跚</h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                批量 GD 用全部样本求平均方向，但步幅太小。走了很久，决策边界仍停留在数据集中央，分类效果很差。
              </p>
            </div>
            <div className="bg-white/80 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-800 text-sm mb-2">中学习率：直达谷底</h4>
              <p className="text-xs text-teal-700 leading-relaxed">
                学习率适中并配合动量，参数沿着损失下降最快的方向稳定移动；当有限最优解存在或加入正则化时，最终决策边界准确分开两类样本。
              </p>
            </div>
            <div className="bg-white/80 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-2">SGD：跌跌撞撞但总体正确</h4>
              <p className="text-xs text-red-700 leading-relaxed">
                每次只看一个样本，单步方向可能偏离平均方向，边界在左右摇摆。但长期来看，它仍向最优解收敛，且计算代价更低。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Learning Rate / Algorithm Comparison Table ──────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">学习率与更新策略的影响</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          学习率 α 和是否使用随机样本，是逻辑回归训练中最重要的选择之一。下表对比了本页三种预设方案的行为。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">方案</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">标签</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">收敛行为</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PRESETS.map((p) => (
                <tr key={p.label} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.desc}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.behavior}</td>
                  <td className="px-4 py-3 text-sm">
                    {p.mode === 'batch' && p.alpha === 0.2 && (
                      <span className="text-teal-600 font-medium">稳定收敛，决策边界清晰分开两类</span>
                    )}
                    {p.mode === 'batch' && p.alpha === 0.01 && (
                      <span className="text-orange-600 font-medium">收敛极慢，边界仍靠近数据集中心</span>
                    )}
                    {p.mode === 'sgd' && (
                      <span className="text-red-600 font-medium">边界震荡，但总体趋势向最优解靠近</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed explanation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <h3 className="font-semibold text-orange-800 text-sm">学习率过小</h3>
            </div>
            <p className="text-sm text-orange-700 leading-relaxed">
              批量 GD 方向稳定但步幅太小，参数在损失平缓区移动缓慢。对逻辑回归来说，初始点附近的梯度也不大，小学习率会让模型长期停留在“不确定”区域。
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <h3 className="font-semibold text-teal-800 text-sm">批量适中 + 动量</h3>
            </div>
            <p className="text-sm text-teal-700 leading-relaxed">
              学习率恰到好处，配合动量累积历史梯度，参数能稳定滑向全局最优（当有限最优解存在或加入正则化时）。批量 GD 方向准确，决策边界平滑收敛。
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h3 className="font-semibold text-red-800 text-sm">随机梯度下降</h3>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              每次只用一个样本，单步方向带有随机噪声。虽然边界会震荡，但迭代速度快、内存占用小，是处理大规模数据的常用选择。
            </p>
          </div>
        </div>

        {/* Formula summary */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">逻辑回归梯度（与线性回归形式相同）：</p>
          <div className="formula-block bg-white border-gray-100">
            <KaTeX
              math={String.raw`\frac{\partial J}{\partial \theta_j} = \frac{1}{m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) \, x_j^{(i)}`}
              display
            />
          </div>
        </div>
      </section>
    </div>
  );
}
