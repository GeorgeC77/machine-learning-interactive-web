import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2, Play, SkipForward, RefreshCw, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

interface GMMParams {
  phi: number[];
  mu: number[];
  sigma: number[];
}

const MIN_SIGMA = 0.1;
const MIN_COMPONENT_MASS = 1e-10;

function gaussianLogPdf(x: number, mu: number, sigma: number): number {
  const safeSigma = Math.max(sigma, MIN_SIGMA);
  const z = (x - mu) / safeSigma;
  return -Math.log(safeSigma) - 0.5 * Math.log(2 * Math.PI) - 0.5 * z * z;
}

function gaussianPdf(x: number, mu: number, sigma: number): number {
  return Math.exp(gaussianLogPdf(x, mu, sigma));
}

function logSumExp(values: number[]): number {
  const maximum = Math.max(...values);
  if (!Number.isFinite(maximum)) return -Infinity;
  return maximum + Math.log(values.reduce((sum, value) => sum + Math.exp(value - maximum), 0));
}

function computeLogLikelihood(params: GMMParams, data: number[]): number {
  return data.reduce((sum, x) => {
    const logTerms = params.phi.map((phi, component) => (
      phi > 0 ? Math.log(phi) + gaussianLogPdf(x, params.mu[component], params.sigma[component]) : -Infinity
    ));
    return sum + logSumExp(logTerms);
  }, 0);
}

function runEMStep(current: GMMParams, data: number[]): GMMParams {
  const componentCount = current.phi.length;
  const responsibilities = data.map((x) => {
    const logWeights = current.phi.map((phi, component) => (
      phi > 0 ? Math.log(phi) + gaussianLogPdf(x, current.mu[component], current.sigma[component]) : -Infinity
    ));
    const normalizer = logSumExp(logWeights);
    return logWeights.map((value) => Math.exp(value - normalizer));
  });

  const masses = Array.from(
    { length: componentCount },
    (_, component) => responsibilities.reduce((sum, row) => sum + row[component], 0),
  );
  const safeMasses = masses.map((mass) => Math.max(mass, MIN_COMPONENT_MASS));
  const totalMass = safeMasses.reduce((sum, mass) => sum + mass, 0);
  const mu = masses.map((mass, component) => (
    mass <= MIN_COMPONENT_MASS
      ? current.mu[component]
      : responsibilities.reduce((sum, row, index) => sum + row[component] * data[index], 0) / mass
  ));
  const sigma = masses.map((mass, component) => {
    if (mass <= MIN_COMPONENT_MASS) return current.sigma[component];
    const variance = responsibilities.reduce(
      (sum, row, index) => sum + row[component] * Math.pow(data[index] - mu[component], 2),
      0,
    ) / mass;
    return Math.max(Math.sqrt(Math.max(variance, 0)), MIN_SIGMA);
  });

  return {
    phi: safeMasses.map((mass) => mass / totalMass),
    mu,
    sigma,
  };
}

function generateData(trueParams: GMMParams, n: number, seed: number): number[] {
  let s = seed;
  const data: number[] = [];
  const k = trueParams.phi.length;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const u = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const v = s / 233280;
    const g = Math.sqrt(-2 * Math.log(Math.max(1e-10, v))) * Math.cos(2 * Math.PI * u);

    let cum = 0;
    let comp = 0;
    s = (s * 9301 + 49297) % 233280;
    const u2 = s / 233280;
    for (let j = 0; j < k; j++) {
      cum += trueParams.phi[j];
      if (u2 < cum) {
        comp = j;
        break;
      }
    }
    data.push(trueParams.mu[comp] + trueParams.sigma[comp] * g);
  }
  return data;
}

function initialParams(k: number): GMMParams {
  if (k === 2) {
    return {
      phi: [0.5, 0.5],
      mu: [-1, 1],
      sigma: [1, 1],
    };
  }
  return {
    phi: [0.33, 0.34, 0.33],
    mu: [-2, 0, 2],
    sigma: [1, 1, 1],
  };
}

const trueParams2: GMMParams = {
  phi: [0.6, 0.4],
  mu: [-1.5, 1.5],
  sigma: [0.8, 1.0],
};

const trueParams3: GMMParams = {
  phi: [0.3, 0.5, 0.2],
  mu: [-2.5, 0, 2.5],
  sigma: [0.7, 0.9, 1.1],
};

export default function GaussianMixtureEMPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十一章 · EM 算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">高斯混合模型的 EM</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          高斯混合模型（GMM）是最常见的隐变量模型之一。EM 算法通过 E-step 计算每个样本属于每个高斯分量的后验概率，
          再通过 M-step 更新混合权重、均值和方差。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">模型与算法</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设数据由 K 个高斯分布混合生成，隐变量 z^(i) 表示第 i 个样本来自哪个高斯分量。
          由于 z^(i) 未知，观测似然包含“对数内求和”，直接优化较困难；EM 利用软责任度交替更新参数。
        </p>

        <FormulaCard
          title="E-step：计算后验权重"
          formula={
            <KaTeX
              math={String.raw`w_j^{(i)} = p\bigl(z^{(i)}=j|x^{(i)};\phi,\mu,\sigma\bigr) = \frac{\phi_j \, \mathcal{N}(x^{(i)};\mu_j,\sigma_j^2)}{\sum_{l=1}^K \phi_l \, \mathcal{N}(x^{(i)};\mu_l,\sigma_l^2)}`}
              display
            />
          }
          description="w_j^(i) 表示样本 i 属于第 j 个高斯分量的软分配概率。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：w_j^(i) = φ_j N(x^(i); μ_j, σ_j²) / Σ_l φ_l N(x^(i); μ_l, σ_l²)'}
        </p>

        <FormulaCard
          title="M-step：更新参数"
          formula={
            <KaTeX
              math={String.raw`\phi_j = \frac{1}{n}\sum_{i=1}^n w_j^{(i)} \quad \mu_j = \frac{\sum_i w_j^{(i)} x^{(i)}}{\sum_i w_j^{(i)}} \quad \sigma_j^2 = \frac{\sum_i w_j^{(i)} (x^{(i)}-\mu_j)^2}{\sum_i w_j^{(i)}}`}
              display
            />
          }
          description="M-step 的更新与完全数据最大似然估计形式相同，只是把硬指示函数换成了软权重。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：φ_j = (1/n)Σ_i w_j^(i); μ_j = Σ_i w_j^(i)x^(i) / Σ_i w_j^(i); σ_j² = Σ_i w_j^(i)(x^(i)−μ_j)² / Σ_i w_j^(i)'}
        </p>

        <p className="text-gray-700 mt-4 text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
          <strong>数值稳定性提示：</strong>
          无约束 GMM 中，某个分量可能塌缩到单个样本附近，使似然无界。本演示在对数域计算责任度，并设置 σ≥{MIN_SIGMA.toFixed(1)}；
          因此演示优化的是带方差下限的参数空间。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：一维 GMM 的 EM</h2>
        <p className="text-gray-700 mb-4">
          调整聚类数 K 与初始参数，逐步执行 E-step 和 M-step，观察拟合密度如何逼近真实密度。
        </p>
        <GMMEMDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>E-step 用当前参数计算隐变量的后验分布。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>M-step 用这些后验概率作为权重更新参数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>EM 可能到达局部解或奇异区域；对数域计算、方差约束与多次初始化是重要实践措施。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 交互演示                                                                   */
/* -------------------------------------------------------------------------- */
function GMMEMDemo() {
  const [k, setK] = useState(2);
  const [params, setParams] = useState<GMMParams>(() => initialParams(2));
  const [iterations, setIterations] = useState(0);
  const [seed, setSeed] = useState(42);
  const [previousLogLikelihood, setPreviousLogLikelihood] = useState<number | null>(null);
  const [terminationReason, setTerminationReason] = useState<'converged' | 'iteration-limit' | null>(null);

  const trueParams = k === 2 ? trueParams2 : trueParams3;
  const data = useMemo(() => generateData(trueParams, 500, seed), [trueParams, seed]);
  const logLikelihood = useMemo(() => computeLogLikelihood(params, data), [params, data]);
  const likelihoodChange = previousLogLikelihood === null ? null : logLikelihood - previousLogLikelihood;

  const doEMStep = () => {
    const next = runEMStep(params, data);
    const nextLogLikelihood = computeLogLikelihood(next, data);
    setPreviousLogLikelihood(logLikelihood);
    setParams(next);
    setIterations((iteration) => iteration + 1);
    setTerminationReason(Math.abs(nextLogLikelihood - logLikelihood) <= 1e-8 ? 'converged' : null);
  };

  const runToConvergence = () => {
    let current = params;
    let currentLogLikelihood = logLikelihood;
    let stepCount = 0;
    let converged = false;
    while (stepCount < 100) {
      const next = runEMStep(current, data);
      const nextLogLikelihood = computeLogLikelihood(next, data);
      stepCount += 1;
      current = next;
      if (Math.abs(nextLogLikelihood - currentLogLikelihood) <= 1e-8) {
        currentLogLikelihood = nextLogLikelihood;
        converged = true;
        break;
      }
      currentLogLikelihood = nextLogLikelihood;
    }
    setPreviousLogLikelihood(logLikelihood);
    setParams(current);
    setIterations((iteration) => iteration + stepCount);
    setTerminationReason(converged ? 'converged' : 'iteration-limit');
  };

  const reset = () => {
    setParams(initialParams(k));
    setIterations(0);
    setPreviousLogLikelihood(null);
    setTerminationReason(null);
  };

  const handleKChange = (nextK: number) => {
    if (nextK === k) return;
    setK(nextK);
    setParams(initialParams(nextK));
    setIterations(0);
    setPreviousLogLikelihood(null);
    setTerminationReason(null);
  };

  const regenerate = () => {
    setSeed((s) => s + 1);
    setParams(initialParams(k));
    setIterations(0);
    setPreviousLogLikelihood(null);
    setTerminationReason(null);
  };

  const updateParam = (type: 'mu' | 'sigma', idx: number, val: number) => {
    setParams((prev) => {
      const next = { ...prev, [type]: [...prev[type]] };
      next[type][idx] = val;
      if (type === 'sigma') next[type][idx] = Math.max(val, MIN_SIGMA);
      return next;
    });
    setIterations(0);
    setPreviousLogLikelihood(null);
    setTerminationReason(null);
  };

  // 绘图参数
  const CW = 720;
  const CH = 360;
  const CP = { top: 25, right: 30, bottom: 50, left: 60 };
  const xMin = -5;
  const xMax = 5;
  const bins = 40;
  const binWidth = (xMax - xMin) / bins;
  const histCounts = Array(bins).fill(0);
  let visibleSampleCount = 0;
  data.forEach((x) => {
    if (x < xMin || x > xMax) return;
    const index = Math.min(bins - 1, Math.floor((x - xMin) / binWidth));
    histCounts[index] += 1;
    visibleSampleCount += 1;
  });
  const histDensity = histCounts.map((count) => count / (data.length * binWidth));
  const curveXs = Array.from({ length: 200 }, (_, index) => xMin + (index / 199) * (xMax - xMin));
  const densityAt = (x: number, densityParams: GMMParams) => densityParams.phi.reduce(
    (sum, phi, component) => sum + phi * gaussianPdf(x, densityParams.mu[component], densityParams.sigma[component]),
    0,
  );
  const yMax = Math.max(
    0.4,
    ...histDensity,
    ...curveXs.map((x) => densityAt(x, trueParams)),
    ...curveXs.map((x) => densityAt(x, params)),
  ) * 1.1;
  const yTicks = [0.25, 0.5, 0.75].map((fraction) => fraction * yMax);

  function cx(x: number): number {
    return CP.left + ((x - xMin) / (xMax - xMin)) * (CW - CP.left - CP.right);
  }
  function cy(y: number): number {
    return CH - CP.bottom - (y / yMax) * (CH - CP.top - CP.bottom);
  }

  function densityPath(p: GMMParams): string {
    return curveXs
      .map((x, i) => {
        return `${i === 0 ? 'M' : 'L'} ${cx(x)} ${cy(densityAt(x, p))}`;
      })
      .join(' ');
  }
  const statusLabel = terminationReason === 'converged'
    ? '已收敛'
    : terminationReason === 'iteration-limit'
      ? '达到 100 次上限'
      : iterations === 0
        ? '可开始迭代'
        : '可继续迭代';

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <ControlRow label={`混合分量数 K: ${k}`}>
            <Slider aria-label="高斯混合分量数 K" value={[k]} min={2} max={3} step={1} onValueChange={(v) => handleKChange(v[0])} />
          </ControlRow>

          {params.mu.map((m, idx) => (
            <div key={idx} className="space-y-2 border-b border-gray-100 pb-3">
              <div className="text-sm font-medium text-gray-700">分量 {idx + 1} · φ={params.phi[idx].toFixed(3)}</div>
              <ControlRow label={`均值 μ: ${m.toFixed(2)}`}>
                <Slider aria-label={`分量 ${idx + 1} 的均值`} value={[m]} min={-4} max={4} step={0.1} onValueChange={(v) => updateParam('mu', idx, v[0])} />
              </ControlRow>
              <ControlRow label={`标准差 σ: ${params.sigma[idx].toFixed(2)}`}>
                <Slider aria-label={`分量 ${idx + 1} 的标准差`} value={[params.sigma[idx]]} min={MIN_SIGMA} max={2} step={0.05} onValueChange={(v) => updateParam('sigma', idx, v[0])} />
              </ControlRow>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={doEMStep}
              disabled={terminationReason === 'converged'}
              className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors text-sm"
            >
              <SkipForward className="w-4 h-4" />
              下一步
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          </div>
          <button
            type="button"
            onClick={runToConvergence}
            disabled={terminationReason === 'converged'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            运行至收敛
          </button>
          <button
            type="button"
            onClick={regenerate}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重新采样
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1" aria-live="polite">
            <div className="flex justify-between">
              <span className="text-gray-600">状态:</span>
              <span className="font-medium text-gray-800">{statusLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">迭代次数:</span>
              <span className="font-mono font-medium text-gray-700">{iterations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">对数似然:</span>
              <span className="font-mono font-medium text-blue-700">{logLikelihood.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">上次操作 Δℓ:</span>
              <span className={`font-mono font-medium ${likelihoodChange !== null && likelihoodChange < -1e-7 ? 'text-red-600' : 'text-emerald-700'}`}>
                {likelihoodChange === null ? '—' : likelihoodChange.toExponential(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">视窗内样本:</span>
              <span className="font-mono font-medium text-gray-700">{visibleSampleCount}/{data.length}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${CW} ${CH}`}
            className="w-full min-w-[360px]"
            style={{ maxHeight: 360 }}
            role="img"
            aria-labelledby="gmm-em-chart-title gmm-em-chart-desc"
          >
            <title id="gmm-em-chart-title">一维高斯混合模型的 EM 拟合</title>
            <desc id="gmm-em-chart-desc">同一密度纵轴上显示样本密度直方图、真实混合密度与当前拟合密度。</desc>
            <defs>
              <clipPath id="gmm-em-chart-clip">
                <rect x={CP.left} y={CP.top} width={CW - CP.left - CP.right} height={CH - CP.top - CP.bottom} />
              </clipPath>
            </defs>
            <rect x={CP.left} y={CP.top} width={CW - CP.left - CP.right} height={CH - CP.top - CP.bottom} fill="#f9fafb" />
            {[-4, -2, 0, 2, 4].map((x) => (
              <line key={`vx-${x}`} x1={cx(x)} y1={CP.top} x2={cx(x)} y2={CH - CP.bottom} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {yTicks.map((y) => (
              <line key={`hy-${y}`} x1={CP.left} y1={cy(y)} x2={CW - CP.right} y2={cy(y)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            <line x1={CP.left} y1={CH - CP.bottom} x2={CW - CP.right} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            <line x1={CP.left} y1={CP.top} x2={CP.left} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            {[-4, -2, 0, 2, 4].map((x) => (
              <text key={`lx-${x}`} x={cx(x)} y={CH - CP.bottom + 20} textAnchor="middle" fontSize={12} fill="#4b5563">{x}</text>
            ))}
            {yTicks.map((y) => (
              <text key={`ly-${y}`} x={CP.left - 10} y={cy(y) + 4} textAnchor="end" fontSize={12} fill="#4b5563">{y.toFixed(2)}</text>
            ))}
            <text x={CW / 2} y={CH - 10} textAnchor="middle" fontSize={13} fill="#374151">x</text>
            <text x={20} y={CH / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${CH / 2})`}>密度</text>

            <g clipPath="url(#gmm-em-chart-clip)">
              {/* 与曲线共用密度纵轴的直方图 */}
              {histDensity.map((density, idx) => {
                const x0 = xMin + idx * binWidth;
                const x1 = x0 + binWidth;
                return (
                  <rect
                    key={`hist-${idx}`}
                    x={cx(x0)}
                    y={cy(density)}
                    width={Math.max(0, cx(x1) - cx(x0) - 1)}
                    height={cy(0) - cy(density)}
                    fill="#bfdbfe"
                    opacity={0.7}
                  />
                );
              })}
              <path d={densityPath(trueParams)} fill="none" stroke="#374151" strokeWidth={2} strokeDasharray="6 4" />
              <path d={densityPath(params)} fill="none" stroke="#2563eb" strokeWidth={3} />
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200" /> 数据直方图</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-600" /> 拟合密度</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-gray-700" /> 真实密度</span>
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
