import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, SlidersHorizontal, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

/* -------------------------------------------------------------------------- */
/* 数值工具                                                                   */
/* -------------------------------------------------------------------------- */
function leastSquaresQR(A: number[][], b: number[]): number[] {
  const columns = A[0].map((_, j) => A.map((row) => row[j]));
  const qColumns: number[][] = [];
  const r = Array.from({ length: columns.length }, () => new Array(columns.length).fill(0));
  for (let j = 0; j < columns.length; j += 1) {
    const v = [...columns[j]];
    for (let pass = 0; pass < 2; pass += 1) {
      for (let i = 0; i < j; i += 1) {
        const projection = qColumns[i].reduce((sum, q, row) => sum + q * v[row], 0);
        r[i][j] += projection;
        for (let row = 0; row < v.length; row += 1) v[row] -= projection * qColumns[i][row];
      }
    }
    const norm = Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
    if (norm < 1e-12) return new Array(columns.length).fill(0);
    r[j][j] = norm;
    qColumns.push(v.map((value) => value / norm));
  }
  const qty = qColumns.map((column) => column.reduce((sum, q, row) => sum + q * b[row], 0));
  const result = new Array(columns.length).fill(0);
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const known = r[i].reduce((sum, value, j) => (j > i ? sum + value * result[j] : sum), 0);
    result[i] = (qty[i] - known) / r[i][i];
  }
  return result;
}

function polynomialBasis(x: number, degree: number): number[] {
  const z = 2 * x - 1;
  const basis = new Array(degree + 1).fill(0);
  basis[0] = 1;
  if (degree >= 1) basis[1] = z;
  for (let j = 2; j <= degree; j += 1) basis[j] = 2 * z * basis[j - 1] - basis[j - 2];
  return basis;
}

function designMatrix(xs: number[], degree: number): number[][] {
  return xs.map((x) => polynomialBasis(x, degree));
}

function fitPolyRidge(xs: number[], ys: number[], degree: number, lambda: number): number[] {
  const effectiveDegree = Math.max(0, Math.min(degree, xs.length - 1));
  const X = designMatrix(xs, effectiveDegree);
  const scale = 1 / Math.sqrt(X.length);
  const augmentedX = X.map((row) => row.map((value) => value * scale));
  const augmentedY = ys.map((value) => value * scale);
  if (lambda > 0) {
    for (let j = 1; j < X[0].length; j += 1) {
      const penaltyRow = new Array(X[0].length).fill(0);
      penaltyRow[j] = Math.sqrt(lambda);
      augmentedX.push(penaltyRow);
      augmentedY.push(0);
    }
  }
  return leastSquaresQR(augmentedX, augmentedY);
}

function fitPolyLasso(xs: number[], ys: number[], degree: number, lambda: number, steps = 10000): number[] {
  if (lambda === 0) return fitPolyRidge(xs, ys, degree, 0);
  const effectiveDegree = Math.max(0, Math.min(degree, xs.length - 1));
  const X = designMatrix(xs, effectiveDegree);
  const n = X.length;
  const d = X[0].length;
  const w = new Array(d).fill(0);
  const gram = Array.from({ length: d }, (_, j) =>
    Array.from({ length: d }, (_, k) => X.reduce((sum, row) => sum + row[j] * row[k], 0) / n),
  );
  const target = Array.from(
    { length: d },
    (_, j) => X.reduce((sum, row, i) => sum + row[j] * ys[i], 0) / n,
  );
  for (let step = 0; step < steps; step++) {
    let maxChange = 0;
    for (let j = 0; j < d; j++) {
      const rho = target[j] - gram[j].reduce(
        (sum, covariance, k) => (k === j ? sum : sum + covariance * w[k]),
        0,
      );
      const next = j === 0
        ? rho / gram[j][j]
        : Math.sign(rho) * Math.max(Math.abs(rho) - lambda, 0) / gram[j][j];
      const change = next - w[j];
      w[j] = next;
      maxChange = Math.max(maxChange, Math.abs(change));
    }
    if (maxChange < 1e-11) break;
  }
  return w;
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

/* -------------------------------------------------------------------------- */
/* SVG 参数                                                                   */
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

function ChartFrame() {
  const gridX = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const gridY = [-0.5, 0, 0.5, 1.0, 1.5];
  return (
    <>
      <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} fill="#f9fafb" />
      {gridX.map((x) => (
        <line key={`vx-${x}`} x1={scaleX(x)} y1={PADDING.top} x2={scaleX(x)} y2={HEIGHT - PADDING.bottom} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      {gridY.map((y) => (
        <line key={`hy-${y}`} x1={PADDING.left} y1={scaleY(y)} x2={WIDTH - PADDING.right} y2={scaleY(y)} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      <line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
      <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="#374151" strokeWidth={2} />
      {gridX.map((x) => (
        <text key={`lx-${x}`} x={scaleX(x)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">
          {x.toFixed(1)}
        </text>
      ))}
      {gridY.map((y) => (
        <text key={`ly-${y}`} x={PADDING.left - 10} y={scaleY(y) + 4} textAnchor="end" fontSize={12} fill="#4b5563">
          {y.toFixed(1)}
        </text>
      ))}
      <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" fontSize={13} fill="#374151">x</text>
      <text x={20} y={HEIGHT / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${HEIGHT / 2})`}>y</text>
    </>
  );
}

export default function RegularizationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第九章 · 正则化与模型选择
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">正则化</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          正则化通过在损失函数中加入惩罚项来控制模型复杂度。L2 正则化倾向于让参数变小，
          L1 正则化（LASSO）则倾向于产生稀疏解。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <SlidersHorizontal className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">正则化损失函数</h2>
        </div>
        <p className="text-gray-700 mb-4">
          当模型过于复杂时，它可能会记住训练数据中的噪声而不是学习潜在规律。正则化在优化目标中加入一个惩罚项，
          使得模型在拟合数据的同时保持较小的复杂度。下式中的 θ̃ 表示不含截距的受正则系数。
        </p>

        <FormulaCard
          title="正则化目标"
          formula={
            <KaTeX
              math={String.raw`J_{\text{reg}}(\theta) = J(\theta) + \lambda R(\theta)`}
              display
            />
          }
          description="λ 是正则化强度：λ=0 时退化为原始损失；λ 越大，对模型复杂度的惩罚越强。"
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">L2 正则化 / 权重衰减</h3>
            <KaTeX math={String.raw`R(\theta) = \frac{1}{2}\|\tilde\theta\|_2^2`} />
            <p className="text-sm text-gray-700 mt-2">
              通常只惩罚非截距系数，使其整体变小。在普通 SGD 下，L2 正则化与 weight decay 形式等价；在 AdamW 等优化器中，weight decay 通常采用解耦实现，与直接加入 L2 penalty 不完全相同。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">L1 正则化 / LASSO</h3>
            <KaTeX math={String.raw`R(\theta) = \|\tilde\theta\|_1`} />
            <p className="text-sm text-gray-700 mt-2">
              通常不惩罚截距，并倾向于让部分系数精确为零，从而产生稀疏模型。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：不同正则化对比</h2>
        <p className="text-gray-700 mb-4">
          真实函数是二次曲线。我们用一个较高次的多项式拟合，比较无正则化、L2 和 L1 正则化的效果。
        </p>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          为改善高次多项式的数值条件，本演示在 z=2x−1 上使用 Chebyshev 基，并且不惩罚常数项。
          L1 与 L2 都对应同一个平均平方损失尺度：L2 用增广 QR 求解，L1 用坐标下降求解。
        </div>

        <RegularizationDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>正则化通过惩罚模型复杂度来缓解过拟合，但强度过大也可能导致欠拟合。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>L2 正则化让参数变小但通常不为零；在普通 SGD 下它与权重衰减形式等价。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>L1 正则化可以产生精确为零的系数；在适当条件下可用于稀疏建模或特征选择。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 交互演示                                                                   */
/* -------------------------------------------------------------------------- */
function RegularizationDemo() {
  const [degree, setDegree] = useState(12);
  const [nTrain, setNTrain] = useState(20);
  const [noise, setNoise] = useState(0.2);
  const [lambda, setLambda] = useState(0.05);
  const [regType, setRegType] = useState<'none' | 'l2' | 'l1'>('l2');
  const [seed, setSeed] = useState(42);

  const { train, weights, trainError, testError, predPoints, truePoints } = useMemo(() => {
    const tr = generateData(nTrain, noise, seed);
    const te = generateData(200, noise, seed + 1000);
    let w: number[];
    if (regType === 'none') {
      w = fitPolyRidge(tr.x, tr.y, degree, 0);
    } else if (regType === 'l2') {
      w = fitPolyRidge(tr.x, tr.y, degree, lambda);
    } else {
      w = fitPolyLasso(tr.x, tr.y, degree, lambda);
    }
    const predTrain = predict(tr.x, w);
    const predTest = predict(te.x, w);
    const curvePoints = Array.from({ length: 200 }, (_, i) => (i / 199) * (X_MAX - X_MIN) + X_MIN);
    return {
      train: tr,
      weights: w,
      trainError: mse(predTrain, tr.y),
      testError: mse(predTest, te.y),
      predPoints: curvePoints.map((x) => ({ x, y: predict([x], w)[0] })),
      truePoints: curvePoints.map((x) => ({ x, y: trueFunction(x) })),
    };
  }, [degree, nTrain, noise, lambda, regType, seed]);

  const effectiveDegree = Math.min(degree, nTrain - 1);
  const maxAbsWeight = Math.max(...weights.map(Math.abs), 1e-6);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`多项式次数: ${degree}${degree !== effectiveDegree ? ` (实际拟合: ${effectiveDegree})` : ''}`}>
            <Slider aria-label="正则化演示多项式次数" value={[degree]} min={1} max={15} step={1} onValueChange={(v) => setDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="正则化演示训练样本数" value={[nTrain]} min={10} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="正则化演示噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </ControlRow>
          <ControlRow label={`正则化强度 λ: ${lambda.toFixed(3)}`}>
            <Slider aria-label="正则化强度 lambda" value={[lambda]} min={0} max={0.5} step={0.001} onValueChange={(v) => setLambda(v[0])} />
          </ControlRow>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正则化类型</label>
            <div className="flex flex-wrap gap-2">
              {(['none', 'l2', 'l1'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRegType(t)}
                  aria-pressed={regType === t}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    regType === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t === 'none' ? '无' : t === 'l2' ? 'L2' : 'L1'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新采样
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">训练误差:</span>
              <span className="font-mono font-medium text-blue-700">{trainError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">独立模拟集误差:</span>
              <span className="font-mono font-medium text-emerald-700">{testError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">非零参数:</span>
              <span className="font-mono font-medium text-gray-700">{weights.filter((w) => Math.abs(w) > 1e-6).length}/{weights.length}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">模拟集指标仅用于观察正则化效果；实际调参应使用验证集，并把测试集留到最终评估。</p>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label={`${regType === 'none' ? '无正则' : regType.toUpperCase()}多项式拟合曲线`}>
            <title>不同正则化下的多项式拟合</title>
            <defs>
              <clipPath id="regularization-chart-clip">
                <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} />
              </clipPath>
            </defs>
            <ChartFrame />
            <g clipPath="url(#regularization-chart-clip)">
              <path d={pathFromPoints(truePoints)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              <path d={pathFromPoints(predPoints)} fill="none" stroke="#2563eb" strokeWidth={3} />
              {train.x.map((x, i) => (
                <circle key={`tr-${i}`} cx={scaleX(x)} cy={scaleY(train.y[i])} r={4} fill="#f97316" opacity={0.7} />
              ))}
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> 训练点</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> 拟合曲线</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-700" /> 真实函数</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Chebyshev 多项式系数大小</h3>
        <p className="text-xs text-gray-500 mb-3">Tⱼ 表示 z=2x−1 上的第 j 个 Chebyshev 基函数。</p>
        <div className="space-y-2">
          {weights.map((w, j) => (
            <div key={j} className="flex items-center gap-3">
              <span className="w-16 text-xs text-gray-500 font-mono">T_{j}</span>
              <div className="flex-grow h-6 bg-gray-100 rounded overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-blue-500 transition-all"
                  style={{
                    left: w >= 0 ? '50%' : `${50 + (w / maxAbsWeight) * 50}%`,
                    width: `${Math.abs(w) / maxAbsWeight * 50}%`,
                  }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400" />
              </div>
              <span className="w-24 text-xs font-mono text-right">{w.toFixed(6)}</span>
            </div>
          ))}
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
