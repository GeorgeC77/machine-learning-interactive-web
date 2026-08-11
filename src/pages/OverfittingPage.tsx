import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BookOpen, Frown, Glasses, Brain, SlidersHorizontal, Scale, Square, Leaf } from 'lucide-react';
import KaTeX from '../components/KaTeX';
import FormulaCard from '../components/FormulaCard';
import InteractiveDemo from '../components/InteractiveDemo';
import InteractivePanel from '../components/InteractivePanel';

/* ------------------------------------------------------------------ */
/*  多项式回归辅助函数                                                  */
/* ------------------------------------------------------------------ */

/** Construct Vandermonde-like design matrix for polynomial of given degree */
function polyDesignMatrix(xs: number[], degree: number): number[][] {
  return xs.map((x) => {
    const row: number[] = [];
    for (let d = 0; d <= degree; d++) row.push(x ** d);
    return row;
  });
}

/** Solve regularized normal equations with small ridge stabilization. */
function solveRegularizedNormalEquation(X: number[][], y: number[]): number[] {
  /* Gram matrix approach with ridge-like stabilization */
  const n = X[0].length;
  const m = X.length;
  const Xt = Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => X[i][j]));
  const XtX = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Xt[i].reduce((s, _, k) => s + Xt[i][k] * Xt[j][k], 0))
  );
  /* add small ridge for numerical stability */
  for (let i = 0; i < n; i++) XtX[i][i] += 1e-6;
  const Xty = Xt.map((row) => row.reduce((s, v, i) => s + v * y[i], 0));
  return solveLinear(XtX, Xty);
}

/** Gaussian elimination with partial pivoting */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let j = col; j <= n; j++) M[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}

function predictPoly(theta: number[], x: number): number {
  return theta.reduce((s, t, d) => s + t * (x ** d), 0);
}

function mse(yTrue: number[], yPred: number[]): number {
  return yTrue.reduce((s, v, i) => s + (v - yPred[i]) ** 2, 0) / yTrue.length;
}

/* ------------------------------------------------------------------ */
/*  data generation: train + test sets from quadratic + noise           */
/* ------------------------------------------------------------------ */
function generateData(seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const pts: { x: number; y: number }[] = [];
  const xs = d3.range(0, 10, 10 / 15).map((v) => v + 0.3);
  xs.forEach((x) => {
    const noise = (rand() - 0.5) * 3;
    pts.push({ x: Math.max(0.1, Math.min(9.9, x)), y: 2 + 1.5 * x - 0.12 * x * x + noise });
  });
  return pts;
}

function underlyingFunction(x: number) {
  return 2 + 1.5 * x - 0.12 * x * x;
}

function generateTestData(seed = 1234) {
  return generateData(seed).map((p) => {
    const shiftedX = Math.max(0.1, Math.min(9.9, p.x + 0.25));
    const noise = p.y - underlyingFunction(p.x);
    return { x: shiftedX, y: underlyingFunction(shiftedX) + noise };
  });
}

const FIXED_Y_DOMAIN: [number, number] = [-4, 10];

/* ------------------------------------------------------------------ */
/*  D3 Polynomial Fit Chart                                              */
/* ------------------------------------------------------------------ */
function PolynomialFitChart({
  points,
  testPoints,
  theta1,
  theta2,
  thetaOver,
  overDegree,
  onClipped,
}: {
  points: { x: number; y: number }[];
  testPoints: { x: number; y: number }[];
  theta1: number[];
  theta2: number[];
  thetaOver: number[];
  overDegree: number;
  onClipped?: (clipped: boolean) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    /* clipPath to prevent curves from drawing outside */
    const defs = svg.append('defs');
    defs
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerW)
      .attr('height', innerH);

    const xMin = -0.5;
    const xMax = 10.5;
    const [yMin, yMax] = FIXED_Y_DOMAIN;

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([margin.left, margin.left + innerW]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([margin.top + innerH, margin.top]);

    /* axes */
    svg
      .append('g')
      .attr('transform', `translate(0,${margin.top + innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .append('text')
      .attr('x', margin.left + innerW / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .text('x');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerH / 2))
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .text('y');

    /* all data elements inside clipped group */
    const clipG = svg.append('g').attr('clip-path', 'url(#chart-clip)');

    /* helper to draw a polynomial curve; tracks whether any point was clipped */
    const drawCurve = (theta: number[], color: string, width_: number, dash?: string) => {
      const step = 0.05;
      const curveData: { x: number; y: number }[] = [];
      let clipped = false;
      for (let x = xMin; x <= xMax; x += step) {
        const y = predictPoly(theta, x);
        if (y < yMin || y > yMax) clipped = true;
        /* clamp y values */
        const yClamped = Math.max(yMin - 1, Math.min(yMax + 1, y));
        curveData.push({ x: xScale(x), y: yScale(yClamped) });
      }
      const line = d3
        .line<{ x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveBasis);

      clipG
        .append('path')
        .datum(curveData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', width_)
        .attr('stroke-dasharray', dash || 'none');
      return clipped;
    };

    /* draw three curves */
    drawCurve(theta1, '#f08a5d', 2.5);   /* underfit: linear */
    drawCurve(theta2, '#3a7bd5', 2.5);   /* good fit: quadratic */
    let overClipped = false;
    if (overDegree >= 3) {
      overClipped = drawCurve(thetaOver, '#e25b5b', 2, '4,3'); /* overfit: variable degree */
    }
    onClipped?.(overClipped);

    /* training data points */
    clipG
      .selectAll('circle.data')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4.5)
      .attr('fill', '#2d3436')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    /* test data points (hollow) */
    clipG
      .selectAll('circle.test')
      .data(testPoints)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', 'none')
      .attr('stroke', '#636e72')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.7);

    /* legend */
    const legend = svg.append('g').attr('transform', `translate(${margin.left + 10}, ${margin.top + 10})`);
    const items = [
      { color: '#f08a5d', label: '欠拟合 (线性, d=1)', dash: 'none' },
      { color: '#3a7bd5', label: '良好拟合 (二次, d=2)', dash: 'none' },
      ...(overDegree >= 3 ? [{ color: '#e25b5b', label: `过拟合 (d=${overDegree})`, dash: '4,3' }] : []),
    ];
    items.forEach((item, i) => {
      const ly = i * 18;
      legend
        .append('line')
        .attr('x1', 0)
        .attr('y1', ly + 6)
        .attr('x2', 20)
        .attr('y2', ly + 6)
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dash);
      legend
        .append('text')
        .attr('x', 26)
        .attr('y', ly + 10)
        .attr('fill', '#636e72')
        .attr('font-size', '11px')
        .attr('font-family', 'Inter, sans-serif')
        .text(item.label);
    });
  }, [points, testPoints, theta1, theta2, thetaOver, overDegree, onClipped]);

  return <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: 400 }} />;
}

/* ------------------------------------------------------------------ */
/*  main page                                                            */
/* ------------------------------------------------------------------ */
export default function OverfittingPage() {
  const [seed, setSeed] = useState(42);
  const [noiseLevel, setNoiseLevel] = useState(1.0);
  const [degree, setDegree] = useState(12);
  const [clipped, setClipped] = useState(false);

  const { points, testPoints } = useMemo(() => {
    const base = generateData(seed);
    const train = base.map((p) => ({
      ...p,
      y: underlyingFunction(p.x) + (p.y - underlyingFunction(p.x)) * noiseLevel,
    }));
    const testBase = generateTestData(seed + 999);
    const test = testBase.map((p) => ({
      ...p,
      y: underlyingFunction(p.x) + (p.y - underlyingFunction(p.x)) * noiseLevel,
    }));
    return { points: train, testPoints: test };
  }, [seed, noiseLevel]);

  const xs = useMemo(() => points.map((p) => p.x), [points]);
  const ys = useMemo(() => points.map((p) => p.y), [points]);
  const testXs = useMemo(() => testPoints.map((p) => p.x), [testPoints]);
  const testYs = useMemo(() => testPoints.map((p) => p.y), [testPoints]);

  const theta1 = useMemo(() => solveRegularizedNormalEquation(polyDesignMatrix(xs, 1), ys), [xs, ys]);
  const theta2 = useMemo(() => solveRegularizedNormalEquation(polyDesignMatrix(xs, 2), ys), [xs, ys]);
  const thetaOver = useMemo(() => solveRegularizedNormalEquation(polyDesignMatrix(xs, degree), ys), [xs, ys, degree]);

  const trainMse1 = useMemo(() => mse(ys, xs.map((x) => predictPoly(theta1, x))), [ys, xs, theta1]);
  const trainMse2 = useMemo(() => mse(ys, xs.map((x) => predictPoly(theta2, x))), [ys, xs, theta2]);
  const trainMseOver = useMemo(() => mse(ys, xs.map((x) => predictPoly(thetaOver, x))), [ys, xs, thetaOver]);

  const testMse1 = useMemo(() => mse(testYs, testXs.map((x) => predictPoly(theta1, x))), [testYs, testXs, theta1]);
  const testMse2 = useMemo(() => mse(testYs, testXs.map((x) => predictPoly(theta2, x))), [testYs, testXs, theta2]);
  const testMseOver = useMemo(() => mse(testYs, testXs.map((x) => predictPoly(thetaOver, x))), [testYs, testXs, thetaOver]);

  const regenerate = () => setSeed((s) => (s + 37) % 10000);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-deep-blue mb-6">过拟合与欠拟合</h1>
      <p className="text-med-gray mb-8 leading-relaxed">
        模型的复杂度需要在"过于简单"和"过于复杂"之间取得平衡。本节通过多项式拟合的直观对比，理解偏差与方差的核心矛盾。
      </p>

      {/* ─── Exam Analogy (Introduction) ─────────────────────────── */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-700" />
            核心类比：考试备考的三种状态
          </h3>
          <p className="text-indigo-700 leading-relaxed mb-4">
            想象你正在准备一场数学考试。老师给了 100 道练习题，考试的题目会从相似的题库中抽取。
            你的备考方式决定了你的考试成绩——模型拟合也是如此。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                <Frown className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 欠拟合 = 根本没学习
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                你连数学公式都没看过，直接去考试。练习题不会做，考试更是一塌糊涂。
                模型根本没有学到数据中的规律，训练误差高，测试误差也高。
              </p>
            </div>
            <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                <Glasses className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 好拟合 = 理解原理，举一反三
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                你认真学习了数学原理，理解了公式推导。练习题做得不错，
                考试时即使遇到新题型也能用所学知识解决。模型学到了数据的真实规律，
                泛化能力强。
              </p>
            </div>
            <div className="bg-white/80 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 过拟合 = 死记硬背练习题
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                你把 100 道练习题连同答案背得滚瓜烂熟，每道题都记得数字，
                但完全不理解背后的数学原理。练习题全对（训练误差极低），
                但考试题目稍一变数字你就不会了（测试误差高）。
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/60 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm text-indigo-800 leading-relaxed">
              <strong>贯穿全页的类比：</strong>欠拟合 = 学得太少（高偏差），好拟合 = 学得刚好（偏差方差平衡），
              过拟合 = 学得太"死"（高方差）。我们的目标是找到一个"理解原理"的模型，而不是"死记硬背"的模型。
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Underfitting */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">欠拟合（高偏差）</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          当模型过于简单，无法捕捉数据中的真实模式时，就会发生欠拟合。例如用一条直线去拟合明显呈抛物线分布的数据点。
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-4">
          <p className="text-orange-800 text-sm font-medium mb-1">特征</p>
          <ul className="text-orange-700 text-sm list-disc list-inside space-y-1">
            <li>训练误差高，测试误差也高</li>
            <li>模型未能学到数据中的有效模式</li>
            <li>增加特征数量或提高模型复杂度可以缓解</li>
          </ul>
        </div>
      </section>

      {/* Section 2 — Overfitting */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">过拟合（高方差）</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          当模型过于复杂（例如使用过高阶的多项式），它会不仅拟合数据的真实模式，还拟合了随机噪声。这样的模型在训练集上表现很好，但在新数据上表现差。
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-red-800 text-sm font-medium mb-1">特征</p>
          <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
            <li>训练误差很低，但测试误差很高</li>
            <li>模型对训练数据中的噪声过度敏感</li>
            <li>减少特征数量、增加训练数据或使用正则化可以缓解</li>
          </ul>
        </div>
      </section>

      {/* ─── Model Complexity Intuition ──────────────────────────── */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-teal-800 mb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-teal-700" />
            模型复杂度的直觉：用多少个数字描述一个人？
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 text-sm mb-2">1 个数字（参数少 = 简单模型）</h4>
                <p className="text-xs text-orange-700 leading-relaxed">
                  只用"年龄"来描述一个人。显然太粗糙了——两个同龄的人可能天差地别。
                  简单模型可能遗漏关键信息，无法捕捉复杂模式（欠拟合）。
                </p>
              </div>
              <div className="bg-white/80 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">10 个数字（参数适中 = 好模型）</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  用年龄、职业、教育、爱好等 10 个维度描述。恰到好处——
                  能较全面地刻画一个人，又不会过度复杂。
                </p>
              </div>
              <div className="bg-white/80 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 text-sm mb-2">1000 个数字（参数多 = 复杂模型）</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  连"左脚第3根脚趾长度""上周三晚餐吃什么"都记录。虽然"精确"，
                  但这些细节大多是噪声，换个时间再测全变了。模型对数据过度敏感（过拟合）。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-teal-200 rounded-lg p-3">
              <p className="text-sm text-teal-800 leading-relaxed">
                <strong>核心启示：</strong>参数数量就像描述的精细度。太少则描述模糊（欠拟合），
                太多则纠结于无关细节（过拟合）。好的模型应该像一份精炼的简历——抓住关键信息，忽略噪声。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Bias-Variance Tradeoff */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">偏差-方差权衡</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          偏差（Bias）衡量模型的期望预测与真实值之间的差距，方差（Variance）衡量模型对不同训练集的敏感度。二者之间存在此消彼长的关系：
        </p>

        {/* Bias-Variance Intuition */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-5 mb-4">
          <h3 className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
            <Scale className="w-6 h-6 text-rose-700" />
            偏差-方差 tradeoff 的直觉：固执的人 vs 墙头草
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/80 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                  <Square className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 高偏差 = 固执的人
                </h4>
                <p className="text-sm text-orange-700 leading-relaxed">
                  偏差高意味着模型有"偏见"——无论看到什么数据，它总是朝某个方向错。
                  就像一个固执的老人，"我认定世界就是这样，你们说什么都没用"。
                  换一批数据，他的观点也基本不变（低方差），但永远是错的（高偏差）。
                </p>
              </div>
              <div className="bg-white/80 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 高方差 = 墙头草
                </h4>
                <p className="text-sm text-red-700 leading-relaxed">
                  方差高意味着模型"敏感"——换个训练集，模型参数就大变。
                  就像墙头草，今天听张三说觉得对，明天听李四说又觉得李四对。
                  他对每个观点都"拟合"得很好，但没有自己的主见，无法形成稳定判断。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-rose-200 rounded-lg p-3">
              <p className="text-sm text-rose-800 leading-relaxed">
                <strong>好的模型 = 有主见但能听取新意见：</strong>既不会因为固执而一直犯错（低偏差），
                也不会因为敏感而观点飘忽不定（低方差）。它在偏差和方差之间找到了最佳平衡点，
                就像一个有智慧的人——有自己的核心判断，同时也能根据新证据调整自己的认知。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="bg-white border border-border-gray rounded-xl p-5">
            <h4 className="text-lg font-semibold text-warm-orange mb-2">高偏差 · 低方差</h4>
            <p className="text-sm text-med-gray leading-relaxed">
              模型过于简单，无论换什么训练数据都得到相似的参数。训练误差和测试误差都很高。
            </p>
          </div>
          <div className="bg-white border border-border-gray rounded-xl p-5">
            <h4 className="text-lg font-semibold text-soft-red mb-2">低偏差 · 高方差</h4>
            <p className="text-sm text-med-gray leading-relaxed">
              模型过于复杂，对训练数据极度敏感。训练误差低但测试误差高，泛化能力差。
            </p>
          </div>
        </div>
        <p className="text-dark-gray leading-relaxed">
          机器学习的核心目标之一，就是在偏差和方差之间找到最佳平衡点，使得模型的泛化误差最小。
        </p>
      </section>

      {/* Section 4 — Regularization */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">正则化</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          正则化是在代价函数中添加惩罚项，抑制过大的参数值，从而防止过拟合。L2 正则化（岭回归）的代价函数为：
        </p>
        <FormulaCard
          title="L2 正则化代价函数"
          formula={
            <KaTeX
              math={String.raw`J(\theta) = \frac{1}{2m} \sum_{i=1}^m (h_\theta(x^{(i)}) - y^{(i)})^2 + \lambda \sum_{j=1}^n \theta_j^2`}
              display
            />
          }
          description={
            <>
              λ 是正则化参数，控制惩罚力度。λ 过大导致欠拟合，λ 过小则无法有效防止过拟合。注意 θ<sub>0</sub> 不参与正则化。
            </>
          }
        />
      </section>

      {/* Section 5 — Interactive Visualization */}
      <section className="mb-10">
        <InteractiveDemo title="交互式可视化：多项式拟合对比">
          <InteractivePanel
            hint={`橙色=线性欠拟合，蓝色=二次良好拟合，红色虚线=${degree}次过拟合；空心圆=测试点`}
            chart={<PolynomialFitChart points={points} testPoints={testPoints} theta1={theta1} theta2={theta2} thetaOver={thetaOver} overDegree={degree} onClipped={setClipped} />}
            controls={
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    噪声强度: {noiseLevel.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    aria-label="噪声强度"
                    min={0}
                    max={2.5}
                    step={0.1}
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(Number(e.target.value))}
                    className="w-full accent-med-blue"
                  />
                  <div className="flex justify-between text-xs text-med-gray mt-1">
                    <span>无噪声</span>
                    <span>强噪声</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-2">
                    过拟合多项式次数: {degree}
                  </label>
                  <input
                    type="range"
                    aria-label="过拟合多项式次数"
                    min={1}
                    max={20}
                    step={1}
                    value={degree}
                    onChange={(e) => setDegree(Number(e.target.value))}
                    className="w-full accent-soft-red"
                  />
                  <div className="flex justify-between text-xs text-med-gray mt-1">
                    <span>1次</span>
                    <span>20次</span>
                  </div>
                </div>

                <button
                  onClick={regenerate}
                  className="w-full px-4 py-2 bg-med-blue text-white rounded-lg hover:bg-deep-blue transition-colors text-sm font-medium"
                >
                  重新生成数据
                </button>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-dark-gray">训练 MSE 对比</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <span className="text-orange-800">线性 (d=1)</span>
                      <span className="font-mono text-orange-700">{trainMse1.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <span className="text-blue-800">二次 (d=2)</span>
                      <span className="font-mono text-blue-700">{trainMse2.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <span className="text-red-800">{degree}次 (d={degree})</span>
                      <span className="font-mono text-red-700">{trainMseOver.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-dark-gray">测试 MSE 对比</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <span className="text-orange-800">线性 (d=1)</span>
                      <span className="font-mono text-orange-700">{testMse1.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <span className="text-blue-800">二次 (d=2)</span>
                      <span className="font-mono text-blue-700">{testMse2.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <span className="text-red-800">{degree}次 (d={degree})</span>
                      <span className="font-mono text-red-700">{testMseOver.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                {clipped && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    警告：当前高次多项式曲线已超出固定 y 轴显示范围，部分剧烈波动被裁剪。
                  </div>
                )}

                <div className="text-xs text-med-gray space-y-1">
                  <p className="font-medium text-dark-gray">观察要点：</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>线性模型无法捕捉抛物线趋势</li>
                    <li>二次模型恰好匹配数据生成方式</li>
                    <li>{degree}次多项式穿过训练噪声点，波动剧烈</li>
                    <li>当前高次模型的训练 MSE 较低，但测试 MSE 通常更高，泛化能力差</li>
                  </ol>
                </div>
              </div>
            }
          />
        </InteractiveDemo>
      </section>

      {/* Summary */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">实践建议</h2>
        <div className="bg-white border border-border-gray rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-med-blue font-bold text-lg">1</span>
            <p className="text-dark-gray text-sm leading-relaxed">
              <strong className="text-dark-gray">观察学习曲线</strong>：通过训练误差和验证误差随数据量或模型复杂度的变化，判断是否存在欠拟合或过拟合。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-med-blue font-bold text-lg">2</span>
            <p className="text-dark-gray text-sm leading-relaxed">
              <strong className="text-dark-gray">交叉验证</strong>：使用 K 折交叉验证来估计模型的泛化性能，选择最佳的模型复杂度。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-med-blue font-bold text-lg">3</span>
            <p className="text-dark-gray text-sm leading-relaxed">
              <strong className="text-dark-gray">正则化调参</strong>：对 λ 进行网格搜索，在验证集上选择使误差最小的正则化强度。
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-med-blue font-bold text-lg">4</span>
            <p className="text-dark-gray text-sm leading-relaxed">
              <strong className="text-dark-gray">增加数据</strong>：对于高方差（过拟合）问题，增加训练数据通常是最有效的解决方案。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
