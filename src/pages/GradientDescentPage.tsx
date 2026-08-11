import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Mountain, Snowflake, Map, Circle } from 'lucide-react';
import KaTeX from '../components/KaTeX';
import LinearRegressionGD from '../components/LinearRegressionGD';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// ─── Cost Function (8th degree polynomial) ───────────────────────────
const COEFFS = [3.5, -0.5, 2.1416005787, -4.9159963233, 3.8283561222, -1.4186265257, 0.2747269485, -0.0269551228, 0.0010611334];

function costFn(theta: number): number {
  let result = 0;
  for (let i = 0; i < COEFFS.length; i++) {
    result += COEFFS[i] * Math.pow(theta, i);
  }
  return result;
}

function gradFn(theta: number): number {
  let result = 0;
  for (let i = 1; i < COEFFS.length; i++) {
    result += i * COEFFS[i] * Math.pow(theta, i - 1);
  }
  return result;
}

// ─── Gradient Descent with Momentum ──────────────────────────────────
function runGD(alpha: number, beta: number = 0.92, numSteps: number = 150, theta0: number = 0): number[] {
  const history: number[] = [theta0];
  let theta = theta0;
  let v = 0;

  for (let i = 0; i < numSteps; i++) {
    const g = gradFn(theta);
    v = beta * v + (1 - beta) * g;
    theta = theta - alpha * v;
    history.push(theta);
    if (theta < -2 || theta > 10) break;
  }
  return history;
}

// ─── Learning Rate Presets ───────────────────────────────────────────
const PRESETS = [
  { label: 'α = 0.05', desc: '太小', alpha: 0.05, behavior: '移动缓慢，容易停留在平台区或当前构造函数的局部低谷附近', color: '#f08a5d' },
  { label: 'α = 1.0', desc: '适中', alpha: 1.0, behavior: '越过当前构造函数中的平台/小坡，收敛到该初始点可达的目标低谷 θ≈6', color: '#00b4a6' },
  { label: 'α = 2.0', desc: '太大', alpha: 2.0, behavior: '越过目标低谷，在 θ≈6 附近震荡', color: '#e25b5b' },
];

// ─── D3 Chart Constants ──────────────────────────────────────────────
const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const WIDTH = 520 - MARGIN.left - MARGIN.right;
const HEIGHT = 380 - MARGIN.top - MARGIN.bottom;

// ─── Component ───────────────────────────────────────────────────────
export default function GradientDescentPage() {
  const [alpha, setAlpha] = useState(1.0);
  const [history, setHistory] = useState<number[]>(() => runGD(1.0));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const costChartRef = useRef<HTMLDivElement>(null);
  const stepChartRef = useRef<HTMLDivElement>(null);

  // Generate smooth cost function curve data
  const costCurveData = useMemo(() => {
    const data: { theta: number; cost: number }[] = [];
    for (let t = 0; t <= 7; t += 0.02) {
      data.push({ theta: t, cost: costFn(t) });
    }
    return data;
  }, []);

  // ─── D3: Cost Function Chart ─────────────────────────────────────
  const drawCostChart = useCallback(() => {
    if (!costChartRef.current) return;
    const container = costChartRef.current;
    container.innerHTML = '';

    const svg = d3.select(container)
      .append('svg')
      .attr('width', WIDTH + MARGIN.left + MARGIN.right)
      .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
      .style('font-family', 'Inter, sans-serif')
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear().domain([0, 7]).range([0, WIDTH]);
    const yScale = d3.scaleLinear().domain([0, 4]).range([HEIGHT, 0]);

    // Grid lines
    svg.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('θ');

    svg.append('g')
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

    // Reference dashed lines
    // J = 2.0 (plateau)
    svg.append('line')
      .attr('x1', 0).attr('x2', xScale(7))
      .attr('y1', yScale(2.0)).attr('y2', yScale(2.0))
      .attr('stroke', '#f08a5d').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.6);
    svg.append('text').attr('x', xScale(6.2)).attr('y', yScale(2.0) - 6)
      .attr('fill', '#f08a5d').attr('font-size', '11px').text('J=2.0 (平台)');

    // J = 0.3 (global min)
    svg.append('line')
      .attr('x1', 0).attr('x2', xScale(7))
      .attr('y1', yScale(0.3)).attr('y2', yScale(0.3))
      .attr('stroke', '#00b4a6').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.6);
    svg.append('text').attr('x', xScale(6.2)).attr('y', yScale(0.3) - 6)
      .attr('fill', '#00b4a6').attr('font-size', '11px').text('J≈0.3 (当前构造函数中的目标低谷)');

    // θ = 2 (plateau)
    svg.append('line')
      .attr('x1', xScale(2)).attr('x2', xScale(2))
      .attr('y1', 0).attr('y2', HEIGHT)
      .attr('stroke', '#f08a5d').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.4);

    // θ = 6 (global min)
    svg.append('line')
      .attr('x1', xScale(6)).attr('x2', xScale(6))
      .attr('y1', 0).attr('y2', HEIGHT)
      .attr('stroke', '#00b4a6').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.4);

    // Cost function curve
    const line = d3.line<{ theta: number; cost: number }>()
      .x(d => xScale(d.theta))
      .y(d => yScale(d.cost))
      .curve(d3.curveBasis);

    svg.append('path')
      .datum(costCurveData)
      .attr('fill', 'none')
      .attr('stroke', '#3a7bd5')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // GD trajectory trail (up to current step)
    const preset = PRESETS.find(p => p.alpha === alpha) || PRESETS[1];
    const trailData = history.slice(0, currentStep + 1).map((theta, i) => ({
      theta,
      cost: costFn(theta),
      step: i,
    }));

    if (trailData.length > 1) {
      const trailLine = d3.line<{ theta: number; cost: number }>()
        .x(d => xScale(Math.max(0, Math.min(7, d.theta))))
        .y(d => yScale(Math.max(0, Math.min(4, d.cost))))
        .curve(d3.curveLinear);

      svg.append('path')
        .datum(trailData)
        .attr('fill', 'none')
        .attr('stroke', preset.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2')
        .attr('opacity', 0.7)
        .attr('d', trailLine);
    }

    // Current position dot
    if (trailData.length > 0) {
      const current = trailData[trailData.length - 1];
      const cx = xScale(Math.max(0, Math.min(7, current.theta)));
      const cy = yScale(Math.max(0, Math.min(4, current.cost)));

      svg.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', 7)
        .attr('fill', preset.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Pulse ring
      svg.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', 12)
        .attr('fill', 'none')
        .attr('stroke', preset.color)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.4);
    }

    // Title
    svg.append('text')
      .attr('x', WIDTH / 2).attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('代价函数 J(θ) 与梯度下降轨迹');

  }, [costCurveData, history, currentStep, alpha]);

  // ─── D3: Theta vs Step Chart ─────────────────────────────────────
  const drawStepChart = useCallback(() => {
    if (!stepChartRef.current) return;
    const container = stepChartRef.current;
    container.innerHTML = '';

    const svg = d3.select(container)
      .append('svg')
      .attr('width', WIDTH + MARGIN.left + MARGIN.right)
      .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
      .style('font-family', 'Inter, sans-serif')
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear().domain([0, 150]).range([0, WIDTH]);
    const yScale = d3.scaleLinear().domain([0, 7]).range([HEIGHT, 0]);

    // Grid lines
    svg.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(10).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(7).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('迭代步数 (Step)');

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(7))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2)
      .attr('y', -45)
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('θ 值');

    // Reference dashed lines
    svg.append('line')
      .attr('x1', 0).attr('x2', WIDTH)
      .attr('y1', yScale(2)).attr('y2', yScale(2))
      .attr('stroke', '#f08a5d').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.5);
    svg.append('text').attr('x', WIDTH - 50).attr('y', yScale(2) - 6)
      .attr('fill', '#f08a5d').attr('font-size', '11px').text('θ=2 (平台)');

    svg.append('line')
      .attr('x1', 0).attr('x2', WIDTH)
      .attr('y1', yScale(6)).attr('y2', yScale(6))
      .attr('stroke', '#00b4a6').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.5);
    svg.append('text').attr('x', WIDTH - 70).attr('y', yScale(6) - 6)
      .attr('fill', '#00b4a6').attr('font-size', '11px').text('θ≈6 (当前演示低谷)');

    // GD trajectory line
    const preset = PRESETS.find(p => p.alpha === alpha) || PRESETS[1];
    const trajectoryData = history.map((theta, i) => ({ step: i, theta: Math.max(0, Math.min(7, theta)) }));

    if (trajectoryData.length > 1) {
      const line = d3.line<{ step: number; theta: number }>()
        .x(d => xScale(d.step))
        .y(d => yScale(d.theta))
        .curve(d3.curveLinear);

      svg.append('path')
        .datum(trajectoryData)
        .attr('fill', 'none')
        .attr('stroke', preset.color)
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    // Trail dots
    svg.selectAll('.trail-dot')
      .data(trajectoryData.filter((_, i) => i <= currentStep && i % 5 === 0))
      .enter()
      .append('circle')
      .attr('class', 'trail-dot')
      .attr('cx', d => xScale(d.step))
      .attr('cy', d => yScale(d.theta))
      .attr('r', 2.5)
      .attr('fill', preset.color)
      .attr('opacity', 0.5);

    // Current step vertical line
    svg.append('line')
      .attr('x1', xScale(currentStep)).attr('x2', xScale(currentStep))
      .attr('y1', 0).attr('y2', HEIGHT)
      .attr('stroke', '#1a3a5c').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4').attr('opacity', 0.5);

    // Current position dot
    if (currentStep < history.length) {
      const currentTheta = Math.max(0, Math.min(7, history[currentStep]));
      svg.append('circle')
        .attr('cx', xScale(currentStep))
        .attr('cy', yScale(currentTheta))
        .attr('r', 6)
        .attr('fill', preset.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }

    // Title
    svg.append('text')
      .attr('x', WIDTH / 2).attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('参数 θ 随迭代步数的变化');

  }, [history, currentStep, alpha]);

  // ─── Render Charts ─────────────────────────────────────────────────
  useEffect(() => {
    drawCostChart();
  }, [drawCostChart]);

  useEffect(() => {
    drawStepChart();
  }, [drawStepChart]);

  // ─── Animation ─────────────────────────────────────────────────────
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const elapsed = timestamp - lastTimeRef.current;
    const frameInterval = 100 / speed;

    if (elapsed >= frameInterval) {
      lastTimeRef.current = timestamp;
      setCurrentStep(prev => {
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
  }, [isPlaying, history.length, speed]);

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

  const handlePreset = (newAlpha: number) => {
    setAlpha(newAlpha);
    const newHistory = runGD(newAlpha);
    setHistory(newHistory);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(Number(e.target.value));
    setIsPlaying(false);
  };

  const currentTheta = history[Math.min(currentStep, history.length - 1)];
  const currentJ = costFn(currentTheta);
  const preset = PRESETS.find(p => p.alpha === alpha) || PRESETS[1];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">梯度下降：从线性回归到非凸优化</h1>
      <p className="text-gray-600 mb-2">线性回归的凸二次损失是理解梯度下降最干净的起点。</p>
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>注意：</strong>本页先通过模块 A 展示线性回归的<strong>凸二次损失</strong>（设计矩阵满列秩时有唯一全局最优解）；
        模块 B 再用一个 8 次多项式构造的<strong>非凸函数</strong>展示复杂地形中的行为。非凸演示中的“小坑”“越过小坡”等类比只适用于模块 B，不要把它们套用到线性回归上。
      </div>

      <Tabs defaultValue="linear" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="linear">模块 A：线性回归（凸损失）</TabsTrigger>
          <TabsTrigger value="nonconvex">模块 B：非凸函数与动量</TabsTrigger>
        </TabsList>

        <TabsContent value="linear">
          <LinearRegressionGD />
        </TabsContent>

        <TabsContent value="nonconvex">

      {/* ─── Mountain Descent Analogy ────────────────────────────── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Mountain className="w-6 h-6 text-blue-700" />
            核心类比：蒙眼下山
          </h3>
          <p className="text-blue-700 leading-relaxed mb-4">
            想象你站在山顶，蒙着眼睛，目标是走到山谷的最低点。你每步只能感觉脚下哪个方向最陡，然后朝那个方向迈一步。
            这就是梯度下降！你感觉不到全局的地形，只能依赖局部的坡度信息来导航。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">小</div>
                <h4 className="font-semibold text-orange-800 text-sm">小步下山</h4>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                学习率太小 = 小心翼翼地迈步。在当前非凸演示函数和当前初始点下，你移动缓慢，容易停留在平台区或局部低谷附近，无法到达更远处的目标低谷。
              </p>
            </div>
            <div className="bg-white/80 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold">中</div>
                <h4 className="font-semibold text-teal-800 text-sm">中步下山</h4>
              </div>
              <p className="text-xs text-teal-700 leading-relaxed">
                学习率适中 = 稳步前进。在某些非凸函数和特定初始点下，较大的学习率或动量可能帮助算法穿过平坦区域或浅局部区域，但不能保证找到全局最优。配合动量，下山通常更快更稳。
              </p>
            </div>
            <div className="bg-white/80 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">大</div>
                <h4 className="font-semibold text-red-800 text-sm">大步下山</h4>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                学习率太大 = 大步跳跃。你可能直接越过山谷，在对面的山坡上反复横跳，永远停不下来（震荡/发散）。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Explanation Section ─────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">算法原理</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          梯度下降是一种迭代优化算法，用于最小化代价函数 J(θ)。在每一步迭代中，算法沿着代价函数梯度的反方向更新参数 θ。
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\theta_j := \theta_j - \alpha \cdot \frac{\partial J(\theta)}{\partial \theta_j}`} display />
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          其中 α 是学习率（learning rate），控制每一步的步长。为了提高收敛稳定性，我们引入动量（Momentum）机制：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`v := \beta v + (1-\beta) \nabla J(\theta) \quad ; \quad \theta := \theta - \alpha v`} display />
        </div>

        {/* ─── Momentum Intuition ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 mt-4 mb-4">
          <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Snowflake className="w-6 h-6 text-amber-700" />
            动量的直觉：滚雪球下山
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-amber-700 text-sm mb-2">没有动量</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                就像一个人一步一步独立地走下山。每步都只根据当前的坡度决定，方向可能来回摇摆，尤其在坡度变化大的地方容易走弯路。
                遇到平坦区域时，步伐会变得极小，几乎停滞不前。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-amber-700 text-sm mb-2">有动量（β = 0.92）</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                就像滚雪球下山。雪球越滚越快，方向越来越稳定，因为惯性让它沿着主要趋势前进。即使遇到小坡也能冲过去，
                不容易被局部低谷或平台区困住。β = 0.92 表示保留了 92% 的前进惯性。
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          动量项 β（通常设为 0.9 左右）累积历史梯度信息，使得更新方向更加平滑，有助于越过局部平台区域和鞍点。
          对于线性回归，代价函数对参数的偏导数为：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\frac{\partial J}{\partial \theta_j} = \frac{1}{m} \sum_{i=1}^{m} \bigl(h_\theta(x^{(i)}) - y^{(i)}\bigr) \cdot x_j^{(i)}`} display />
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          梯度下降要求所有参数同时进行更新，即在计算完所有偏导数后，再统一更新参数值：
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">同步更新规则：</p>
          <div className="formula-block bg-white border-blue-100">
            <KaTeX math={String.raw`\text{temp}_j := \theta_j - \alpha \cdot \frac{\partial J}{\partial \theta_j} \quad \text{(for all } j \text{)}`} display />
            <div className="mt-2">
              <KaTeX math={String.raw`\theta_j := \text{temp}_j \quad \text{(then update all } \theta_j \text{ simultaneously)}`} display />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Visualization ───────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">交互式可视化</h2>
        <p className="text-gray-600 mb-4">
          选择一个学习率预设，观察梯度下降在不同学习率下的收敛行为。左侧图表显示代价函数曲线和参数更新轨迹，右侧显示参数 θ 随迭代步数的变化。
        </p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          {PRESETS.map(p => (
            <button
              key={p.alpha}
              onClick={() => handlePreset(p.alpha)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                alpha === p.alpha
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
              style={alpha === p.alpha ? { backgroundColor: p.color } : {}}
            >
              {p.label} ({p.desc})
            </button>
          ))}
        </div>

        {/* D3 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div ref={costChartRef} className="bg-white rounded-xl shadow-card border border-gray-200 p-3 overflow-x-auto" />
          <div ref={stepChartRef} className="bg-white rounded-xl shadow-card border border-gray-200 p-3 overflow-x-auto" />
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
            {[1, 2, 5].map(s => (
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
              aria-label="线性回归梯度下降步数"
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
        <div className="mt-3 p-3 rounded-lg border-l-4" style={{ borderLeftColor: preset.color, backgroundColor: `${preset.color}10` }}>
          <div className="flex flex-wrap gap-6 text-sm">
            <span><span className="text-gray-500">当前预设:</span> <strong style={{ color: preset.color }}>{preset.label} ({preset.desc})</strong></span>
            <span><span className="text-gray-500">Step:</span> <strong className="font-mono">{currentStep}</strong> / {history.length - 1}</span>
            <span><span className="text-gray-500">θ:</span> <strong className="font-mono">{currentTheta.toFixed(4)}</strong></span>
            <span><span className="text-gray-500">J(θ):</span> <strong className="font-mono">{currentJ.toFixed(6)}</strong></span>
          </div>
        </div>
      </section>

      {/* ─── Cost Function Properties ────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">代价函数特性</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          本页使用一个精心设计的 8 次多项式作为代价函数，模拟了优化过程中常见的挑战：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
                <span><strong>J(0) = 3.5</strong> — 初始点，代价较高</span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-orange-500 mt-1" />
                <span><strong>J(2) ≈ 2.0</strong> — 局部平台区，梯度 J'(2) = -0.15 很小</span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-red-500 mt-1" />
                <span><strong>J(3) ≈ 2.2</strong> — 障碍峰值，需要足够大的学习率才能越过</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-teal-500 mt-1" />
                <span><strong>J(6) ≈ 0.3</strong> — 当前显示区间内的目标低谷，J'(6) ≈ 0</span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-gray-500 mt-1" />
                <span><strong>θ &gt; 6</strong> — 代价函数急剧上升，过大的学习率会导致震荡</span>
              </li>
              <li className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-current text-blue-500 mt-1" />
                <span>动量系数 <strong>β = 0.92</strong> 帮助累积梯度信息，加速穿越平台</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Local vs Global Optima Intuition ────────────────────── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-700" />
            局部低谷 vs 当前显示区间内的最低点：在当前非凸演示函数中探索
          </h3>
          <p className="text-purple-700 leading-relaxed mb-4">
            想象你站在一片连绵起伏的山脉中，目标是找到当前可见区域内的最低点。但这片山脉有很多起伏——
            在当前非凸演示函数中，你如何确保自己到达的是目标低谷，而不是某个局部低谷？
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-2">小学习率：移动缓慢 / 容易停留在平台区附近</h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                在当前非凸演示函数和当前初始点下，你小心翼翼地下山，移动缓慢，容易停留在平台区或局部低谷附近。
                对应梯度下降：可能无法离开当前平台区，不一定能到达当前显示区间内的目标低谷。
              </p>
            </div>
            <div className="bg-white/80 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-800 text-sm mb-2">中学习率：越过小坡</h4>
              <p className="text-xs text-teal-700 leading-relaxed">
                在当前非凸演示函数和当前初始点下，你有足够的动能爬过当前的小坡，继续向更低的地方探索。配合动量的"惯性"，
                你能顺利通过平缓区域和小障碍，可能到达当前显示区间内一个更低的谷地；但这只是当前构造演示中的行为，不意味着在非凸问题里学习率大就能普遍逃脱局部最优。
              </p>
            </div>
            <div className="bg-white/80 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-2">大学习率：来回跳跃</h4>
              <p className="text-xs text-red-700 leading-relaxed">
                你像袋鼠一样大跳，直接从山谷的一边跳到另一边，永远落不到谷底。
                在梯度下降中，这表现为在最优解附近震荡，代价函数无法收敛。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Learning Rate Comparison Table ──────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">学习率的影响</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          学习率 α 是梯度下降中最重要的超参数之一。选择合适的学习率对算法的收敛速度和最终效果至关重要。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">学习率 α</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">标签</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">收敛行为</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PRESETS.map(p => (
                <tr key={p.alpha} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: p.color }}>
                      {p.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.desc}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.behavior}</td>
                  <td className="px-4 py-3 text-sm">
                    {p.alpha === 0.05 && (
                      <span className="text-orange-600 font-medium">在当前非凸演示函数和当前初始点下移动缓慢，无法到达当前显示区间内的目标低谷</span>
                    )}
                    {p.alpha === 1.0 && (
                      <span className="text-teal-600 font-medium">收敛到该初始点在当前构造函数中可达的最低谷 θ≈6</span>
                    )}
                    {p.alpha === 2.0 && (
                      <span className="text-red-600 font-medium">在最优解附近震荡，无法稳定收敛</span>
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
              步长太小导致收敛极慢，尤其是在梯度较小的平台区域。在当前非凸演示函数和当前初始点下，算法可能在局部次优点附近停滞，无法探索更优的解空间。
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <h3 className="font-semibold text-teal-800 text-sm">学习率适中</h3>
            </div>
            <p className="text-sm text-teal-700 leading-relaxed">
              步长恰到好处，既能有效降低代价函数，又不会越过最优解。在当前非凸演示函数和当前初始点下，配合动量机制通常能收敛到该初始点可达的最低谷。
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h3 className="font-semibold text-red-800 text-sm">学习率过大</h3>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              步长过大导致在最优解附近来回震荡，甚至发散。每次更新都越过最小值点，使得代价函数无法稳定下降。
            </p>
          </div>
        </div>

        {/* Formula summary */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">当前非凸演示函数的代价函数多项式：</p>
          <div className="overflow-x-auto">
            <code className="text-xs text-gray-700 font-mono block">
              J(θ) = 3.5 - 0.5θ + 2.14θ² - 4.92θ³ + 3.83θ⁴ - 1.42θ⁵ + 0.27θ⁶ - 0.027θ⁷ + 0.0011θ⁸
            </code>
          </div>
        </div>
      </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
