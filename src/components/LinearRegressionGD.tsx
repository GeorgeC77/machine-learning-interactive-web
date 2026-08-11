import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import KaTeX from './KaTeX';

interface DataPoint {
  x: number;
  y: number;
}

function generateData(): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 10;
    const noise = (Math.random() - 0.5) * 4;
    points.push({ x, y: 1 + 2 * x + noise });
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
  if (Math.abs(denom) < 1e-12) return { theta0: 0, theta1: 0 };
  const theta1 = (m * sumXY - sumX * sumY) / denom;
  const theta0 = (sumY - theta1 * sumX) / m;
  return { theta0, theta1 };
}

function cost(data: DataPoint[], t0: number, t1: number) {
  let s = 0;
  data.forEach((d) => {
    const err = t0 + t1 * d.x - d.y;
    s += err * err;
  });
  return s / (2 * data.length);
}

function gradient(data: DataPoint[], t0: number, t1: number) {
  let g0 = 0;
  let g1 = 0;
  const m = data.length;
  data.forEach((d) => {
    const err = t0 + t1 * d.x - d.y;
    g0 += err;
    g1 += err * d.x;
  });
  return { g0: g0 / m, g1: g1 / m };
}

type Step = { t0: number; t1: number; j: number };

function runGD(
  data: DataPoint[],
  alpha: number,
  initT0: number,
  initT1: number,
  steps = 80,
): Step[] {
  const history: Step[] = [{ t0: initT0, t1: initT1, j: cost(data, initT0, initT1) }];
  let { t0, t1 } = history[0];
  for (let i = 0; i < steps; i++) {
    const g = gradient(data, t0, t1);
    t0 -= alpha * g.g0;
    t1 -= alpha * g.g1;
    history.push({ t0, t1, j: cost(data, t0, t1) });
  }
  return history;
}

function drawFitChart(svgEl: SVGSVGElement, data: DataPoint[], t0: number, t1: number) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('font-family', 'Inter, sans-serif');

  const M = { top: 15, right: 15, bottom: 40, left: 45 };
  const W = 360;
  const H = 260;
  const IW = W - M.left - M.right;
  const IH = H - M.top - M.bottom;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const yMin = Math.min(-2, ...data.map((d) => d.y));
  const yMax = Math.max(22, ...data.map((d) => d.y));

  const xS = (x: number) => M.left + (x / 10) * IW;
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

  // regression line
  const y0 = t0 + t1 * 0;
  const y10 = t0 + t1 * 10;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(xS(0)));
  line.setAttribute('y1', String(yS(y0)));
  line.setAttribute('x2', String(xS(10)));
  line.setAttribute('y2', String(yS(y10)));
  line.setAttribute('stroke', '#2563eb');
  line.setAttribute('stroke-width', '2.5');
  svg.appendChild(line);

  // points
  data.forEach((d) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(xS(d.x)));
    circle.setAttribute('cy', String(yS(d.y)));
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

  const xl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xl.setAttribute('x', String(W / 2));
  xl.setAttribute('y', String(H - 2));
  xl.setAttribute('text-anchor', 'middle');
  xl.setAttribute('font-size', '10');
  xl.setAttribute('fill', '#4b5563');
  xl.textContent = 'x';
  svg.appendChild(xl);
}

function drawParamChart(
  svgEl: SVGSVGElement,
  data: DataPoint[],
  history: Step[],
  ols: { theta0: number; theta1: number },
  currentStep: number,
) {
  const svg = svgEl;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('font-family', 'Inter, sans-serif');

  const W = 360;
  const H = 260;
  const PAD = { top: 15, right: 15, bottom: 45, left: 55 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const t0Min = -2, t0Max = 4;
  const t1Min = 0, t1Max = 3.5;

  const toX = (t0: number) => PAD.left + ((t0 - t0Min) / (t0Max - t0Min)) * IW;
  const toY = (t1: number) => PAD.top + IH - ((t1 - t1Min) / (t1Max - t1Min)) * IH;

  // cost grid heatmap
  const GRID = 50;
  const bands = [
    { lo: 0, hi: 0.5, color: '#eff6ff' },
    { lo: 0.5, hi: 1.5, color: '#dbeafe' },
    { lo: 1.5, hi: 3, color: '#bfdbfe' },
    { lo: 3, hi: 6, color: '#93c5fd' },
    { lo: 6, hi: 12, color: '#60a5fa' },
    { lo: 12, hi: 24, color: '#3b82f6' },
    { lo: 24, hi: Infinity, color: '#1d4ed8' },
  ];
  const cellW = IW / (GRID - 1);
  const cellH = IH / (GRID - 1);
  for (let r = 0; r < GRID - 1; r++) {
    for (let c = 0; c < GRID - 1; c++) {
      const t0 = t0Min + (c / (GRID - 1)) * (t0Max - t0Min);
      const t1 = t1Min + ((GRID - 1 - r) / (GRID - 1)) * (t1Max - t1Min);
      const j = cost(data, t0, t1);
      for (const band of bands) {
        if (j >= band.lo && j < band.hi) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(toX(t0) - cellW / 2));
          rect.setAttribute('y', String(toY(t1) - cellH / 2));
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
  xAxis.setAttribute('stroke-width', '1.5');
  svg.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', String(PAD.left));
  yAxis.setAttribute('y1', String(PAD.top));
  yAxis.setAttribute('x2', String(PAD.left));
  yAxis.setAttribute('y2', String(H - PAD.bottom));
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '1.5');
  svg.appendChild(yAxis);

  for (let t0 = t0Min; t0 <= t0Max; t0 += 1) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(toX(t0)));
    text.setAttribute('y', String(H - PAD.bottom + 16));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '9');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(t0);
    svg.appendChild(text);
  }
  for (let t1 = t1Min; t1 <= t1Max; t1 += 1) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(PAD.left - 6));
    text.setAttribute('y', String(toY(t1) + 3));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '9');
    text.setAttribute('fill', '#6b7280');
    text.textContent = String(t1);
    svg.appendChild(text);
  }

  // axis titles
  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', String(W / 2));
  xTitle.setAttribute('y', String(H - 4));
  xTitle.setAttribute('text-anchor', 'middle');
  xTitle.setAttribute('font-size', '11');
  xTitle.setAttribute('fill', '#374151');
  xTitle.textContent = 'θ0';
  svg.appendChild(xTitle);

  const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitle.setAttribute('x', String(12));
  yTitle.setAttribute('y', String(H / 2));
  yTitle.setAttribute('text-anchor', 'middle');
  yTitle.setAttribute('font-size', '11');
  yTitle.setAttribute('fill', '#374151');
  yTitle.setAttribute('transform', `rotate(-90, 12, ${H / 2})`);
  yTitle.textContent = 'θ1';
  svg.appendChild(yTitle);

  // trajectory path (up to current step)
  const visible = history.slice(0, currentStep + 1);
  if (visible.length > 1) {
    const d = visible.map((s, i) => `${i === 0 ? 'M' : 'L'} ${toX(s.t0)} ${toY(s.t1)}`).join(' ');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#f59e0b');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    visible.forEach((s) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(toX(s.t0)));
      dot.setAttribute('cy', String(toY(s.t1)));
      dot.setAttribute('r', '2');
      dot.setAttribute('fill', '#f59e0b');
      svg.appendChild(dot);
    });
  }

  // OLS point
  const olsCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  olsCircle.setAttribute('cx', String(toX(ols.theta0)));
  olsCircle.setAttribute('cy', String(toY(ols.theta1)));
  olsCircle.setAttribute('r', '6');
  olsCircle.setAttribute('fill', '#10b981');
  olsCircle.setAttribute('stroke', 'white');
  olsCircle.setAttribute('stroke-width', '2');
  svg.appendChild(olsCircle);

  // current point
  const cur = visible[visible.length - 1];
  const curCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  curCircle.setAttribute('cx', String(toX(cur.t0)));
  curCircle.setAttribute('cy', String(toY(cur.t1)));
  curCircle.setAttribute('r', '5');
  curCircle.setAttribute('fill', '#ef4444');
  curCircle.setAttribute('stroke', 'white');
  curCircle.setAttribute('stroke-width', '2');
  svg.appendChild(curCircle);

  // legend
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('transform', `translate(${W - 130}, ${PAD.top + 8})`);
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '110');
  bg.setAttribute('height', '58');
  bg.setAttribute('rx', '5');
  bg.setAttribute('fill', 'white');
  bg.setAttribute('stroke', '#e5e7eb');
  legend.appendChild(bg);

  const items = [
    { cx: 14, cy: 18, color: '#10b981', text: 'OLS 解' },
    { cx: 14, cy: 40, color: '#ef4444', text: '当前 θ' },
  ];
  items.forEach((it) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(it.cx));
    c.setAttribute('cy', String(it.cy));
    c.setAttribute('r', '5');
    c.setAttribute('fill', it.color);
    legend.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(it.cx + 10));
    t.setAttribute('y', String(it.cy + 3));
    t.setAttribute('font-size', '9');
    t.setAttribute('fill', '#374151');
    t.textContent = it.text;
    legend.appendChild(t);
  });
  svg.appendChild(legend);
}

export default function LinearRegressionGD() {
  const data = useMemo(() => generateData(), []);
  const ols = useMemo(() => computeOLS(data), [data]);

  const [initT0, setInitT0] = useState(-1);
  const [initT1, setInitT1] = useState(0.5);
  const [alpha, setAlpha] = useState(0.05);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const history = useMemo(() => runGD(data, alpha, initT0, initT1, 100), [data, alpha, initT0, initT1]);

  const fitRef = useRef<SVGSVGElement>(null);
  const paramRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cur = history[Math.min(currentStep, history.length - 1)];
    if (fitRef.current) drawFitChart(fitRef.current, data, cur.t0, cur.t1);
    if (paramRef.current) drawParamChart(paramRef.current, data, history, ols, Math.min(currentStep, history.length - 1));
  }, [data, history, ols, currentStep]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= history.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 120);
    return () => clearInterval(id);
  }, [isPlaying, history.length]);

  const cur = history[Math.min(currentStep, history.length - 1)];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-2">线性回归中的梯度下降</h3>
        <p className="text-blue-700 text-sm leading-relaxed">
          线性回归的平方误差代价函数是<strong>凸二次函数</strong>。
          只要设计矩阵 <KaTeX math="X" /> 满列秩，它就存在<strong>唯一的全局最优解</strong>，
          也就是最小二乘解 <KaTeX math={String.raw`\hat\theta`} />。
          选择合适的学习率，批量梯度下降会稳定收敛到这个全局最优解。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">数据拟合</h4>
          <svg ref={fitRef} className="w-full h-auto" style={{ maxHeight: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">参数空间热力图</h4>
          <svg ref={paramRef} className="w-full h-auto" style={{ maxHeight: 280 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            初始 <KaTeX math={String.raw`\theta_0`} /> = {initT0.toFixed(1)}
          </label>
          <input
            type="range"
            aria-label="线性回归初始参数 theta 0"
            min="-2"
            max="4"
            step="0.1"
            value={initT0}
            onChange={(e) => { setInitT0(parseFloat(e.target.value)); setCurrentStep(0); setIsPlaying(false); }}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            初始 <KaTeX math={String.raw`\theta_1`} /> = {initT1.toFixed(1)}
          </label>
          <input
            type="range"
            aria-label="线性回归初始参数 theta 1"
            min="0"
            max="3.5"
            step="0.1"
            value={initT1}
            onChange={(e) => { setInitT1(parseFloat(e.target.value)); setCurrentStep(0); setIsPlaying(false); }}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学习率 α = {alpha.toFixed(3)}
          </label>
          <input
            type="range"
            aria-label="线性回归学习率 alpha"
            min="0.001"
            max="0.2"
            step="0.001"
            value={alpha}
            onChange={(e) => { setAlpha(parseFloat(e.target.value)); setCurrentStep(0); setIsPlaying(false); }}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
        <button
          onClick={() => setIsPlaying(true)}
          disabled={isPlaying || currentStep >= history.length - 1}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" /> 播放
        </button>
        <button
          onClick={() => setIsPlaying(false)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Pause className="w-4 h-4" /> 暂停
        </button>
        <button
          onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> 重置
        </button>

        <div className="flex items-center gap-2 flex-grow min-w-[180px]">
          <span className="text-sm text-gray-500 whitespace-nowrap">步数:</span>
          <input
            type="range"
            aria-label="线性回归演示步数"
            min={0}
            max={history.length - 1}
            value={Math.min(currentStep, history.length - 1)}
            onChange={(e) => { setIsPlaying(false); setCurrentStep(Number(e.target.value)); }}
            className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm text-gray-700 font-mono min-w-[3ch]">{currentStep}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <span className="text-gray-500">OLS 解：</span>
          <span className="font-mono font-semibold text-emerald-700">
            <KaTeX math={String.raw`\hat\theta`} /> = ({ols.theta0.toFixed(3)}, {ols.theta1.toFixed(3)})
          </span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-gray-500">当前 θ：</span>
          <span className="font-mono font-semibold text-blue-700">
            ({cur.t0.toFixed(3)}, {cur.t1.toFixed(3)})
          </span>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
          <span className="text-gray-500">当前 J(θ)：</span>
          <span className="font-mono font-semibold text-rose-700">{cur.j.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
