import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type React from 'react';
import { ShieldAlert, Target, CheckCircle2, RefreshCw, Play, SkipForward, MousePointer2, Circle, Plus } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

interface Point {
  x: number;
  y: number;
  cluster: number;
}

interface Centroid {
  x: number;
  y: number;
}

type TerminationReason = 'converged' | 'iteration-limit' | null;

const WIDTH = 600;
const HEIGHT = 480;
const PADDING = 30;

function scaleX(val: number): number {
  return PADDING + (val / 10) * (WIDTH - 2 * PADDING);
}

function scaleY(val: number): number {
  return HEIGHT - PADDING - (val / 10) * (HEIGHT - 2 * PADDING);
}

function unscaleX(px: number): number {
  return ((px - PADDING) / (WIDTH - 2 * PADDING)) * 10;
}

function unscaleY(py: number): number {
  return ((HEIGHT - PADDING - py) / (HEIGHT - 2 * PADDING)) * 10;
}

function dist2(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}

function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % 2147483647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function initializeKMeansPlusPlus(points: Point[], count: number, seed: number): Centroid[] {
  if (points.length < count || count < 1) return [];
  const random = createSeededRandom(seed);
  const chosen = new Set<number>();
  chosen.add(Math.floor(random() * points.length));

  while (chosen.size < count) {
    const chosenPoints = [...chosen].map((index) => points[index]);
    const weights = points.map((point, index) => (
      chosen.has(index) ? 0 : Math.min(...chosenPoints.map((centroid) => dist2(point, centroid)))
    ));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let nextIndex = -1;
    if (total > 0) {
      let threshold = random() * total;
      for (let index = 0; index < weights.length; index += 1) {
        threshold -= weights[index];
        if (threshold <= 0 && !chosen.has(index)) {
          nextIndex = index;
          break;
        }
      }
    }
    if (nextIndex < 0) nextIndex = points.findIndex((_, index) => !chosen.has(index));
    if (nextIndex < 0) break;
    chosen.add(nextIndex);
  }

  return [...chosen].map((index) => ({ x: points[index].x, y: points[index].y }));
}

const palette = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function KMeansPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十章 · 聚类
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">K-means 算法</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          K-means 是最经典的聚类算法之一。它通过交替执行“分配样本到最近质心”和“更新质心为簇内均值”两个步骤，
          逐步减小平方欧氏距离目标。它适用于数值特征，但结果会受尺度、异常值、K 与初始化影响。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">算法步骤</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">1. 初始化</h3>
            <p className="text-sm text-gray-700">
              用 K-means++ 或随机样本选择 K 个初始质心；实践中通常运行多次并保留目标最小的结果。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">2. 分配步骤</h3>
            <p className="text-sm text-gray-700">
              每个样本被分配到距离最近的质心所在的簇。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">3. 更新步骤</h3>
            <p className="text-sm text-gray-700">
              每个质心被更新为所在簇所有样本的均值坐标。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">4. 收敛</h3>
            <p className="text-sm text-gray-700">
              重复分配与更新，直到分配稳定、质心变化低于阈值，或达到迭代上限。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">失真函数</h2>
        <p className="text-gray-700 mb-4">
          K-means 的目标函数被称为失真函数（distortion function），它是所有样本到其所属质心的欧氏距离平方和：
        </p>
        <FormulaCard
          title="失真函数"
          formula={
            <KaTeX
              math={String.raw`J(c, \mu) = \sum_{i=1}^n \bigl\|x^{(i)} - \mu_{c^{(i)}}\bigr\|^2`}
              display
            />
          }
          description="在有限样本且平局、空簇处理规则固定时，分配步骤和更新步骤都会使 J 单调不增，通常在有限次迭代后达到稳定分配；但结果依赖初始化，且只保证局部最优或固定点。"
        />
        <p className="mt-4 text-sm text-gray-600">
          对 n 个 d 维样本和 K 个簇，一次完整迭代的主要计算量为 O(nKd)；若运行 T 轮和 R 次不同初始化，
          总体约为 O(RTnKd)。因此大数据场景还需关注初始化次数、迭代上限或 mini-batch K-means。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">实践前的三个检查</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">特征尺度</h3>
            <p>欧氏距离会让数值范围大的特征占主导。应根据含义做标准化、稳健缩放或合理加权。</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-800 mb-2">异常值与形状</h3>
            <p>均值和平方距离对异常值敏感；非凸、细长或密度差异明显的簇也可能不适合 K-means。</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-semibold text-violet-800 mb-2">K 与稳定性</h3>
            <p>结合业务约束、肘部法、轮廓系数与多次重采样稳定性选择 K，不要只看训练失真。</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示</h2>
        <p className="text-gray-700 mb-4">
          在画布上点击或按坐标添加数据点，选择 K，再用 K-means++ 初始化并逐步运行。观察质心移动、分配稳定和失真函数单调不增。
        </p>
        <KMeansDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>K-means 交替执行分配与更新两步，最小化失真函数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在规则固定时目标函数单调不增，通常在有限步后稳定；结果依赖于初始质心，只保证局部最优或固定点。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>K-means++ 与多次启动可降低较差局部解的风险；选 K 还应结合稳定性与领域解释。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 交互演示                                                                   */
/* -------------------------------------------------------------------------- */
function KMeansDemo() {
  const [points, setPoints] = useState<Point[]>(() => generateSampleData(42));
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [iterations, setIterations] = useState(0);
  const [distortion, setDistortion] = useState(0);
  const [distortionHistory, setDistortionHistory] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [terminationReason, setTerminationReason] = useState<TerminationReason>(null);
  const [dataSeed, setDataSeed] = useState(42);
  const [newPointX, setNewPointX] = useState(5);
  const [newPointY, setNewPointY] = useState(5);
  const pointsRef = useRef(points);
  const centroidsRef = useRef(centroids);
  const iterationsRef = useRef(0);
  const initializationSeedRef = useRef(2026);

  const clearModel = useCallback((nextPoints: Point[]) => {
    const unassignedPoints = nextPoints.map((point) => ({ ...point, cluster: 0 }));
    pointsRef.current = unassignedPoints;
    centroidsRef.current = [];
    iterationsRef.current = 0;
    setPoints(unassignedPoints);
    setCentroids([]);
    setIterations(0);
    setDistortion(0);
    setDistortionHistory([]);
    setTerminationReason(null);
    setIsRunning(false);
  }, []);

  const assignStep = useCallback((pts: Point[], cents: Centroid[]): Point[] => {
    return pts.map((p) => {
      let best = 0;
      let bestDist = Infinity;
      cents.forEach((c, idx) => {
        const d = dist2(p, c);
        if (d < bestDist) {
          bestDist = d;
          best = idx;
        }
      });
      return { ...p, cluster: best };
    });
  }, []);

  const updateStep = useCallback((pts: Point[], cents: Centroid[]): Centroid[] => {
    return cents.map((_, idx) => {
      const clusterPoints = pts.filter((p) => p.cluster === idx);
      if (clusterPoints.length === 0) return cents[idx];
      return {
        x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
        y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
      };
    });
  }, []);

  const computeDistortion = useCallback((pts: Point[], cents: Centroid[]): number => {
    return pts.reduce((sum, point) => {
      const centroid = cents[point.cluster];
      return centroid ? sum + dist2(point, centroid) : sum;
    }, 0);
  }, []);

  const reset = useCallback(() => {
    const currentPoints = pointsRef.current;
    const seed = initializationSeedRef.current;
    initializationSeedRef.current += 1;
    const cents = initializeKMeansPlusPlus(currentPoints, k, seed);
    if (cents.length !== k) return;
    const assigned = assignStep(currentPoints, cents);
    const initialDistortion = computeDistortion(assigned, cents);
    pointsRef.current = assigned;
    centroidsRef.current = cents;
    iterationsRef.current = 0;
    setCentroids(cents);
    setPoints(assigned);
    setIterations(0);
    setDistortion(initialDistortion);
    setDistortionHistory([initialDistortion]);
    setTerminationReason(null);
    setIsRunning(false);
  }, [k, assignStep, computeDistortion]);

  const doOneStep = useCallback(() => {
    const currentPoints = pointsRef.current;
    const currentCentroids = centroidsRef.current;
    if (currentCentroids.length === 0) return;
    const newCentroids = updateStep(currentPoints, currentCentroids);
    const newPoints = assignStep(currentPoints, newCentroids);
    const newDistortion = computeDistortion(newPoints, newCentroids);
    const assignmentsStable = newPoints.every((point, index) => point.cluster === currentPoints[index].cluster);
    const maxCentroidShift = Math.sqrt(Math.max(
      0,
      ...newCentroids.map((centroid, index) => dist2(centroid, currentCentroids[index])),
    ));
    const nextIteration = iterationsRef.current + 1;
    const converged = assignmentsStable && maxCentroidShift <= 1e-8;
    const hitIterationLimit = nextIteration >= 100;

    pointsRef.current = newPoints;
    centroidsRef.current = newCentroids;
    iterationsRef.current = nextIteration;
    setCentroids(newCentroids);
    setPoints(newPoints);
    setDistortion(newDistortion);
    setDistortionHistory((history) => [...history, newDistortion]);
    setIterations(nextIteration);
    if (converged || hitIterationLimit) {
      setTerminationReason(converged ? 'converged' : 'iteration-limit');
      setIsRunning(false);
    }
  }, [assignStep, updateStep, computeDistortion]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      doOneStep();
    }, 600);
    return () => clearInterval(interval);
  }, [isRunning, doOneStep]);

  const addPoint = useCallback((x: number, y: number) => {
    if (isRunning) return;
    clearModel([...pointsRef.current, { x, y, cluster: 0 }]);
  }, [clearModel, isRunning]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (WIDTH / rect.width);
    const svgY = (e.clientY - rect.top) * (HEIGHT / rect.height);
    const x = unscaleX(svgX);
    const y = unscaleY(svgY);
    if (x < 0 || x > 10 || y < 0 || y > 10) return;
    addPoint(x, y);
  };

  const handleKChange = (nextK: number) => {
    if (nextK === k) return;
    setK(nextK);
    clearModel(pointsRef.current);
  };

  const regenerateData = () => {
    const nextSeed = dataSeed + 1;
    setDataSeed(nextSeed);
    clearModel(generateSampleData(nextSeed));
  };

  const clearPoints = () => {
    clearModel([]);
  };

  const distortionChange = distortionHistory.length >= 2
    ? distortionHistory[distortionHistory.length - 1] - distortionHistory[distortionHistory.length - 2]
    : null;
  const statusLabel = centroids.length === 0
    ? '未初始化'
    : isRunning
      ? '自动运行中'
      : terminationReason === 'converged'
        ? '已收敛'
        : terminationReason === 'iteration-limit'
          ? '达到 100 次上限'
          : iterations === 0
            ? '已初始化'
            : '已暂停，可继续';
  const emptyClusterCount = centroids.filter((_, cluster) => !points.some((point) => point.cluster === cluster)).length;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-5">
          <ControlRow label={`聚类数 K: ${k}`}>
            <Slider aria-label="聚类数 K" value={[k]} min={2} max={8} step={1} onValueChange={(v) => handleKChange(v[0])} />
          </ControlRow>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">按坐标添加点</p>
            <ControlRow label={`x: ${newPointX.toFixed(1)}`}>
              <Slider aria-label="新数据点 x 坐标" value={[newPointX]} min={0} max={10} step={0.1} onValueChange={(value) => setNewPointX(value[0])} />
            </ControlRow>
            <ControlRow label={`y: ${newPointY.toFixed(1)}`}>
              <Slider aria-label="新数据点 y 坐标" value={[newPointY]} min={0} max={10} step={0.1} onValueChange={(value) => setNewPointY(value[0])} />
            </ControlRow>
            <button
              type="button"
              onClick={() => addPoint(newPointX, newPointY)}
              disabled={isRunning}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              添加数据点
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={points.length < k}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              K-means++ 初始化
            </button>
            <button
              type="button"
              onClick={doOneStep}
              disabled={centroids.length === 0 || isRunning || terminationReason !== null}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors text-sm"
            >
              <SkipForward className="w-4 h-4" />
              下一步
            </button>
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              disabled={centroids.length === 0 || terminationReason !== null}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white transition-colors text-sm ${
                isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-600 hover:bg-violet-700'
              } disabled:bg-gray-300`}
            >
              <Play className="w-4 h-4" />
              {isRunning ? '暂停' : '自动运行'}
            </button>
            <button
              type="button"
              onClick={regenerateData}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <MousePointer2 className="w-4 h-4" />
              随机数据
            </button>
          </div>

          <button
            type="button"
            onClick={clearPoints}
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            清空画布
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1" aria-live="polite">
            <div className="flex justify-between">
              <span className="text-gray-600">状态:</span>
              <span className="font-medium text-gray-800">{statusLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">样本数:</span>
              <span className="font-mono font-medium text-gray-700">{points.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">迭代次数:</span>
              <span className="font-mono font-medium text-gray-700">{iterations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">失真函数 J:</span>
              <span className="font-mono font-medium text-blue-700">{centroids.length > 0 ? distortion.toFixed(6) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">本步 ΔJ:</span>
              <span className={`font-mono font-medium ${distortionChange !== null && distortionChange > 1e-8 ? 'text-red-600' : 'text-emerald-700'}`}>
                {distortionChange === null ? '—' : distortionChange.toExponential(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">空簇:</span>
              <span className="font-mono font-medium text-gray-700">{centroids.length > 0 ? emptyClusterCount : '—'}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-start gap-2">
            <MousePointer2 className="w-4 h-4 flex-shrink-0" />
            点击画布或使用坐标控件添加点；改变 K 会清除旧质心。初始化后可单步或自动运行。
          </div>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[360px] border border-gray-200 rounded-lg bg-white cursor-crosshair"
            style={{ maxHeight: 480 }}
            onClick={handleSvgClick}
            role="img"
            aria-labelledby="kmeans-chart-title kmeans-chart-desc"
          >
            <title id="kmeans-chart-title">K-means 二维聚类交互图</title>
            <desc id="kmeans-chart-desc">显示 {points.length} 个数据点、{centroids.length} 个质心和当前簇分配；点击绘图区可添加点。</desc>
            {/* 网格 */}
            {Array.from({ length: 11 }, (_, i) => i).map((i) => (
              <g key={`grid-${i}`}>
                <line x1={scaleX(i)} y1={scaleY(0)} x2={scaleX(i)} y2={scaleY(10)} stroke="#e5e7eb" strokeWidth={1} />
                <line x1={scaleX(0)} y1={scaleY(i)} x2={scaleX(10)} y2={scaleY(i)} stroke="#e5e7eb" strokeWidth={1} />
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10].map((tick) => (
              <g key={`tick-${tick}`}>
                <text x={scaleX(tick)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill="#4b5563">{tick}</text>
                <text x={12} y={scaleY(tick) + 4} textAnchor="middle" fontSize={11} fill="#4b5563">{tick}</text>
              </g>
            ))}

            {/* 数据点 */}
            {points.map((p, i) => (
              <circle
                key={`pt-${i}`}
                cx={scaleX(p.x)}
                cy={scaleY(p.y)}
                r={centroids.length > 0 ? 6 : 4}
                fill={centroids.length > 0 ? palette[p.cluster % palette.length] : '#6b7280'}
                opacity={0.75}
                stroke="white"
                strokeWidth={1}
              />
            ))}

            {/* 质心 */}
            {centroids.map((c, i) => (
              <g key={`centroid-${i}`}>
                <line x1={scaleX(c.x) - 8} y1={scaleY(c.y)} x2={scaleX(c.x) + 8} y2={scaleY(c.y)} stroke="#1f2937" strokeWidth={2} />
                <line x1={scaleX(c.x)} y1={scaleY(c.y) - 8} x2={scaleX(c.x)} y2={scaleY(c.y) + 8} stroke="#1f2937" strokeWidth={2} />
                <circle cx={scaleX(c.x)} cy={scaleY(c.y)} r={10} fill="none" stroke={palette[i % palette.length]} strokeWidth={2} strokeDasharray="4 2" />
              </g>
            ))}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-gray-500" /> 未初始化数据点</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-600" /> 已分簇数据点</span>
            <span className="flex items-center gap-1"><span className="text-base font-bold text-gray-800">⊕</span> 质心</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateSampleData(seed: number): Point[] {
  const clusters: { cx: number; cy: number; n: number }[] = [
    { cx: 2.5, cy: 2.5, n: 25 },
    { cx: 7, cy: 3, n: 25 },
    { cx: 5, cy: 7, n: 25 },
  ];
  const points: Point[] = [];
  let s = Math.abs(Math.trunc(seed * 7919 + 12345)) % 233280;
  if (s === 0) s = 1;
  for (const cl of clusters) {
    for (let i = 0; i < cl.n; i++) {
      s = (s * 9301 + 49297) % 233280;
      const u1 = s / 233280;
      s = (s * 9301 + 49297) % 233280;
      const u2 = s / 233280;
      const z1 = Math.sqrt(-2 * Math.log(Math.max(1e-10, u1))) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(Math.max(1e-10, u1))) * Math.sin(2 * Math.PI * u2);
      points.push({
        x: Math.max(0, Math.min(10, cl.cx + z1 * 0.9)),
        y: Math.max(0, Math.min(10, cl.cy + z2 * 0.9)),
        cluster: 0,
      });
    }
  }
  return points;
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
