import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { ShieldAlert, TrendingUp, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

interface CurvePoint {
  d: number;
  train: number;
  test: number;
}

interface DatasetEntry {
  n: number;
  noise: number;
  maxD: number;
  numTrials: number;
  curve: CurvePoint[];
}

interface PrecomputedData {
  params: {
    nValues: number[];
    noiseValues: number[];
    maxDValues: number[];
    numTrials: number;
    signalDimensions?: number;
  };
  dataset: DatasetEntry[];
}

function isPrecomputedData(value: unknown): value is PrecomputedData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PrecomputedData>;
  return Boolean(
    candidate.params &&
    Array.isArray(candidate.params.nValues) &&
    Array.isArray(candidate.params.noiseValues) &&
    Array.isArray(candidate.params.maxDValues) &&
    Array.isArray(candidate.dataset),
  );
}

export default function DoubleDescentPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第八章 · 泛化
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">双下降现象</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          传统观点认为测试误差随模型复杂度先降后升，形成 U 型曲线。
          但在现代高维模型中，当参数数量超过样本数后，测试误差可能再次下降，
          这一现象被称为双下降（Double Descent）。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">经典 U 型曲线之外</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在参数较少的“欠参数化”区域，模型会经历偏差-方差权衡：测试误差随复杂度下降，达到最低点后又开始上升。
          当模型复杂度继续增加到可以插值所有训练样本时（插值区域），某些模型反而表现出测试误差的第二次下降。
        </p>

        <FormulaCard
          title="最小范数插值"
          formula={
            <KaTeX
              math={String.raw`\hat{\beta} = \arg\min_{\beta} \|\beta\|_2 \quad \text{s.t.} \quad X\beta = y`}
              display
            />
          }
          description="当 d>n、X 满行秩且插值约束可行时，零训练误差解通常不唯一。最小范数解是常见的隐式正则化选择之一，在部分数据模型中会促成插值阈值后的第二次下降，但并非普遍保证。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：线性模型的双下降</h2>
        <p className="text-gray-700 mb-4">
          考虑一个高维线性模型：输入特征从高斯分布采样，真实标签始终由前 5 个特征的线性组合加上噪声生成。
          每次重复实验固定样本与标签，再逐步揭示前 d 个特征，因此不同维度上的误差可以直接比较。
          选择不同的样本数、噪声水平和最大维度，查看预计算好的双下降曲线。
        </p>
        <DoubleDescentDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">为什么会出现第二次下降？</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>1. 插值不再可怕</strong>：在经典统计学习中，完全拟合训练数据通常意味着过拟合。
            但在某些高维数据分布与信号结构下，最小范数插值解可以表现出有利的隐式正则化。
          </p>
          <p>
            <strong>2. 更多自由度与隐式正则化</strong>：过参数化为模型提供了更多自由度；
            在最小范数解或隐式正则化作用下，模型可能获得更平滑、更稳定的插值解。
            需要强调的是，额外的随机特征本身并不必然带来有效信息。
          </p>
          <p>
            <strong>3. 插值阈值附近可能最不稳定</strong>：当模型参数数量接近样本数时，
            设计矩阵可能病态，估计方差会显著放大；在本页的无正则线性实验中，测试误差通常在附近形成峰值。
          </p>
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
            <span>双下降挑战了“模型越复杂越容易过拟合”的简单结论。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在插值区域，最小范数解等隐式正则化可以帮助泛化。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>在本页模型及类似设置中，插值阈值（参数数≈样本数）附近常出现高方差峰值。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 双下降交互演示：加载预计算数据                                             */
/* -------------------------------------------------------------------------- */
function DoubleDescentDemo() {
  const [precomputed, setPrecomputed] = useState<PrecomputedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [n, setN] = useState(40);
  const [noise, setNoise] = useState(0.3);
  const [maxD, setMaxD] = useState(120);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/double-descent-curves.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (cancelled) return;
        if (!isPrecomputedData(data)) throw new Error('数据格式不完整');
        setPrecomputed(data);
        if (data.params.nValues.length > 0) setN(data.params.nValues[Math.floor(data.params.nValues.length / 2)]);
        if (data.params.noiseValues.length > 0) setNoise(data.params.noiseValues[Math.floor(data.params.noiseValues.length / 2)]);
        if (data.params.maxDValues.length > 0) setMaxD(data.params.maxDValues[Math.floor(data.params.maxDValues.length / 2)]);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const curveData = useMemo(() => {
    if (!precomputed) return [];
    const entry = precomputed.dataset.find(
      (item) => item.n === n && Math.abs(item.noise - noise) < 1e-9 && item.maxD === maxD,
    );
    return entry?.curve ?? [];
  }, [precomputed, n, noise, maxD]);

  const available = precomputed?.params;

  const CW = 720;
  const CH = 360;
  const CP = { top: 25, right: 40, bottom: 50, left: 70 };
  const rawMaxErr = Math.max(...curveData.map((p) => Math.max(p.train, p.test)), 0.01);
  const yFloor = 1e-4;
  const logMin = Math.log10(yFloor);
  const logMax = Math.max(logMin + 1, Math.ceil(Math.log10(rawMaxErr)));
  const yCeiling = 10 ** logMax;

  function cx(d: number): number {
    return CP.left + ((d - 1) / (maxD - 1 || 1)) * (CW - CP.left - CP.right);
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
    if (y < 10) return y.toFixed(2);
    return y.toFixed(1);
  }
  const yTicks = Array.from({ length: 5 }, (_, i) => 10 ** (logMin + ((logMax - logMin) * i) / 4));
  const interpolationPoint = curveData.reduce<CurvePoint | null>(
    (best, point) => (!best || Math.abs(point.d - n) < Math.abs(best.d - n) ? point : best),
    null,
  );
  const bestOverparameterized = curveData
    .filter((point) => point.d > n)
    .reduce<CurvePoint | null>((best, point) => (!best || point.test < best.test ? point : best), null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500" role="status" aria-live="polite">
        正在加载预计算的双下降曲线数据…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600" role="alert">
        加载数据失败：{error}
      </div>
    );
  }

  if (!available) return null;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <ControlRow label={`样本数 n: ${n}`}>
            <Slider
              aria-label="双下降实验样本数"
              value={[n]}
              min={Math.min(...available.nValues)}
              max={Math.max(...available.nValues)}
              step={stepOfArray(available.nValues)}
              onValueChange={(v) => setN(closestValue(available.nValues, v[0]))}
            />
          </ControlRow>
          <ControlRow label={`噪声标准差: ${noise.toFixed(1)}`}>
            <Slider
              aria-label="双下降实验噪声标准差"
              value={[noise]}
              min={Math.min(...available.noiseValues)}
              max={Math.max(...available.noiseValues)}
              step={stepOfArray(available.noiseValues)}
              onValueChange={(v) => setNoise(closestValue(available.noiseValues, v[0]))}
            />
          </ControlRow>
          <ControlRow label={`最大维度 d: ${maxD}`}>
            <Slider
              aria-label="双下降实验最大特征维度"
              value={[maxD]}
              min={Math.min(...available.maxDValues)}
              max={Math.max(...available.maxDValues)}
              step={stepOfArray(available.maxDValues)}
              onValueChange={(v) => setMaxD(closestValue(available.maxDValues, v[0]))}
            />
          </ControlRow>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">每组重复实验次数:</span>
              <span className="font-mono font-medium text-gray-700">{available.numTrials}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">曲线点数:</span>
              <span className="font-mono font-medium text-gray-700">{curveData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">真实信号维度:</span>
              <span className="font-mono font-medium text-gray-700">{available.signalDimensions ?? 5}</span>
            </div>
            {interpolationPoint && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">d≈n 时测试误差:</span>
                <span className="font-mono font-medium text-amber-700">{formatY(interpolationPoint.test)}</span>
              </div>
            )}
            {bestOverparameterized && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">d&gt;n 区域最低测试误差:</span>
                <span className="font-mono font-medium text-emerald-700">{formatY(bestOverparameterized.test)}（d={bestOverparameterized.d}）</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full min-w-[360px]" style={{ maxHeight: 360 }} role="img" aria-label={`样本数 ${n}、噪声 ${noise.toFixed(1)} 下的训练与测试误差双下降曲线`}>
            <title>线性最小范数模型的双下降曲线</title>
            <rect x={CP.left} y={CP.top} width={CW - CP.left - CP.right} height={CH - CP.top - CP.bottom} fill="#f9fafb" />
            {[1, Math.round(maxD / 4), Math.round(maxD / 2), Math.round((3 * maxD) / 4), maxD].map((d) => (
              <line key={`vx-${d}`} x1={cx(d)} y1={CP.top} x2={cx(d)} y2={CH - CP.bottom} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {yTicks.map((e) => (
              <line key={`hy-${e}`} x1={CP.left} y1={cy(e)} x2={CW - CP.right} y2={cy(e)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            <line x1={cx(n)} y1={CP.top} x2={cx(n)} y2={CH - CP.bottom} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" />
            <line x1={CP.left} y1={CH - CP.bottom} x2={CW - CP.right} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            <line x1={CP.left} y1={CP.top} x2={CP.left} y2={CH - CP.bottom} stroke="#374151" strokeWidth={2} />
            {[1, Math.round(maxD / 4), Math.round(maxD / 2), Math.round((3 * maxD) / 4), maxD].map((d) => (
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
              特征维度 d
            </text>
            <text x={20} y={CH / 2} textAnchor="middle" fontSize={13} fill="#374151" transform={`rotate(-90, 20, ${CH / 2})`}>
              均方误差（对数刻度）
            </text>
            <text x={cx(n) + 5} y={CP.top + 15} fontSize={12} fill="#d97706" fontWeight={600}>
              d = n
            </text>

            <polyline
              points={curveData.map((p) => `${cx(p.d)},${cy(p.train)}`).join(' ')}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2}
            />
            <polyline
              points={curveData.map((p) => `${cx(p.d)},${cy(p.test)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
            {curveData.map((p) => (
              <g key={`pt-${p.d}`}>
                <circle cx={cx(p.d)} cy={cy(p.train)} r={2} fill="#2563eb" />
                <circle cx={cx(p.d)} cy={cy(p.test)} r={2} fill="#ef4444" />
              </g>
            ))}
          </svg>
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600" /> 平均训练误差</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> 平均测试误差</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-b-2 border-dashed border-amber-500" /> d = n 插值阈值</span>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">纵轴采用对数刻度；小于 10⁻⁴ 的近零训练误差显示在底边。</p>
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

function stepOfArray(values: number[]): number {
  if (values.length < 2) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[1] - sorted[0];
}

function closestValue(values: number[], target: number): number {
  return values.reduce((best, value) => (Math.abs(value - target) < Math.abs(best - target) ? value : best));
}
