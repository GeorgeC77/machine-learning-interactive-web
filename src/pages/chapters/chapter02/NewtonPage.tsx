import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { ShieldAlert, Zap, TrendingUp, Activity, Circle, Target, Rocket, Pin, Play, Pause, RotateCcw } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import InteractiveDemo from '@/components/InteractiveDemo';
import InteractivePanel from '@/components/InteractivePanel';

/* ------------------------------------------------------------------ */
/*  1-D logistic regression demo data                                   */
/* ------------------------------------------------------------------ */
const DEMO_POINTS = [
  { x: -3.0, y: 0 },
  { x: -1.5, y: 0 },
  { x: 0.0, y: 0 },
  // 故意加入一个与符号规则相反的点，使数据不可线性可分，保证 MLE 有有限最优解
  { x: -1.0, y: 1 },
  { x: 2.5, y: 1 },
];

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function logLikelihood(theta: number): number {
  let ell = 0;
  for (const p of DEMO_POINTS) {
    const h = sigmoid(theta * p.x);
    ell += p.y * Math.log(h + 1e-12) + (1 - p.y) * Math.log(1 - h + 1e-12);
  }
  return ell;
}

function gradLogLikelihood(theta: number): number {
  let g = 0;
  for (const p of DEMO_POINTS) {
    const h = sigmoid(theta * p.x);
    g += (p.y - h) * p.x;
  }
  return g;
}

function hessianLogLikelihood(theta: number): number {
  let h = 0;
  for (const p of DEMO_POINTS) {
    const prob = sigmoid(theta * p.x);
    h -= prob * (1 - prob) * p.x * p.x;
  }
  return h;
}

function runNewton(theta0: number, steps: number): number[] {
  const history = [theta0];
  let theta = theta0;
  for (let i = 0; i < steps; i++) {
    const g = gradLogLikelihood(theta);
    const h = hessianLogLikelihood(theta);
    if (Math.abs(h) < 1e-12) break;
    theta = theta - g / h;
    history.push(theta);
    if (!isFinite(theta)) break;
  }
  return history;
}

function runGradientAscent(theta0: number, alpha: number, steps: number): number[] {
  const history = [theta0];
  let theta = theta0;
  for (let i = 0; i < steps; i++) {
    const g = gradLogLikelihood(theta);
    theta = theta + alpha * g;
    history.push(theta);
    if (!isFinite(theta) || theta < -6 || theta > 6) break;
  }
  return history;
}

/* ------------------------------------------------------------------ */
/*  D3 chart component                                                   */
/* ------------------------------------------------------------------ */
const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const WIDTH = 560 - MARGIN.left - MARGIN.right;
const HEIGHT = 360 - MARGIN.top - MARGIN.bottom;

interface NewtonChartProps {
  newtonHistory: number[];
  gdHistory: number[];
  currentStep: number;
}

function NewtonComparisonChart({ newtonHistory, gdHistory, currentStep }: NewtonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const curveData = useMemo(() => {
    const data: { theta: number; ell: number }[] = [];
    for (let t = -5; t <= 5; t += 0.04) {
      data.push({ theta: t, ell: logLikelihood(t) });
    }
    return data;
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear().domain([-5, 5]).range([0, WIDTH]);
    const yScale = d3.scaleLinear().domain([-40, 0]).range([HEIGHT, 0]);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Clip path to keep curves inside the plot area
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'plot-clip')
      .append('rect')
      .attr('width', WIDTH)
      .attr('height', HEIGHT);

    const plotG = g.append('g').attr('clip-path', 'url(#plot-clip)');

    // Grid
    plotG.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(10).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    plotG.append('g')
      .call(d3.axisLeft(yScale).ticks(8).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('θ');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(8))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2)
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('ℓ(θ)');

    // Optimum reference line
    const thetaStar = newtonHistory[newtonHistory.length - 1] ?? 0;
    g.append('line')
      .attr('x1', xScale(thetaStar))
      .attr('x2', xScale(thetaStar))
      .attr('y1', 0)
      .attr('y2', HEIGHT)
      .attr('stroke', '#00b4a6')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0.5);
    g.append('text')
      .attr('x', xScale(thetaStar) + 6)
      .attr('y', 14)
      .attr('fill', '#00b4a6')
      .attr('font-size', '11px')
      .text('θ*');

    // Log-likelihood curve
    const line = d3
      .line<{ theta: number; ell: number }>()
      .x((d) => xScale(d.theta))
      .y((d) => yScale(d.ell))
      .curve(d3.curveBasis);

    plotG.append('path').datum(curveData).attr('fill', 'none').attr('stroke', '#3a7bd5').attr('stroke-width', 2.5).attr('d', line);

    // Newton trajectory
    const newtonTrail = newtonHistory
      .slice(0, currentStep + 1)
      .map((theta) => ({ theta, ell: logLikelihood(theta) }));

    if (newtonTrail.length > 1) {
      const trailLine = d3
        .line<{ theta: number; ell: number }>()
        .x((d) => xScale(d.theta))
        .y((d) => yScale(d.ell))
        .curve(d3.curveLinear);
      plotG.append('path')
        .datum(newtonTrail)
        .attr('fill', 'none')
        .attr('stroke', '#f08a5d')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '5,3')
        .attr('d', trailLine);
    }

    if (newtonTrail.length > 0) {
      const last = newtonTrail[newtonTrail.length - 1];
      plotG.append('circle')
        .attr('cx', xScale(last.theta))
        .attr('cy', yScale(last.ell))
        .attr('r', 6)
        .attr('fill', '#f08a5d')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }

    // GD trajectory
    const gdTrail = gdHistory.slice(0, currentStep + 1).map((theta) => ({ theta, ell: logLikelihood(theta) }));

    if (gdTrail.length > 1) {
      const gdLine = d3
        .line<{ theta: number; ell: number }>()
        .x((d) => xScale(Math.max(-5, Math.min(5, d.theta))))
        .y((d) => yScale(Math.max(-40, Math.min(0, d.ell))))
        .curve(d3.curveLinear);
      plotG.append('path')
        .datum(gdTrail)
        .attr('fill', 'none')
        .attr('stroke', '#e25b5b')
        .attr('stroke-width', 2)
        .attr('opacity', 0.75)
        .attr('d', gdLine);
    }

    if (gdTrail.length > 0) {
      const last = gdTrail[gdTrail.length - 1];
      plotG.append('circle')
        .attr('cx', xScale(Math.max(-5, Math.min(5, last.theta))))
        .attr('cy', yScale(Math.max(-40, Math.min(0, last.ell))))
        .attr('r', 5)
        .attr('fill', '#e25b5b')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }

    // Legend
    const legend = g.append('g').attr('transform', `translate(${WIDTH - 130}, 10)`);
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('fill', '#f08a5d');
    legend.append('text').attr('x', 12).attr('y', 4).attr('font-size', '12px').attr('fill', '#2d3436').text('Newton');
    legend.append('circle').attr('cx', 0).attr('cy', 18).attr('r', 5).attr('fill', '#e25b5b');
    legend.append('text').attr('x', 12).attr('y', 22).attr('font-size', '12px').attr('fill', '#2d3436').text('Gradient Ascent');

    // Title
    g.append('text')
      .attr('x', WIDTH / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('对数似然函数 ℓ(θ) 与优化轨迹');
  }, [curveData, newtonHistory, gdHistory, currentStep]);

  return <svg ref={svgRef} viewBox="0 0 560 360" className="w-full h-auto" style={{ maxHeight: 360 }} />;
}

/* ------------------------------------------------------------------ */
/*  Step chart component                                                 */
/* ------------------------------------------------------------------ */
function StepChart({ newtonHistory, gdHistory, currentStep }: NewtonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const thetaStar = newtonHistory[newtonHistory.length - 1] ?? 0;
    const maxStep = Math.max(newtonHistory.length, gdHistory.length) - 1;
    const xScale = d3.scaleLinear().domain([0, Math.max(1, maxStep)]).range([0, WIDTH]);

    // Show log-distance to optimum: makes Newton's quadratic convergence visible
    const eps = 1e-12;
    const newtonData = newtonHistory.map((theta, i) => ({
      step: i,
      logDist: Math.log10(Math.max(eps, Math.abs(theta - thetaStar))),
    }));
    const gdData = gdHistory.map((theta, i) => ({
      step: i,
      logDist: Math.log10(Math.max(eps, Math.abs(theta - thetaStar))),
    }));

    const allValues = [...newtonData, ...gdData].map((d) => d.logDist);
    const yMin = Math.floor(Math.min(-6, ...allValues));
    const yMax = Math.ceil(Math.max(0, ...allValues));
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([HEIGHT, 0]);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid
    g.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(Math.min(10, maxStep)).tickSize(-HEIGHT).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.max(4, yMax - yMin)).tickSize(-WIDTH).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(d3.axisBottom(xScale).ticks(Math.min(10, maxStep)))
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('迭代步数');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.max(4, yMax - yMin)))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2)
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text('log₁₀|θ − θ*|');

    // Optimum line (logDist = -∞, so draw at bottom as reference)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', WIDTH)
      .attr('y1', yScale(yMin))
      .attr('y2', yScale(yMin))
      .attr('stroke', '#00b4a6')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0.5);
    g.append('text')
      .attr('x', WIDTH - 40)
      .attr('y', yScale(yMin) - 6)
      .attr('fill', '#00b4a6')
      .attr('font-size', '11px')
      .text('θ*');

    // Newton line
    if (newtonData.length > 1) {
      const line = d3
        .line<{ step: number; logDist: number }>()
        .x((d) => xScale(d.step))
        .y((d) => yScale(d.logDist))
        .curve(d3.curveLinear);
      g.append('path').datum(newtonData).attr('fill', 'none').attr('stroke', '#f08a5d').attr('stroke-width', 2.5).attr('d', line);
    }
    g.selectAll('.newton-dot')
      .data(newtonData.filter((_, i) => i <= currentStep))
      .enter()
      .append('circle')
      .attr('class', 'newton-dot')
      .attr('cx', (d) => xScale(d.step))
      .attr('cy', (d) => yScale(d.logDist))
      .attr('r', 3)
      .attr('fill', '#f08a5d');

    // GD line
    if (gdData.length > 1) {
      const line = d3
        .line<{ step: number; logDist: number }>()
        .x((d) => xScale(d.step))
        .y((d) => yScale(d.logDist))
        .curve(d3.curveLinear);
      g.append('path').datum(gdData).attr('fill', 'none').attr('stroke', '#e25b5b').attr('stroke-width', 2).attr('opacity', 0.75).attr('d', line);
    }
    g.selectAll('.gd-dot')
      .data(gdData.filter((_, i) => i <= currentStep))
      .enter()
      .append('circle')
      .attr('class', 'gd-dot')
      .attr('cx', (d) => xScale(d.step))
      .attr('cy', (d) => yScale(d.logDist))
      .attr('r', 2.5)
      .attr('fill', '#e25b5b')
      .attr('opacity', 0.8);

    // Legend
    const legend = g.append('g').attr('transform', `translate(${WIDTH - 130}, 10)`);
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('fill', '#f08a5d');
    legend.append('text').attr('x', 12).attr('y', 4).attr('font-size', '12px').attr('fill', '#2d3436').text('Newton');
    legend.append('circle').attr('cx', 0).attr('cy', 18).attr('r', 5).attr('fill', '#e25b5b');
    legend.append('text').attr('x', 12).attr('y', 22).attr('font-size', '12px').attr('fill', '#2d3436').text('Gradient Ascent');

    // Title
    g.append('text')
      .attr('x', WIDTH / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1a3a5c')
      .text('到最优解的距离随迭代步数的变化');
  }, [newtonHistory, gdHistory, currentStep]);

  return <svg ref={svgRef} viewBox="0 0 560 360" className="w-full h-auto" style={{ maxHeight: 360 }} />;
}

/* ------------------------------------------------------------------ */
/*  comparison table data                                                */
/* ------------------------------------------------------------------ */
interface ComparisonRow {
  aspect: string;
  newtonText?: string;
  newton?: string;
  gdText?: string;
  gd?: string;
}

const comparisonRows: ComparisonRow[] = [
  {
    aspect: '更新方向',
    newtonText: '使用 Hessian 逆矩阵校正梯度方向：',
    newton: String.raw`\theta - H^{-1}\nabla\ell`,
    gdText: '仅沿梯度方向：',
    gd: String.raw`\theta + \alpha\nabla\ell`,
  },
  {
    aspect: '学习率',
    newtonText: '无需手动选择，Hessian 自动决定步长',
    gdText: '必须手动调参 α，过大震荡，过小收敛慢',
  },
  {
    aspect: '收敛速度',
    newtonText: '二次收敛（附近误差平方级下降）',
    gdText: '线性收敛（误差按固定比例下降）',
  },
  {
    aspect: '每步计算量',
    newtonText: '需计算并求逆 Hessian，O(n³)',
    gdText: '只需计算梯度，O(n)',
  },
  {
    aspect: '适用规模',
    newtonText: '特征维度 n 较小（通常 n < 1,000）',
    gdText: '大规模、在线学习场景',
  },
  {
    aspect: '对初始点',
    newtonText: '在非凸问题上较敏感',
    gdText: '相对更鲁棒',
  },
];

/* ------------------------------------------------------------------ */
/*  main page                                                            */
/* ------------------------------------------------------------------ */
export default function NewtonPage() {
  const [theta0, setTheta0] = useState(-3.5);
  const [gdAlpha, setGdAlpha] = useState(0.25);
  const [maxSteps, setMaxSteps] = useState(12);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const newtonHistory = useMemo(() => runNewton(theta0, maxSteps), [theta0, maxSteps]);
  const gdHistory = useMemo(() => runGradientAscent(theta0, gdAlpha, maxSteps), [theta0, gdAlpha, maxSteps]);
  const maxHistoryLength = Math.max(newtonHistory.length, gdHistory.length);

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      const frameInterval = 600 / speed;

      if (elapsed >= frameInterval) {
        lastTimeRef.current = timestamp;
        setCurrentStep((prev) => {
          if (prev >= maxHistoryLength - 1) {
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
    [isPlaying, maxHistoryLength, speed]
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
    if (currentStep >= maxHistoryLength - 1) setCurrentStep(0);
    setIsPlaying(true);
  };
  const pauseAnimation = () => setIsPlaying(false);
  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(Number(e.target.value));
    setIsPlaying(false);
  };

  const currentNewtonTheta = newtonHistory[Math.min(currentStep, newtonHistory.length - 1)];
  const currentGdTheta = gdHistory[Math.min(currentStep, gdHistory.length - 1)];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <p className="mb-8 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>

      <h1 className="text-3xl font-bold text-deep-blue mb-2">牛顿法</h1>
      <p className="text-med-gray mb-6">Newton's Method for Logistic Regression</p>

      {/* ─── Core Analogy ───────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-700" />
            核心类比：用"地形曲率"爬山
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 梯度上升：只看坡度
              </h4>
              <p className="text-sm text-orange-700 leading-relaxed">
                像一位登山者蒙着眼睛，只根据脚下的坡度决定方向。坡度大就多走一点，坡度小就少走一点。
                但坡度本身不能告诉你前方是平缓高原还是陡峭悬崖，容易走弯路或迈不准步长。
              </p>
            </div>
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> 牛顿法：也看地形弯曲程度
              </h4>
              <p className="text-sm text-orange-700 leading-relaxed">
                像登山者睁开了眼睛，不仅看坡度，还看地面弯曲的程度（曲率）。
                如果前方很陡，就少迈一点；如果很平缓，就大步向前。这样往往只需几步就能登顶。
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/60 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800 leading-relaxed">
              <strong>类比：</strong>梯度下降/上升只使用一阶信息（梯度），像盲人摸路；牛顿法还使用二阶信息（Hessian / 曲率），像开了 GPS 一样直接奔向目标。
            </p>
          </div>
        </div>
      </section>

      {/* ─── Newton Update ──────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">牛顿更新公式</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          在逻辑回归中，我们的目标是最大化对数似然函数 <KaTeX math={String.raw`\ell(\theta)`} />。
          牛顿法通过在当前参数处用二次函数近似目标函数，然后直接跳到该二次近似的极值点。
        </p>

        <FormulaCard
          title="牛顿法迭代规则"
          formula={<KaTeX math={String.raw`\theta := \theta - H^{-1} \nabla_{\theta} \ell(\theta)`} display />}
          description={
            <>
              其中 <KaTeX math={String.raw`\nabla_{\theta} \ell(\theta)`} /> 是梯度，
              <KaTeX math={String.raw`H`} /> 是 Hessian 矩阵（二阶偏导数矩阵）。
              在逻辑回归中，<KaTeX math={String.raw`\ell`} /> 是凹函数，Hessian 负定，因此该更新等价于沿着正确的上升方向自动调整步长。
            </>
          }
        />

        <p className="text-dark-gray leading-relaxed mt-4 mb-4">
          对于一维情形，公式退化为：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\theta := \theta - \frac{\ell'(\theta)}{\ell''(\theta)}`} display />
        </div>

        <p className="text-dark-gray leading-relaxed mt-4">
           直观地，分母 <KaTeX math={String.raw`\ell''(\theta)`} /> 反映了函数的曲率：曲率越大（越"尖"），步长自动越小；曲率越小（越"平"），步长自动越大。
        </p>
      </section>

      {/* ─── Logistic Regression Hessian ────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">逻辑回归的 Hessian 矩阵</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          回忆逻辑回归的假设函数为 sigmoid：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`h_\theta(x) = \frac{1}{1 + e^{-\theta^T x}}`} display />
        </div>

        <p className="text-dark-gray leading-relaxed mb-4">
          单个样本的对数似然为：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\ell_i(\theta) = y^{(i)} \log h_\theta(x^{(i)}) + (1 - y^{(i)}) \log\bigl(1 - h_\theta(x^{(i)})\bigr)`} display />
        </div>

        <p className="text-dark-gray leading-relaxed mb-4">
          对整个训练集求和得到 <KaTeX math={String.raw`\ell(\theta)`} />。其一阶导数（梯度）和二阶导数（Hessian）分别为：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`\nabla_\theta \ell(\theta) = \sum_{i=1}^{m} \bigl(y^{(i)} - h_\theta(x^{(i)})\bigr) x^{(i)}`} display />
        </div>

        <div className="formula-block">
          <KaTeX math={String.raw`H = \nabla_\theta^2 \ell(\theta) = -\sum_{i=1}^{m} h_\theta(x^{(i)}) \bigl(1 - h_\theta(x^{(i)})\bigr) x^{(i)} (x^{(i)})^T`} display />
        </div>

        <p className="text-dark-gray leading-relaxed mb-4">
          写成更紧凑的矩阵形式：
        </p>

        <div className="formula-block">
          <KaTeX math={String.raw`H = -X^T W X \quad \text{其中} \quad W = \mathrm{diag}\bigl(h_\theta(x^{(i)})(1 - h_\theta(x^{(i)}))\bigr)`} display />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-4">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            为什么 Hessian 是负定的？
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            因为 <KaTeX math={String.raw`0 < h_\theta(x)(1 - h_\theta(x)) \le \frac{1}{4}`} />，
            所以对任意非零向量 <KaTeX math={String.raw`v`} /> 都有
            <KaTeX math={String.raw`v^T H v = -\sum_i h_i(1-h_i) (v^T x^{(i)})^2 \le 0`} />。
            这说明对数似然函数 <KaTeX math={String.raw`\ell(\theta)`} /> 是凹函数，牛顿法更新
            <KaTeX math={String.raw`\theta - H^{-1}\nabla\ell`} /> 实际上是在向最大值移动。
          </p>
        </div>
      </section>

      {/* ─── Quadratic Convergence ──────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">为什么牛顿法收敛更快？</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          梯度下降/上升只利用了目标函数在当前点的一阶信息，因此每次迭代误差的下降比例大致是常数，称为
          <strong>线性收敛</strong>。而牛顿法利用了二阶信息，在当前点用一个二次函数去近似原函数，
          然后直接跳到该二次近似的极值点。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <h4 className="font-semibold text-deep-blue text-sm mb-2">梯度法（线性收敛）</h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              当接近最优解时，误差满足：
            </p>
            <div className="formula-block bg-gray-50 border-gray-100">
              <KaTeX math={String.raw`\|\theta_{t+1} - \theta^*\| \le c \cdot \|\theta_t - \theta^*\|`} display />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              每一步误差按固定比例 <KaTeX math={String.raw`c`} /> 缩小，收敛速度较慢。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-card border border-gray-200 p-4">
            <h4 className="font-semibold text-deep-blue text-sm mb-2">牛顿法（二次收敛）</h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              当接近最优解时，误差满足：
            </p>
            <div className="formula-block bg-gray-50 border-gray-100">
              <KaTeX math={String.raw`\|\theta_{t+1} - \theta^*\| \le C \cdot \|\theta_t - \theta^*\|^2`} display />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              每一步误差按<strong>平方</strong>缩小，正确位数近似翻倍，收敛极快。
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-emerald-700" />
            二次收敛的直观理解
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed">
            假设当前解已经有 3 位小数准确。线性收敛的算法下一步可能达到 4 位准确，
            而二次收敛的牛顿法下一步可能直接达到 6 位准确。也就是说，越接近答案，牛顿法越"神准"，
            这也是为什么它通常只需十几次甚至几次迭代就能收敛到机器精度。
          </p>
        </div>
      </section>

      {/* ─── Comparison with Gradient Descent ───────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">与梯度下降的对比</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          这里的"梯度下降"是相对于最大化 <KaTeX math={String.raw`\ell(\theta)`} /> 的梯度上升而言；
          两者本质相同，只是方向相反。下表从多个维度对比牛顿法与梯度法：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-gray rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">对比维度</th>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">牛顿法</th>
                <th className="text-left px-4 py-3 text-blue-800 font-semibold border-b border-border-gray">梯度下降/上升</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.aspect} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-dark-gray border-b border-border-gray">{row.aspect}</td>
                  <td className="px-4 py-3 text-dark-gray border-b border-border-gray">
                    {row.newtonText && <span className="mr-1">{row.newtonText}</span>}
                    {row.newton && <KaTeX math={row.newton} />}
                  </td>
                  <td className="px-4 py-3 text-dark-gray border-b border-border-gray">
                    {row.gdText && <span className="mr-1">{row.gdText}</span>}
                    {row.gd && <KaTeX math={row.gd} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Interactive Demo ───────────────────────────────────────── */}
      <section className="mb-10">
        <InteractiveDemo title="交互式演示：牛顿法 vs 梯度上升">
          <InteractivePanel
            hint="调整初始点 θ₀ 和梯度上升学习率 α，观察牛顿法与梯度上升在 1D 逻辑回归对数似然上的收敛轨迹。下图纵轴为 log₁₀|θ − θ*|，下降越快表示收敛越迅速。"
            chart={
              <div className="space-y-4">
                <NewtonComparisonChart newtonHistory={newtonHistory} gdHistory={gdHistory} currentStep={currentStep} />
                <StepChart newtonHistory={newtonHistory} gdHistory={gdHistory} currentStep={currentStep} />
              </div>
            }
            controls={
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    初始点 θ₀: <span className="font-mono text-med-blue">{theta0.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min={-4.5}
                    max={4.5}
                    step={0.1}
                    value={theta0}
                    onChange={(e) => {
                      setTheta0(Number(e.target.value));
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                    className="w-full accent-med-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    梯度上升学习率 α: <span className="font-mono text-med-blue">{gdAlpha.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={gdAlpha}
                    onChange={(e) => {
                      setGdAlpha(Number(e.target.value));
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                    className="w-full accent-med-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    最大迭代步数: <span className="font-mono text-med-blue">{maxSteps}</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={maxSteps}
                    onChange={(e) => {
                      setMaxSteps(Number(e.target.value));
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                    className="w-full accent-med-blue"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={playAnimation}
                    disabled={isPlaying}
                    className="px-4 py-2 bg-med-blue text-white rounded-lg font-medium text-sm hover:bg-deep-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">速度:</span>
                  {[1, 2, 4].map((s) => (
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">步数:</span>
                  <input
                    type="range"
                    min={0}
                    max={maxHistoryLength - 1}
                    value={Math.min(currentStep, maxHistoryLength - 1)}
                    onChange={handleSlider}
                    className="flex-grow accent-med-blue"
                  />
                  <span className="text-sm text-gray-700 font-mono min-w-[3ch]">{currentStep}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-dark-gray font-medium">当前状态：</p>
                  <div className="bg-gray-50 border border-border-gray rounded-lg p-3 space-y-1">
                    <p className="text-dark-gray">
                      牛顿法 θ = <span className="font-mono text-med-blue">{currentNewtonTheta.toFixed(6)}</span>
                    </p>
                    <p className="text-dark-gray">
                      梯度上升 θ = <span className="font-mono text-med-blue">{currentGdTheta.toFixed(6)}</span>
                    </p>
                    <p className="text-dark-gray">
                      ℓ(θ*) ≈ <span className="font-mono text-med-blue">{logLikelihood(currentNewtonTheta).toFixed(4)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-med-gray space-y-1">
                  <p className="font-medium">观察要点：</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>牛顿法通常在 3-5 步内让 log|θ − θ*| 急剧下降</li>
                    <li>梯度上升对学习率 α 敏感，距离下降慢得多</li>
                    <li>初始点远离最优时，两种方法的差距更明显</li>
                  </ol>
                </div>
              </div>
            }
          />
        </InteractiveDemo>
      </section>

      {/* ─── Summary ────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Pin className="w-6 h-6 text-blue-700" />
            小结
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
              <span>
                牛顿法通过 <KaTeX math={String.raw`\theta := \theta - H^{-1}\nabla\ell(\theta)`} /> 同时利用梯度和曲率信息优化参数。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
              <span>
                逻辑回归的 Hessian 为 <KaTeX math={String.raw`H = -X^T W X`} />，
                其中 <KaTeX math={String.raw`W`} /> 是对角权重矩阵。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
              <span>
                牛顿法具有<strong>二次收敛</strong>特性，通常比梯度下降的线性收敛快得多。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
              <span>
                代价是每次迭代需要计算并求逆 Hessian，O(n³) 复杂度，因此适用于特征维度不是特别大的场景。
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
