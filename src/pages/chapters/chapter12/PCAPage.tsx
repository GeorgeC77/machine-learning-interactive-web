import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2, RefreshCw, Circle, LocateFixed } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

interface Point2D {
  x: number;
  y: number;
}

function generateData(n: number, seed: number): Point2D[] {
  // 生成相关的二维高斯数据：均值为 0，协方差近似 [[2.89, 2.6], [2.6, 2.44]]
  let s = seed;
  const data: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const u1 = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const u2 = s / 233280;
    const r1 = Math.sqrt(-2 * Math.log(Math.max(1e-10, u1)));
    const z1 = r1 * Math.cos(2 * Math.PI * u2);
    const z2 = r1 * Math.sin(2 * Math.PI * u2);
    const x1 = 1.5 * z1 + 0.8 * z2;
    const x2 = 1.2 * z1 + 1.0 * z2;
    data.push({ x: x1, y: x2 });
  }
  return data;
}

function meanCenter(data: Point2D[]): Point2D[] {
  const mx = data.reduce((sum, p) => sum + p.x, 0) / data.length;
  const my = data.reduce((sum, p) => sum + p.y, 0) / data.length;
  return data.map((p) => ({ x: p.x - mx, y: p.y - my }));
}

function covarianceMatrix(data: Point2D[]): [[number, number], [number, number]] {
  const n = data.length;
  let a = 0;
  let b = 0;
  let d = 0;
  for (const p of data) {
    a += p.x * p.x;
    b += p.x * p.y;
    d += p.y * p.y;
  }
  return [
    [a / n, b / n],
    [b / n, d / n],
  ];
}

interface EigResult {
  lambda1: number;
  lambda2: number;
  u1: Point2D;
  u2: Point2D;
}

function eigenDecomposition(m: [[number, number], [number, number]]): EigResult {
  const [[a, b], [, d]] = m;
  const trace = a + d;
  const delta = Math.hypot(a - d, 2 * b) / 2;
  const lambda1 = trace / 2 + delta;
  const rawLambda2 = trace / 2 - delta;
  const matrixScale = Math.max(Math.abs(a), Math.abs(b), Math.abs(d), 1);
  const lambda2 = rawLambda2 > -1e-12 * matrixScale ? Math.max(0, rawLambda2) : rawLambda2;

  // 从两种等价写法中选择范数更大的候选，避免对角矩阵或近重根矩阵出现 0/0。
  const candidateA = { x: b, y: lambda1 - a };
  const candidateB = { x: lambda1 - d, y: b };
  const normA = Math.hypot(candidateA.x, candidateA.y);
  const normB = Math.hypot(candidateB.x, candidateB.y);
  let vector = normA > normB ? candidateA : candidateB;
  let norm = Math.max(normA, normB);
  if (norm <= 1e-12 * matrixScale) {
    vector = a >= d ? { x: 1, y: 0 } : { x: 0, y: 1 };
    norm = 1;
  }
  let u1 = { x: vector.x / norm, y: vector.y / norm };
  if (u1.x < 0 || (Math.abs(u1.x) <= 1e-12 && u1.y < 0)) {
    u1 = { x: -u1.x, y: -u1.y };
  }
  const u2 = { x: -u1.y, y: u1.x };
  return { lambda1, lambda2, u1, u2 };
}

function project(p: Point2D, u: Point2D): Point2D {
  const dot = p.x * u.x + p.y * u.y;
  return { x: dot * u.x, y: dot * u.y };
}

function axisAngleDifference(angleA: number, angleB: number): number {
  const difference = Math.abs(angleA - angleB) % 180;
  return Math.min(difference, 180 - difference);
}

export default function PCAPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十二章 · 主成分分析
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">主成分分析</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          主成分分析（PCA）是一种经典的无监督降维方法。它通过寻找数据方差最大的方向，
          把中心化后的数值数据投影到低维线性子空间，并在平方重构误差意义下尽可能保留信息。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">问题动机</h2>
        </div>
        <p className="text-gray-700 mb-4">
          实际数据中的不同特征往往高度相关。例如，同一辆汽车的最高时速可能同时以「英里每小时」和「公里每小时」记录，
          这两个特征几乎线性相关，造成了冗余。PCA 的目标就是自动发现这种低维结构，并用更少的维度表示数据。
        </p>
        <p className="text-gray-700">
          更一般地，给定一组 d 维数据，我们希望找到一个 k 维子空间（k &lt; d），使得数据投影到该子空间后，
          尽可能保留原始数据的变异性。PCA 给出的答案是：这个子空间由样本协方差矩阵按特征值从大到小排列的前 k 个单位特征向量张成。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">数据预处理</h2>
        <p className="text-gray-700 mb-4">
          PCA 应先中心化，即减去训练集上每个特征的均值。是否进一步除以标准差取决于任务：若特征单位或量级不可比，常使用标准化后的数据（等价于相关矩阵 PCA）；若量纲本身有意义，则可只中心化并使用协方差矩阵。
        </p>
        <FormulaCard
          title="中心化与可选标准化"
          formula={
            <KaTeX
              math={String.raw`x_{c,j}^{(i)}=x_j^{(i)}-\mu_j,\qquad z_j^{(i)}=\frac{x_{c,j}^{(i)}}{s_j}\quad(s_j>0)`}
              display
            />
          }
          description="μ_j 与 s_j 都只在训练集上估计，并原样用于验证集和测试集。零方差特征无法标准化，通常应移除或单独处理。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">最大化投影方差</h2>
        <p className="text-gray-700 mb-4">
          假设数据已经中心化。我们要找一个单位向量 u，使数据在 u 方向上的投影方差最大。
          中心化样本 x_c^(i) 在 u 上的坐标为 u^T x_c^(i)，因此优化目标为：
        </p>
        <FormulaCard
          title="投影方差"
          formula={
            <KaTeX
              math={String.raw`\max_{\|u\|_2=1} \frac{1}{n}\sum_{i=1}^n \bigl(u^T x_c^{(i)}\bigr)^2 = \max_{\|u\|_2=1} u^T \Sigma u`}
              display
            />
          }
          description="本章采用机器学习中常见的 1/n 约定：Σ=(1/n)Σ_i x_c^(i)(x_c^(i))^T。改用 1/(n−1) 只会整体缩放特征值，不改变主成分方向与解释方差比例。"
        />
        <p className="text-gray-700 mt-4">
          拉格朗日乘子法给出 Σu=λu，对应特征值 λ 就是该方向的投影方差。第一主成分取最大特征值对应的单位特征向量；
          后续方向还要与此前方向正交。特征向量符号不唯一；若存在重复特征值，对应子空间唯一但其中的基向量不唯一。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">解释方差与维数选择</h2>
        <FormulaCard
          title="累计解释方差比例"
          formula={
            <KaTeX
              math={String.raw`R_k=\frac{\sum_{j=1}^k\lambda_j}{\sum_{j=1}^d\lambda_j},\qquad \lambda_1\ge\cdots\ge\lambda_d\ge0`}
              display
            />
          }
          description="可选择达到预设解释方差阈值的最小 k，也应结合下游任务的交叉验证、计算预算与可解释性；阈值不是普适定律。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">低维表示</h2>
        <p className="text-gray-700 mb-4">
          令 U_k=[u_1,…,u_k]。每个样本先使用训练均值中心化，再编码为这组正交基上的坐标：
        </p>
        <FormulaCard
          title="PCA 编码"
          formula={
            <KaTeX
              math={String.raw`y^{(i)}=U_k^T\bigl(x^{(i)}-\mu\bigr)\in\mathbb R^k`}
              display
            />
          }
          description="y^(i) 是低维坐标，不是原空间中的近似点。若保留完整正交基（k=d），仅发生坐标旋转，不损失信息。"
        />
        <FormulaCard
          title="解码与重构"
          formula={
            <KaTeX
              math={String.raw`\hat x^{(i)}=\mu+U_k y^{(i)},\qquad \frac1n\sum_i\left\|x^{(i)}-\hat x^{(i)}\right\|_2^2=\sum_{j=k+1}^d\lambda_j`}
              display
            />
          }
          description="在所有 k 维正交线性投影中，PCA 的子空间最小化训练样本的平均平方重构误差；恢复到原始坐标时不能遗漏均值 μ。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：二维 PCA</h2>
        <p className="text-gray-700 mb-4">
          下面的演示生成了一组相关的二维数据。红色箭头表示第一主成分，绿色箭头表示第二主成分。
          你可以切换到「手动方向」模式，旋转投影方向，观察投影方差何时达到最大；也可以选择 PCA 投影维度，
          查看只保留前 k 个主成分时的重构效果。
        </p>
        <PCADemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">应用</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>数据压缩：</strong>用更少的维度存储高维数据，减少存储和计算开销。</li>
          <li><strong>可视化：</strong>把数据降到 2 维或 3 维后绘制，帮助发现聚类或异常。</li>
          <li><strong>降噪：</strong>当噪声主要位于低方差方向时，丢弃这些成分可抑制噪声；该前提并非总成立。</li>
          <li><strong>预处理：</strong>在监督学习前降低输入维度，但应通过验证集确认，因为低方差方向也可能包含预测信号。</li>
          <li><strong>特征脸：</strong>在人脸图像上应用 PCA，得到描述人脸主要变化的基图像，用于人脸识别。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">实践边界</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-800 mb-2">数据与尺度</h3>
            <p>PCA 对尺度和异常值敏感，也不能直接处理缺失值或无序类别。应先确定编码、缺失处理和缩放方案。</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-semibold text-violet-800 mb-2">泛化与结构</h3>
            <p>均值、尺度和主成分只能在训练集拟合后应用到其他数据；普通 PCA 只能捕捉线性子空间，弯曲流形需要其他方法。</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 md:col-span-2">
            <h3 className="font-semibold text-blue-800 mb-2">数值实现</h3>
            <p>实际高维计算通常直接对中心化数据矩阵做 SVD，避免显式构造协方差矩阵，并能获得更好的数值稳定性。</p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>PCA 把中心化数据投影到方差最大的正交线性子空间。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>主成分是样本协方差矩阵的特征向量，对应特征值衡量各方向上的方差。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在正交线性投影中，前 k 个主成分既最大化保留方差，也最小化平方重构误差。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>PCA 可用于压缩、可视化和特征提取，但结果依赖尺度、异常值与线性结构假设。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function PCADemo() {
  const [seed, setSeed] = useState(42);
  const [mode, setMode] = useState<'pca' | 'manual'>('pca');
  const [manualAngle, setManualAngle] = useState(0);
  const [k, setK] = useState(1);

  const rawData = useMemo(() => generateData(250, seed), [seed]);
  const data = useMemo(() => meanCenter(rawData), [rawData]);
  const sigma = useMemo(() => covarianceMatrix(data), [data]);
  const eig = useMemo(() => eigenDecomposition(sigma), [sigma]);

  const totalVariance = eig.lambda1 + eig.lambda2;
  const retainedVariance = k === 1 ? eig.lambda1 : totalVariance;
  const retainedRatio = totalVariance > 0 ? retainedVariance / totalVariance : 0;
  const reconstructionMse = k === 1 ? Math.max(0, eig.lambda2) : 0;

  const manualRad = (manualAngle * Math.PI) / 180;
  const manualU = { x: Math.cos(manualRad), y: Math.sin(manualRad) };
  const manualVar =
    manualU.x * manualU.x * sigma[0][0] +
    2 * manualU.x * manualU.y * sigma[0][1] +
    manualU.y * manualU.y * sigma[1][1];
  const manualResidualMse = Math.max(0, totalVariance - manualVar);
  const varianceGap = Math.max(0, eig.lambda1 - manualVar);
  const optimalAngle = (Math.atan2(eig.u1.y, eig.u1.x) * 180) / Math.PI;
  const angleGap = axisAngleDifference(manualAngle, optimalAngle);

  // 绘图参数
  const SIZE = 560;
  const PADDING = 50;
  const SCALE = 45; // 单位长度对应的像素数
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  function toSvg(p: Point2D): { x: number; y: number } {
    return {
      x: CX + p.x * SCALE,
      y: CY - p.y * SCALE,
    };
  }

  function arrowPath(origin: Point2D, dir: Point2D, len: number): string {
    const end = { x: origin.x + dir.x * len, y: origin.y + dir.y * len };
    const oSvg = toSvg(origin);
    const eSvg = toSvg(end);
    return `M ${oSvg.x} ${oSvg.y} L ${eSvg.x} ${eSvg.y}`;
  }

  const firstComponents = k >= 1 ? [eig.u1] : [];
  const components = k >= 2 ? [eig.u1, eig.u2] : firstComponents;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="PCA 演示模式">
            <button
              type="button"
              onClick={() => setMode('pca')}
              aria-pressed={mode === 'pca'}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'pca' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              PCA 模式
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              aria-pressed={mode === 'manual'}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              手动方向
            </button>
          </div>

          {mode === 'manual' && (
            <ControlRow label={`手动方向角度: ${manualAngle.toFixed(1)}°`}>
              <Slider
                aria-label="手动投影方向角度"
                value={[manualAngle]}
                min={-180}
                max={180}
                step={0.1}
                onValueChange={(v) => setManualAngle(v[0])}
              />
            </ControlRow>
          )}

          {mode === 'pca' && (
            <ControlRow label={`保留主成分数 k: ${k}`}>
              <Slider aria-label="保留主成分数 k" value={[k]} min={1} max={2} step={1} onValueChange={(v) => setK(v[0])} />
            </ControlRow>
          )}

          {mode === 'manual' && (
            <button
              type="button"
              onClick={() => setManualAngle(optimalAngle)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              <LocateFixed className="w-4 h-4" />
              对齐第一主成分
            </button>
          )}

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重新采样
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1" aria-live="polite">
            <div className="flex justify-between">
              <span className="text-gray-600">协方差矩阵 Σ:</span>
            </div>
            <div className="font-mono text-gray-700">
              [{sigma[0][0].toFixed(6)}, {sigma[0][1].toFixed(6)}]
            </div>
            <div className="font-mono text-gray-700">
              [{sigma[1][0].toFixed(6)}, {sigma[1][1].toFixed(6)}]
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">特征值 λ₁:</span>
              <span className="font-mono font-medium text-blue-700">{eig.lambda1.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">特征值 λ₂:</span>
              <span className="font-mono font-medium text-blue-700">{eig.lambda2.toFixed(6)}</span>
            </div>
            {mode === 'pca' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">累计解释方差:</span>
                  <span className="font-mono font-medium text-emerald-700">{(retainedRatio * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均平方重构误差:</span>
                  <span className="font-mono font-medium text-emerald-700">{reconstructionMse.toFixed(6)}</span>
                </div>
              </>
            )}
            {mode === 'manual' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">手动方向方差:</span>
                  <span className="font-mono font-medium text-amber-700">{manualVar.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">距最大方差 λ₁:</span>
                  <span className="font-mono font-medium text-amber-700">{varianceGap.toExponential(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">与第一主轴夹角:</span>
                  <span className="font-mono font-medium text-amber-700">{angleGap.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均平方残差:</span>
                  <span className="font-mono font-medium text-amber-700">{manualResidualMse.toFixed(6)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full min-w-[360px]"
            style={{ maxHeight: 560 }}
            role="img"
            aria-labelledby="pca-chart-title pca-chart-desc"
          >
            <title id="pca-chart-title">二维数据的主成分与正交投影</title>
            <desc id="pca-chart-desc">
              蓝点是中心化样本；PCA 模式显示主成分和重构点，手动模式显示指定方向及其正交投影。
            </desc>
            <rect x={0} y={0} width={SIZE} height={SIZE} fill="#f9fafb" />
            {/* 网格线 */}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v) => {
              const p = toSvg({ x: v, y: 0 });
              return (
                <line
                  key={`vx-${v}`}
                  x1={p.x}
                  y1={PADDING}
                  x2={p.x}
                  y2={SIZE - PADDING}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              );
            })}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v) => {
              const p = toSvg({ x: 0, y: v });
              return (
                <line
                  key={`hy-${v}`}
                  x1={PADDING}
                  y1={p.y}
                  x2={SIZE - PADDING}
                  y2={p.y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              );
            })}
            {/* 坐标轴 */}
            <line x1={PADDING} y1={CY} x2={SIZE - PADDING} y2={CY} stroke="#374151" strokeWidth={2} />
            <line x1={CX} y1={PADDING} x2={CX} y2={SIZE - PADDING} stroke="#374151" strokeWidth={2} />
            {/* 刻度标签 */}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v) => {
              const p = toSvg({ x: v, y: 0 });
              return (
                <text key={`lx-${v}`} x={p.x} y={CY + 18} textAnchor="middle" fontSize={11} fill="#6b7280">
                  {v}
                </text>
              );
            })}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v) => {
              const p = toSvg({ x: 0, y: v });
              return (
                <text key={`ly-${v}`} x={CX - 10} y={p.y + 4} textAnchor="end" fontSize={11} fill="#6b7280">
                  {v}
                </text>
              );
            })}

            <g clipPath="url(#pca-plot-clip)">
              {/* 投影线（PCA 模式 k=1） */}
              {mode === 'pca' &&
                k === 1 &&
                data.map((p, idx) => {
                  const proj = project(p, eig.u1);
                  const s0 = toSvg(p);
                  const s1 = toSvg(proj);
                  return (
                    <line
                      key={`proj-line-${idx}`}
                      x1={s0.x}
                      y1={s0.y}
                      x2={s1.x}
                      y2={s1.y}
                      stroke="#9ca3af"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.5}
                    />
                  );
                })}

              {/* 手动模式投影线 */}
              {mode === 'manual' &&
                data.map((p, idx) => {
                  const proj = project(p, manualU);
                  const s0 = toSvg(p);
                  const s1 = toSvg(proj);
                  return (
                    <line
                      key={`manual-proj-line-${idx}`}
                      x1={s0.x}
                      y1={s0.y}
                      x2={s1.x}
                      y2={s1.y}
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.4}
                    />
                  );
                })}

              {/* 重构点（PCA 模式） */}
              {mode === 'pca' &&
                data.map((p, idx) => {
                  let recon = { x: 0, y: 0 };
                  for (const u of components) {
                    const proj = project(p, u);
                    recon = { x: recon.x + proj.x, y: recon.y + proj.y };
                  }
                  const s = toSvg(recon);
                  return <circle key={`recon-${idx}`} cx={s.x} cy={s.y} r={3} fill="#10b981" opacity={0.7} />;
                })}

              {/* 手动投影点 */}
              {mode === 'manual' &&
                data.map((p, idx) => {
                  const proj = project(p, manualU);
                  const s = toSvg(proj);
                  return <circle key={`manual-proj-${idx}`} cx={s.x} cy={s.y} r={3} fill="#f59e0b" opacity={0.7} />;
                })}

              {/* 原始数据点 */}
              {data.map((p, idx) => {
                const s = toSvg(p);
                return <circle key={`data-${idx}`} cx={s.x} cy={s.y} r={3} fill="#2563eb" opacity={0.6} />;
              })}

              {/* 主成分轴 */}
              {mode === 'pca' && (
                <>
                  <path d={arrowPath({ x: 0, y: 0 }, eig.u1, 4)} fill="none" stroke="#ef4444" strokeWidth={3} markerEnd="url(#arrow-red)" />
                  <path d={arrowPath({ x: 0, y: 0 }, eig.u2, 3)} fill="none" stroke="#10b981" strokeWidth={3} markerEnd="url(#arrow-green)" />
                </>
              )}

              {/* 手动方向轴 */}
              {mode === 'manual' && (
                <path d={arrowPath({ x: 0, y: 0 }, manualU, 4)} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="6 4" markerEnd="url(#arrow-amber)" />
              )}
            </g>

            {/* 箭头标记 */}
            <defs>
              <clipPath id="pca-plot-clip">
                <rect x={PADDING} y={PADDING} width={SIZE - 2 * PADDING} height={SIZE - 2 * PADDING} />
              </clipPath>
              <marker id="arrow-red" markerWidth={10} markerHeight={10} refX={9} refY={3} orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-green" markerWidth={10} markerHeight={10} refX={9} refY={3} orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
              </marker>
              <marker id="arrow-amber" markerWidth={10} markerHeight={10} refX={9} refY={3} orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
              </marker>
            </defs>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 opacity-60" /> 原始数据</span>
            {mode === 'pca' && (
              <>
                <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-red-500" /> 第一主成分</span>
                <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-emerald-500" /> 第二主成分</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 opacity-70" /> 重构点</span>
              </>
            )}
            {mode === 'manual' && (
              <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-amber-500" /> 手动方向</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}
