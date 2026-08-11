import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, SplitSquareHorizontal, CheckCircle2 , Circle} from 'lucide-react';
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

function polyFit(xs: number[], ys: number[], degree: number): number[] {
  const effectiveDegree = Math.max(0, Math.min(degree, xs.length - 1));
  const X = designMatrix(xs, effectiveDegree);
  return leastSquaresQR(X, ys);
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

export default function CrossValidationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第九章 · 正则化与模型选择
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">交叉验证与模型选择</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          模型选择的目标是依据有限数据找到合适的偏差—方差折中。交叉验证通过把数据分成训练集和验证集，
          用验证集上的误差来估计模型的泛化性能，从而选择最合适的模型复杂度。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <SplitSquareHorizontal className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么不能用训练误差选模型？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          对嵌套模型族，增加复杂度通常不会增大最优训练误差。如果仅凭训练误差选择模型，
          选择过程会系统性偏向高容量模型并增加过拟合风险。因此，需要模型拟合阶段没有使用的数据来估计泛化表现。
        </p>

        <FormulaCard
          title="留出交叉验证"
          formula={
            <KaTeX
              math={String.raw`\hat{\varepsilon}_{\text{cv}}(h) = \frac{1}{|S_{\text{cv}}|}\sum_{(x,y)\in S_{\text{cv}}} \bigl(y - h(x)\bigr)^2`}
              display
            />
          }
          description="将数据随机分为训练集与验证集，用训练集训练模型，用验证集估计泛化误差。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：k 折交叉验证</h2>
        <p className="text-gray-700 mb-4">
          数据集被均分为 k 份。每次取其中一份作为验证集，其余作为训练集，最后把 k 次验证误差平均。
          调整多项式次数，观察训练误差、平均验证误差和独立测试误差的变化。
          为避免高次幂的数值病态，拟合在 z=2x−1 的 Chebyshev 多项式基上用 QR 最小二乘完成。
        </p>
        <CrossValidationDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>对嵌套模型族，训练误差通常偏向高容量模型，不能作为泛化性能的无偏比较依据。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>留出法简单但浪费数据；k 折交叉验证更充分地利用数据。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>验证误差用于模型选择，但选择本身会产生偏差；最终性能应在独立测试集上只评估一次。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 交互演示                                                                   */
/* -------------------------------------------------------------------------- */
function CrossValidationDemo() {
  const [degree, setDegree] = useState(5);
  const [k, setK] = useState(5);
  const [nTrain, setNTrain] = useState(30);
  const [noise, setNoise] = useState(0.2);
  const [seed, setSeed] = useState(42);
  const [revealedTestConfig, setRevealedTestConfig] = useState<string | null>(null);
  const minFoldTrainSize = nTrain - Math.ceil(nTrain / k);
  const effectiveDegree = Math.min(degree, minFoldTrainSize - 1);
  const configKey = `${effectiveDegree}-${k}-${nTrain}-${noise.toFixed(4)}-${seed}`;

  const { fullData, foldResults, trainError, valError, testError, predPoints, truePoints } = useMemo(() => {
    const data = generateData(nTrain, noise, seed);
    const testData = generateData(100, noise, seed + 2000);

    // 按索引模 k 分配到 k 个折，确保每个样本都进入某个验证折
    const indices = data.x.map((_, i) => i);
    const folds = Array.from({ length: k }, (_, f) => ({
      indices: indices.filter((_, i) => i % k === f),
    }));

    const results = folds.map((fold) => {
      const trainIndices = data.x.map((_, i) => i).filter((i) => !fold.indices.includes(i));
      const trainX = trainIndices.map((i) => data.x[i]);
      const trainY = trainIndices.map((i) => data.y[i]);
      const valX = fold.indices.map((i) => data.x[i]);
      const valY = fold.indices.map((i) => data.y[i]);

      const w = polyFit(trainX, trainY, effectiveDegree);
      const trainErr = mse(predict(trainX, w), trainY);
      const valErr = mse(predict(valX, w), valY);
      return { trainErr, valErr, valCount: valY.length, valIndices: fold.indices };
    });

    const avgTrain = results.reduce((sum, r) => sum + r.trainErr, 0) / results.length;
    const totalValidationCount = results.reduce((sum, result) => sum + result.valCount, 0);
    const avgVal = results.reduce((sum, result) => sum + result.valErr * result.valCount, 0) / totalValidationCount;

    // 在全训练集上重新训练并评估测试集
    const finalW = polyFit(data.x, data.y, effectiveDegree);
    const testErr = mse(predict(testData.x, finalW), testData.y);

    const curvePoints = Array.from({ length: 200 }, (_, i) => (i / 199) * (X_MAX - X_MIN) + X_MIN);
    return {
      fullData: data,
      foldResults: results,
      trainError: avgTrain,
      valError: avgVal,
      testError: testErr,
      predPoints: curvePoints.map((x) => ({ x, y: predict([x], finalW)[0] })),
      truePoints: curvePoints.map((x) => ({ x, y: trueFunction(x) })),
    };
  }, [effectiveDegree, k, nTrain, noise, seed]);

  const colors = ['#f97316', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#84cc16', '#6366f1', '#14b8a6', '#d946ef'];
  const pointFold = fullData.x.map((_, i) => {
    const f = foldResults.findIndex((r) => r.valIndices.includes(i));
    return f >= 0 ? f : -1;
  });

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`多项式次数: ${effectiveDegree}${degree !== effectiveDegree ? `（折内样本限制，原设定 ${degree}）` : ''}`}>
            <Slider aria-label="交叉验证多项式次数" value={[effectiveDegree]} min={1} max={Math.min(12, minFoldTrainSize - 1)} step={1} onValueChange={(v) => setDegree(v[0])} />
          </ControlRow>
          <ControlRow label={`折数 k: ${k}`}>
            <Slider aria-label="交叉验证折数" value={[k]} min={2} max={10} step={1} onValueChange={(v) => setK(v[0])} />
          </ControlRow>
          <ControlRow label={`训练样本数: ${nTrain}`}>
            <Slider aria-label="交叉验证样本数" value={[nTrain]} min={20} max={100} step={5} onValueChange={(v) => setNTrain(v[0])} />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(2)}`}>
            <Slider aria-label="交叉验证噪声标准差" value={[noise]} min={0} max={0.5} step={0.01} onValueChange={(v) => setNoise(v[0])} />
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
              <span className="text-gray-600">平均训练误差:</span>
              <span className="font-mono font-medium text-blue-700">{trainError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均验证误差:</span>
              <span className="font-mono font-medium text-violet-700">{valError.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">测试误差:</span>
              <span className="font-mono font-medium text-emerald-700">
                {revealedTestConfig === configKey
                  ? testError.toFixed(6)
                  : revealedTestConfig === null
                    ? '尚未查看'
                    : '已用于另一配置'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRevealedTestConfig(configKey)}
              disabled={revealedTestConfig !== null}
              className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {revealedTestConfig === configKey
                ? '该配置已完成独立测试'
                : revealedTestConfig === null
                  ? '锁定当前配置并查看一次测试误差'
                  : '测试集已使用，请勿再次调参评估'}
            </button>
            <p className="pt-1 text-xs text-gray-500">每次页面会话只允许使用一次独立测试集；先根据验证误差确定配置。</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label={`${k} 折交叉验证的数据划分与最终拟合曲线`}>
            <title>k 折交叉验证数据划分</title>
            <defs>
              <clipPath id="cross-validation-chart-clip">
                <rect x={PADDING.left} y={PADDING.top} width={WIDTH - PADDING.left - PADDING.right} height={HEIGHT - PADDING.top - PADDING.bottom} />
              </clipPath>
            </defs>
            <ChartFrame />
            <g clipPath="url(#cross-validation-chart-clip)">
              <path d={pathFromPoints(truePoints)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              <path d={pathFromPoints(predPoints)} fill="none" stroke="#2563eb" strokeWidth={3} />
              {fullData.x.map((x, i) => {
                const f = pointFold[i];
                const color = f >= 0 ? colors[f % colors.length] : '#9ca3af';
                return (
                  <circle key={`tr-${i}`} cx={scaleX(x)} cy={scaleY(fullData.y[i])} r={5} fill={color} opacity={0.8} stroke="white" strokeWidth={1} />
                );
              })}
            </g>
          </svg>
          <div className="flex flex-wrap gap-3 justify-center mt-2 text-xs text-gray-600">
            {Array.from({ length: k }, (_, f) => (
              <span key={f} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[f % colors.length] }} />
                第 {f + 1} 折验证集
              </span>
            ))}
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
