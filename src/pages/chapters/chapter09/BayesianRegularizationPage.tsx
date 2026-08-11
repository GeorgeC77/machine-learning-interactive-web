import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Sigma, CheckCircle2 , Circle} from 'lucide-react';
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
        <text key={`lx-${x}`} x={scaleX(x)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">{x.toFixed(1)}</text>
      ))}
      {gridY.map((y) => (
        <text key={`ly-${y}`} x={PADDING.left - 10} y={scaleY(y) + 4} textAnchor="end" fontSize={12} fill="#4b5563">{y.toFixed(1)}</text>
      ))}
      <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" fontSize={13} fill="#374151">x</text>
      <text x={20} y={HEIGHT / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${HEIGHT / 2})`}>y</text>
    </>
  );
}

export default function BayesianRegularizationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第九章 · 正则化与模型选择
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">贝叶斯统计与正则化</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          从贝叶斯统计的角度看，许多正则项可以解释为参数先验的负对数。最大后验估计（MAP）同时考虑似然与先验，
          在特定似然、先验和损失缩放下会得到熟悉的正则化目标。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sigma className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">频率学派 vs 贝叶斯学派</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在频率学派中，参数 θ 被看作未知的固定常数，我们通过最大似然估计（MLE）来寻找它。
          在贝叶斯学派中，参数 θ 本身是一个随机变量，我们对它有一个先验信念 p(θ)。
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <FormulaCard
            title="最大似然估计（MLE）"
            formula={
              <KaTeX
                math={String.raw`\theta_{\text{MLE}} = \arg\max_\theta \prod_{i=1}^n p\bigl(y^{(i)}|x^{(i)};\theta\bigr)`}
                display
              />
            }
            description="MLE 只使用数据似然；在有限样本或高维模型中可能具有较高方差。"
          />
          <FormulaCard
            title="最大后验估计（MAP）"
            formula={
              <KaTeX
                math={String.raw`\theta_{\text{MAP}} = \arg\max_\theta \left(\prod_{i=1}^n p\bigl(y^{(i)}|x^{(i)},\theta\bigr)\right) p(\theta)`}
                display
              />
            }
            description="MAP 最大化似然与先验的乘积；取负对数后，负对数先验表现为参数惩罚项。"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">高斯先验与 L2 正则化</h2>
        <p className="text-gray-700 mb-4">
          在线性高斯回归中，若观测噪声方差为 σ²，受正则的系数满足零均值高斯先验 θ̃∼N(0,τ²I)，
          并对截距采用平坦先验，那么负对数后验为：
        </p>
        <FormulaCard
          title="高斯似然 + 高斯先验 = L2 型 MAP"
          formula={
            <KaTeX
              math={String.raw`-\log p(\theta\mid\mathcal D)
              =\frac{1}{2\sigma^2}\|y-X\theta\|_2^2
              +\frac{1}{2\tau^2}\|\tilde\theta\|_2^2+C`}
              display
            />
          }
          description="若数据项写成 (1/2n)‖y−Xθ‖²、正则项写成 (λ/2)‖θ̃‖²，则 λ=σ²/(nτ²)。因此先验方差越小，正则越强；对应关系取决于噪声方差与目标函数缩放。"
        />

        <p className="text-gray-700 mt-4">
          交互演示：调整以正则化强度 λ 表示的先验约束，观察 MAP 估计如何从无正则化的 MLE
          逐渐转变为更受先验影响的解。演示在 z=2x−1 的 Chebyshev 基上使用增广 QR，并且不惩罚常数项。
        </p>
        <BayesianDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>贝叶斯方法把参数看作随机变量，通过先验表达我们的信念。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>MAP 的负对数目标由负对数似然与负对数先验组成，后者可表现为正则项。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在线性高斯回归中，高斯系数先验导出 L2 型 MAP；λ 还取决于噪声方差、样本数与损失缩放。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 交互演示                                                                   */
/* -------------------------------------------------------------------------- */
function BayesianDemo() {
  const [degree, setDegree] = useState(12);
  const [lambda, setLambda] = useState(0.05);
  const [nTrain, setNTrain] = useState(20);
  const [noise, setNoise] = useState(0.2);
  const [seed, setSeed] = useState(42);
  const effectiveDegree = Math.min(degree, nTrain - 1);

  const { train, weights, trainError, testError, predPoints, truePoints, mlePredPoints } = useMemo(() => {
    const tr = generateData(nTrain, noise, seed);
    const te = generateData(200, noise, seed + 1000);
    const wMap = fitPolyRidge(tr.x, tr.y, effectiveDegree, lambda);
    const wMle = fitPolyRidge(tr.x, tr.y, effectiveDegree, 0);
    const curvePoints = Array.from({ length: 200 }, (_, i) => (i / 199) * (X_MAX - X_MIN) + X_MIN);
    return {
      train: tr,
      weights: wMap,
      trainError: mse(predict(tr.x, wMap), tr.y),
      testError: mse(predict(te.x, wMap), te.y),
      predPoints: curvePoints.map((x) => ({ x, y: predict([x], wMap)[0] })),
      mlePredPoints: curvePoints.map((x) => ({ x, y: predict([x], wMle)[0] })),
      truePoints: curvePoints.map((x) => ({ x, y: trueFunction(x) })),
    };
  }, [effectiveDegree, lambda, nTrain, noise, seed]);

  return (
    <div className="space-y-4 mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`MAP 正则强度 λ: ${lambda.toFixed(3)}`}>
            <Slider aria-label="MAP 正则强度" value={[lambda]} min={0} max={0.5} step={0.001} onValueChange={(v) => setLambda(v[0])} />
          </ControlRow>
          <ControlRow label={`多项式次数: ${effectiveDegree}${degree !== effectiveDegree ? `（受样本数限制，原设定 ${degree}）` : ''}`}>
            <Slider aria-label="多项式次数" value={[degree]} min={1} max={15} step={1} onValueChange={(v) => setDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="训练样本数" value={[nTrain]} min={10} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
          </ControlRow>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新采样
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">MAP 训练误差:</span>
              <span className="font-mono font-medium text-blue-700">{trainError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MAP 独立模拟集误差:</span>
              <span className="font-mono font-medium text-emerald-700">{testError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">受正则系数的 L2 范数:</span>
              <span className="font-mono font-medium text-gray-700">
                {Math.sqrt(weights.slice(1).reduce((sum, w) => sum + w * w, 0)).toFixed(6)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">模拟集指标仅用于教学观察，不应在真实任务中据此选择 λ。</p>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[360px]"
            style={{ maxHeight: 360 }}
            role="img"
            aria-labelledby="bayesian-demo-title bayesian-demo-desc"
          >
            <title id="bayesian-demo-title">MAP 与 MLE 多项式拟合对比</title>
            <desc id="bayesian-demo-desc">显示训练点、真实函数、未正则化的最大似然曲线和高斯先验下的最大后验曲线。</desc>
            <defs>
              <clipPath id="bayesian-regularization-chart-clip">
                <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} />
              </clipPath>
            </defs>
            <ChartFrame />
            <g clipPath="url(#bayesian-regularization-chart-clip)">
              <path d={pathFromPoints(truePoints)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              <path d={pathFromPoints(mlePredPoints)} fill="none" stroke="#9ca3af" strokeWidth={2} />
              <path d={pathFromPoints(predPoints)} fill="none" stroke="#2563eb" strokeWidth={3} />
              {train.x.map((x, i) => (
                <circle key={`tr-${i}`} cx={scaleX(x)} cy={scaleY(train.y[i])} r={4} fill="#f97316" opacity={0.7} />
              ))}
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> 训练点</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> MAP 解</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-gray-400" /> MLE 解</span>
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
