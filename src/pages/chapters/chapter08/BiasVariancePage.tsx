import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Scale, CheckCircle2, RefreshCw , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

/* -------------------------------------------------------------------------- */
/* 数值工具：在缩放后的 Chebyshev 基上用 QR 做多项式最小二乘                    */
/* -------------------------------------------------------------------------- */
function polynomialBasis(x: number, degree: number): number[] {
  const z = 2 * x - 1;
  const basis = new Array(degree + 1).fill(0);
  basis[0] = 1;
  if (degree >= 1) basis[1] = z;
  for (let j = 2; j <= degree; j += 1) basis[j] = 2 * z * basis[j - 1] - basis[j - 2];
  return basis;
}

function polyFit(xs: number[], ys: number[], degree: number): number[] {
  const effectiveDegree = Math.max(0, Math.min(degree, xs.length - 1));
  const design = xs.map((x) => polynomialBasis(x, effectiveDegree));
  const columns = Array.from({ length: effectiveDegree + 1 }, (_, j) =>
    design.map((row) => row[j]),
  );
  const qColumns: number[][] = [];
  const r = Array.from({ length: effectiveDegree + 1 }, () => new Array(effectiveDegree + 1).fill(0));

  for (let j = 0; j <= effectiveDegree; j += 1) {
    const v = [...columns[j]];
    for (let i = 0; i < j; i += 1) {
      const projection = qColumns[i].reduce((sum, q, row) => sum + q * v[row], 0);
      r[i][j] += projection;
      for (let row = 0; row < v.length; row += 1) v[row] -= projection * qColumns[i][row];
    }
    // 再正交化一次，降低高次多项式中的舍入误差。
    for (let i = 0; i < j; i += 1) {
      const correction = qColumns[i].reduce((sum, q, row) => sum + q * v[row], 0);
      r[i][j] += correction;
      for (let row = 0; row < v.length; row += 1) v[row] -= correction * qColumns[i][row];
    }
    const norm = Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
    if (norm < 1e-12) return new Array(effectiveDegree + 1).fill(0);
    r[j][j] = norm;
    qColumns.push(v.map((value) => value / norm));
  }

  const qty = qColumns.map((column) => column.reduce((sum, q, row) => sum + q * ys[row], 0));
  const weights = new Array(effectiveDegree + 1).fill(0);
  for (let i = effectiveDegree; i >= 0; i -= 1) {
    const known = r[i].reduce((sum, value, j) => (j > i ? sum + value * weights[j] : sum), 0);
    weights[i] = (qty[i] - known) / r[i][i];
  }
  return weights;
}

function predict(xs: number[], weights: number[]): number[] {
  return xs.map((x) => {
    const basis = polynomialBasis(x, weights.length - 1);
    return weights.reduce((sum, weight, j) => sum + weight * basis[j], 0);
  });
}

function mse(pred: number[], actual: number[]): number {
  return pred.reduce((sum, p, i) => sum + Math.pow(p - actual[i], 2), 0) / pred.length;
}

/* -------------------------------------------------------------------------- */
/* 数据生成                                                                   */
/* -------------------------------------------------------------------------- */
function trueFunction(x: number): number {
  return 4 * Math.pow(x - 0.5, 2);
}

function generateUniform(n: number, seed: number): number[] {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(s / 233280);
  }
  return out;
}

function generateGaussian(n: number, seed: number): number[] {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const u = Math.max(1e-10, s / 233280);
    s = (s * 9301 + 49297) % 233280;
    const v = s / 233280;
    out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
  }
  return out;
}

function generateData(n: number, noise: number, seed: number): { x: number[]; y: number[] } {
  const x = generateUniform(n, seed);
  const noiseValues = generateGaussian(n, seed + 1000000);
  const y = x.map((xi, i) => trueFunction(xi) + noise * noiseValues[i]);
  return { x, y };
}

export default function BiasVariancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第八章 · 泛化
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">偏差-方差权衡</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          在平方损失与标准噪声假设下，期望预测误差可以分解为偏差、方差与不可约噪声。通过交互拟合实验，
          直观理解模型复杂度如何同时影响这三者。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">期望预测误差的分解</h2>
        </div>
        <p className="text-gray-700 mb-4">
          对平方损失回归，若 <KaTeX math={String.raw`y=h^*(x)+\varepsilon`} />、
          <KaTeX math={String.raw`\mathbb E[\varepsilon\mid x]=0`} /> 且
          <KaTeX math={String.raw`\operatorname{Var}(\varepsilon\mid x)=\sigma^2`} />，
          那么固定输入 x 处、对训练集与新样本噪声取期望的预测误差可分解为三项：
        </p>

        <FormulaCard
          title="偏差-方差分解"
          formula={
            <KaTeX
              math={String.raw`\mathbb{E}\left[(y - \hat{h}(x))^2\right] = \underbrace{\sigma^2}_{\text{不可约噪声}} + \underbrace{\bigl(h^*(x) - \bar{h}(x)\bigr)^2}_{\text{偏差}^2} + \underbrace{\mathrm{Var}\bigl(\hat{h}(x)\bigr)}_{\text{方差}}`}
              display
            />
          }
          description="其中 h* 是真实函数，h̄ 是多个训练集上学习到的平均模型。"
        />

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h3 className="font-semibold text-rose-800 mb-2">偏差（Bias）</h3>
            <p className="text-sm text-gray-700">
              平均预测与真实回归函数之间的系统性差异，可能来自模型族限制或学习算法。简单模型拟合复杂关系时通常偏差较大。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">方差（Variance）</h3>
            <p className="text-sm text-gray-700">
              衡量更换训练集后预测值的波动。在样本有限且带噪声时，高容量模型往往更敏感，但这并非所有算法下的必然结论。
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">不可约噪声</h3>
            <p className="text-sm text-gray-700">
              数据本身的随机噪声无法由预测函数消除；在上述生成模型与平方损失下，σ² 是 Bayes 风险的下界。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：多项式拟合与欠/过拟合</h2>
        <p className="text-gray-700 mb-4">
          真实函数是二次曲线（黑色虚线），训练点带有噪声。调整多项式次数、样本数和噪声水平，
          观察拟合曲线（蓝色）如何随模型复杂度变化。
        </p>
        <PolyFitDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：多次采样看方差</h2>
        <p className="text-gray-700 mb-4">
          从同一分布中抽取多个训练集并分别拟合模型。灰色曲线展示不同训练集带来的波动，
          橙色曲线是这些模型的平均，帮助我们直观理解“方差”与“偏差”。
        </p>
        <VarianceDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">偏差-方差权衡曲线</h2>
        <p className="text-gray-700 mb-4">
          对不同次数的多项式重复多次实验，绘制训练误差、测试误差随模型复杂度的变化。
          在经典有限模型复杂度情形下，测试误差常呈现 U 型：左侧欠拟合（偏差大），右侧过拟合（方差大）；现代过参数化模型中还可能出现双下降现象，后续章节会进一步讨论。
        </p>
        <TradeoffCurveDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在本页的多项式最小二乘实验中，低次数模型通常偏差较大、方差较小，容易欠拟合。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>随着次数升高，偏差通常下降，但有限样本下的方差可能迅速增大并导致过拟合。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在平方损失与上述噪声假设下，期望预测误差 = 不可约噪声 + 偏差² + 方差。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 公共 SVG 参数                                                              */
/* -------------------------------------------------------------------------- */
const WIDTH = 720;
const HEIGHT = 360;
const PADDING = { top: 20, right: 30, bottom: 50, left: 60 };
const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = -0.8;
const Y_MAX = 1.6;

function scaleX(x: number): number {
  return PADDING.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (WIDTH - PADDING.left - PADDING.right);
}

function scaleY(y: number): number {
  return HEIGHT - PADDING.bottom - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (HEIGHT - PADDING.top - PADDING.bottom);
}

function pathFromPoints(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ');
}

function gridLinesX(): number[] {
  return [0, 0.2, 0.4, 0.6, 0.8, 1.0];
}

function gridLinesY(): number[] {
  return [-0.5, 0, 0.5, 1.0, 1.5];
}

function ChartFrame() {
  return (
    <>
      {/* 背景 */}
      <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} fill="#f9fafb" />
      {/* 网格线 */}
      {gridLinesX().map((x) => (
        <line
          key={`vx-${x}`}
          x1={scaleX(x)}
          y1={PADDING.top}
          x2={scaleX(x)}
          y2={HEIGHT - PADDING.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {gridLinesY().map((y) => (
        <line
          key={`hy-${y}`}
          x1={PADDING.left}
          y1={scaleY(y)}
          x2={WIDTH - PADDING.right}
          y2={scaleY(y)}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {/* 坐标轴 */}
      <line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
      <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
      {/* 标签 */}
      {gridLinesX().map((x) => (
        <text key={`lx-${x}`} x={scaleX(x)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">
          {x.toFixed(1)}
        </text>
      ))}
      {gridLinesY().map((y) => (
        <text key={`ly-${y}`} x={PADDING.left - 10} y={scaleY(y) + 4} textAnchor="end" fontSize={12} fill="#4b5563">
          {y.toFixed(1)}
        </text>
      ))}
      <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" fontSize={13} fill="#374151">
        x
      </text>
      <text x={20} y={HEIGHT / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${HEIGHT / 2})`}>
        y
      </text>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 演示 1：单次拟合                                                           */
/* -------------------------------------------------------------------------- */
function PolyFitDemo() {
  const [degree, setDegree] = useState(1);
  const [nTrain, setNTrain] = useState(20);
  const [noise, setNoise] = useState(0.15);
  const [seed, setSeed] = useState(42);

  const { train, test, weights, trainError, testError, predPoints, truePoints } = useMemo(() => {
    const tr = generateData(nTrain, noise, seed);
    const te = generateData(200, noise, seed + 1000);
    const w = polyFit(tr.x, tr.y, degree);
    const predTrain = predict(tr.x, w);
    const predTest = predict(te.x, w);
    const trainErr = mse(predTrain, tr.y);
    const testErr = mse(predTest, te.y);

    const curvePoints = Array.from({ length: 200 }, (_, i) => (i / 199) * (X_MAX - X_MIN) + X_MIN);
    return {
      train: tr,
      test: te,
      weights: w,
      trainError: trainErr,
      testError: testErr,
      predPoints: curvePoints.map((x) => ({ x, y: predict([x], w)[0] })),
      truePoints: curvePoints.map((x) => ({ x, y: trueFunction(x) })),
    };
  }, [degree, nTrain, noise, seed]);

  const effectiveDegree = Math.min(degree, nTrain - 1);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`多项式次数: ${degree}${degree !== effectiveDegree ? ` (实际拟合: ${effectiveDegree})` : ''}`}>
            <Slider aria-label="单次拟合多项式次数" value={[degree]} min={1} max={15} step={1} onValueChange={(v) => setDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="单次拟合训练样本数" value={[nTrain]} min={10} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="单次拟合噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </ControlRow>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新采样
            </button>
            <span className="text-sm text-gray-500">随机种子: {seed}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">训练误差:</span>
              <span className="font-mono font-medium text-blue-700">{trainError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">测试误差:</span>
              <span className="font-mono font-medium text-emerald-700">{testError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">模型参数:</span>
              <span className="font-mono font-medium text-gray-700">{weights.length} (有效次数 {effectiveDegree})</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label="多项式拟合、真实函数及训练测试样本">
            <title>多项式拟合与欠拟合、过拟合</title>
            <defs>
              <clipPath id="poly-fit-chart-clip">
                <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} />
              </clipPath>
            </defs>
            <ChartFrame />
            <g clipPath="url(#poly-fit-chart-clip)">
              <path d={pathFromPoints(truePoints)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              <path d={pathFromPoints(predPoints)} fill="none" stroke="#2563eb" strokeWidth={3} />
              {train.x.map((x, i) => (
                <circle key={`tr-${i}`} cx={scaleX(x)} cy={scaleY(train.y[i])} r={4} fill="#f97316" opacity={0.7} />
              ))}
              {test.x.map((x, i) => (
                <circle key={`te-${i}`} cx={scaleX(x)} cy={scaleY(test.y[i])} r={2} fill="#10b981" opacity={0.25} />
              ))}
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> 训练点</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> 测试点</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> 拟合曲线</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-700" /> 真实函数</span>
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

/* -------------------------------------------------------------------------- */
/* 演示 2：多次采样看方差                                                     */
/* -------------------------------------------------------------------------- */
function VarianceDemo() {
  const [degree, setDegree] = useState(8);
  const [nTrain, setNTrain] = useState(20);
  const [noise, setNoise] = useState(0.15);
  const [numTrials, setNumTrials] = useState(30);
  const [seedOffset, setSeedOffset] = useState(0);

  const { curves, meanCurve, truePoints, biasSq, variance, testErr, decomposition } = useMemo(() => {
    const trials: { x: number[]; y: number[] }[] = [];
    for (let t = 0; t < numTrials; t++) {
      trials.push(generateData(nTrain, noise, seedOffset * 10000 + t));
    }

    const curveX = Array.from({ length: 200 }, (_, i) => (i / 199) * (X_MAX - X_MIN) + X_MIN);
    const fittedWeights = trials.map((tr) => polyFit(tr.x, tr.y, degree));
    const allCurves = fittedWeights.map((weights) => predict(curveX, weights));

    const meanPred = curveX.map((_, i) => allCurves.reduce((sum, c) => sum + c[i], 0) / allCurves.length);
    const varPred = curveX.map((_, i) => {
      const mean = meanPred[i];
      return allCurves.reduce((sum, c) => sum + Math.pow(c[i] - mean, 2), 0) / allCurves.length;
    });

    const testData = generateData(200, noise, seedOffset * 10000 + 99999);
    const testPreds = fittedWeights.map((weights) => predict(testData.x, weights));
    const avgTestErr =
      testPreds.reduce((sum, pred) => sum + mse(pred, testData.y), 0) / testPreds.length;

    const bias2 =
      meanPred.reduce((sum, mp, i) => sum + Math.pow(mp - trueFunction(curveX[i]), 2), 0) /
      curveX.length;
    const varAvg = varPred.reduce((sum, v) => sum + v, 0) / varPred.length;

    return {
      curves: allCurves,
      meanCurve: curveX.map((x, i) => ({ x, y: meanPred[i] })),
      truePoints: curveX.map((x) => ({ x, y: trueFunction(x) })),
      biasSq: bias2,
      variance: varAvg,
      testErr: avgTestErr,
      decomposition: noise * noise + bias2 + varAvg,
    };
  }, [degree, nTrain, noise, numTrials, seedOffset]);

  const effectiveDegree = Math.min(degree, nTrain - 1);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`多项式次数: ${degree}${degree !== effectiveDegree ? ` (实际拟合: ${effectiveDegree})` : ''}`}>
            <Slider aria-label="方差实验多项式次数" value={[degree]} min={1} max={15} step={1} onValueChange={(v) => setDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="方差实验训练样本数" value={[nTrain]} min={10} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="方差实验噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </ControlRow>
          <ControlRow label={`重复实验次数: ${numTrials}`}>
            <Slider aria-label="方差实验重复次数" value={[numTrials]} min={10} max={100} step={10} onValueChange={(v) => setNumTrials(v[0])} />
          </ControlRow>
          <button
            type="button"
            onClick={() => setSeedOffset((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新采样
          </button>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">平均偏差²:</span>
              <span className="font-mono font-medium text-rose-700">{biasSq.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均方差:</span>
              <span className="font-mono font-medium text-amber-700">{variance.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均测试误差:</span>
              <span className="font-mono font-medium text-emerald-700">{testErr.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">噪声² + 偏差² + 方差:</span>
              <span className="font-mono font-medium text-violet-700">{decomposition.toFixed(6)}</span>
            </div>
            <p className="pt-1 text-xs text-gray-500">两者来自有限次数的不同蒙特卡洛估计，因此通常接近但不完全相等。</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label="多次训练所得拟合曲线、平均模型与真实函数">
            <title>多次采样下的模型方差与偏差</title>
            <defs>
              <clipPath id="variance-chart-clip">
                <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} />
              </clipPath>
            </defs>
            <ChartFrame />
            <g clipPath="url(#variance-chart-clip)">
              <path d={pathFromPoints(truePoints)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              {curves.map((c, idx) => {
                const pts = c.map((y, i) => ({ x: (i / 199) * (X_MAX - X_MIN) + X_MIN, y }));
                return <path key={idx} d={pathFromPoints(pts)} fill="none" stroke="#9ca3af" strokeWidth={1} opacity={0.25} />;
              })}
              <path d={pathFromPoints(meanCurve)} fill="none" stroke="#f97316" strokeWidth={3} />
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-gray-400" /> 各次拟合</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-orange-500" /> 平均模型 h̄</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-700" /> 真实函数</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 演示 3：偏差-方差权衡曲线                                                  */
/* -------------------------------------------------------------------------- */
function TradeoffCurveDemo() {
  const [nTrain, setNTrain] = useState(20);
  const [noise, setNoise] = useState(0.15);
  const [maxDegree, setMaxDegree] = useState(15);
  const [numTrials, setNumTrials] = useState(30);
  const [seedOffset, setSeedOffset] = useState(0);
  const effectiveMaxDegree = Math.min(maxDegree, nTrain - 1);

  const curveData = useMemo(() => {
    const result: { degree: number; train: number; test: number }[] = [];
    const trials = Array.from({ length: numTrials }, (_, t) => ({
      train: generateData(nTrain, noise, seedOffset * 100000 + t),
      test: generateData(200, noise, seedOffset * 100000 + t + 50000),
    }));
    for (let d = 1; d <= effectiveMaxDegree; d++) {
      let trainSum = 0;
      let testSum = 0;
      for (const trial of trials) {
        const weights = polyFit(trial.train.x, trial.train.y, d);
        trainSum += mse(predict(trial.train.x, weights), trial.train.y);
        testSum += mse(predict(trial.test.x, weights), trial.test.y);
      }
      result.push({ degree: d, train: trainSum / numTrials, test: testSum / numTrials });
    }
    return result;
  }, [nTrain, noise, effectiveMaxDegree, numTrials, seedOffset]);

  const CW = 720;
  const CH = 360;
  const CP = { top: 25, right: 40, bottom: 50, left: 70 };
  const rawMaxErr = Math.max(...curveData.map((d) => Math.max(d.train, d.test)), 0.01);
  const yFloor = 1e-6;
  const logMin = Math.log10(yFloor);
  const logMax = Math.max(logMin + 1, Math.ceil(Math.log10(rawMaxErr)));
  const yCeiling = 10 ** logMax;

  function cx(degree: number): number {
    return CP.left + ((degree - 1) / (effectiveMaxDegree - 1 || 1)) * (CW - CP.left - CP.right);
  }
  function cy(err: number): number {
    const clamped = Math.min(Math.max(err, yFloor), yCeiling);
    const ratio = (Math.log10(clamped) - logMin) / (logMax - logMin);
    return CH - CP.bottom - ratio * (CH - CP.top - CP.bottom);
  }
  function formatY(y: number): string {
    if (y === 0) return '0';
    if (y < 0.001) return y.toExponential(1);
    if (y < 0.01) return y.toFixed(4);
    if (y < 0.1) return y.toFixed(3);
    if (y < 1) return y.toFixed(2);
    if (y < 10) return y.toFixed(2);
    return y.toFixed(1);
  }
  const yTicks = Array.from({ length: 5 }, (_, i) => 10 ** (logMin + ((logMax - logMin) * i) / 4));

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="权衡曲线训练样本数" value={[nTrain]} min={10} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="权衡曲线噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </ControlRow>
          <ControlRow label={`最大多项式次数: ${effectiveMaxDegree}${maxDegree !== effectiveMaxDegree ? `（受样本数限制，原设定 ${maxDegree}）` : ''}`}>
            <Slider aria-label="权衡曲线最大多项式次数" value={[effectiveMaxDegree]} min={3} max={Math.min(20, nTrain - 1)} step={1} onValueChange={(v) => setMaxDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`重复实验次数: ${numTrials}`}>
            <Slider aria-label="权衡曲线重复次数" value={[numTrials]} min={10} max={100} step={10} onValueChange={(v) => setNumTrials(v[0])} />
          </ControlRow>
          <button
            type="button"
            onClick={() => setSeedOffset((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新采样
          </button>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label="训练与测试误差随多项式次数变化的曲线">
            <title>偏差方差权衡曲线</title>
            <rect x={CP.left} y={CP.top} width={CW - CP.left - CP.right} height={CH - CP.top - CP.bottom} fill="#f9fafb" />
            {[1, 5, 10, 15, 20].filter((d) => d <= effectiveMaxDegree).map((d) => (
              <line key={`vx-${d}`} x1={cx(d)} y1={CP.top} x2={cx(d)} y2={CH - CP.bottom} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {yTicks.map((e) => (
              <line key={`hy-${e}`} x1={CP.left} y1={cy(e)} x2={CW - CP.right} y2={cy(e)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            <line x1={CP.left} y1={CH - CP.bottom} x2={CW - CP.right} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            <line x1={CP.left} y1={CP.top} x2={CP.left} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            {[1, 5, 10, 15, 20].filter((d) => d <= effectiveMaxDegree).map((d) => (
              <text key={`lx-${d}`} x={cx(d)} y={CH - CP.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">
                {d}
              </text>
            ))}
            {yTicks.map((e) => (
              <text key={`ly-${e}`} x={CP.left - 10} y={cy(e) + 4} textAnchor="end" fontSize={12} fill="#4b5563">
                {formatY(e)}
              </text>
            ))}
            <text x={CW / 2} y={CH - 10} textAnchor="middle" fontSize={13} fill="#374151">
              多项式次数
            </text>
            <text x={20} y={CH / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${CH / 2})`}>
              均方误差（对数刻度）
            </text>

            <polyline
              points={curveData.map((d) => `${cx(d.degree)},${cy(d.train)}`).join(' ')}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2}
            />
            <polyline
              points={curveData.map((d) => `${cx(d.degree)},${cy(d.test)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
            {curveData.map((d) => (
              <g key={`pt-${d.degree}`}>
                <circle cx={cx(d.degree)} cy={cy(d.train)} r={3} fill="#2563eb" />
                <circle cx={cx(d.degree)} cy={cy(d.test)} r={3} fill="#ef4444" />
              </g>
            ))}
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600" /> 平均训练误差</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> 平均测试误差</span>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">纵轴采用对数刻度；小于 10⁻⁶ 的近零训练误差显示在底边。</p>
        </div>
      </div>
    </div>
  );
}
