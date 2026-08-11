import { useState, useMemo } from 'react';
import { ShieldAlert, Activity, CheckCircle2, RefreshCw, SkipForward, Circle, Play } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

interface Vec2 {
  x: number;
  y: number;
}

type Mat2 = [[number, number], [number, number]];

const MIN_EIGENVALUE = 1e-10;
const CONVERGENCE_TOLERANCE = 1e-10;

function generateSources(n: number, seed: number): Vec2[] {
  let s = seed;
  const data: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const u1 = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const u2 = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const u3 = s / 233280;
    s = (s * 9301 + 49297) % 233280;
    const u4 = s / 233280;

    // 源 1：均匀分布
    const s1 = 2 * u1 - 1;
    // 源 2：双峰高斯混合，非高斯
    const z = u2 < 0.5 ? -1.2 : 1.2;
    const r = Math.sqrt(-2 * Math.log(Math.max(1e-10, u3)));
    const noise = r * Math.cos(2 * Math.PI * u4);
    const s2 = z + 0.25 * noise;
    data.push({ x: s1, y: s2 });
  }
  return standardizeComponents(data);
}

function center(data: Vec2[]): Vec2[] {
  const mx = data.reduce((sum, p) => sum + p.x, 0) / data.length;
  const my = data.reduce((sum, p) => sum + p.y, 0) / data.length;
  return data.map((p) => ({ x: p.x - mx, y: p.y - my }));
}

function standardizeComponents(data: Vec2[]): Vec2[] {
  const centered = center(data);
  const sx = Math.sqrt(centered.reduce((sum, p) => sum + p.x * p.x, 0) / centered.length);
  const sy = Math.sqrt(centered.reduce((sum, p) => sum + p.y * p.y, 0) / centered.length);
  return centered.map((p) => ({ x: p.x / sx, y: p.y / sy }));
}

function mix(data: Vec2[], A: Mat2): Vec2[] {
  return data.map((p) => ({
    x: A[0][0] * p.x + A[0][1] * p.y,
    y: A[1][0] * p.x + A[1][1] * p.y,
  }));
}

function matVecMul(m: Mat2, v: Vec2): Vec2 {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y,
    y: m[1][0] * v.x + m[1][1] * v.y,
  };
}

function matMul(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

function covarianceMatrix(data: Vec2[]): Mat2 {
  const n = data.length;
  const xx = data.reduce((sum, p) => sum + p.x * p.x, 0) / n;
  const xy = data.reduce((sum, p) => sum + p.x * p.y, 0) / n;
  const yy = data.reduce((sum, p) => sum + p.y * p.y, 0) / n;
  return [
    [xx, xy],
    [xy, yy],
  ];
}

function symmetricEigenDecomposition(m: Mat2): { lambda1: number; lambda2: number; u1: Vec2; u2: Vec2 } {
  const [[a, b], [, d]] = m;
  const trace = a + d;
  const delta = Math.hypot(a - d, 2 * b) / 2;
  const lambda1 = trace / 2 + delta;
  const lambda2 = Math.max(trace / 2 - delta, MIN_EIGENVALUE);
  const candidateA = { x: b, y: lambda1 - a };
  const candidateB = { x: lambda1 - d, y: b };
  const normA = Math.hypot(candidateA.x, candidateA.y);
  const normB = Math.hypot(candidateB.x, candidateB.y);
  let vector = normA > normB ? candidateA : candidateB;
  let norm = Math.max(normA, normB);
  if (norm <= MIN_EIGENVALUE) {
    vector = a >= d ? { x: 1, y: 0 } : { x: 0, y: 1 };
    norm = 1;
  }
  let u1 = { x: vector.x / norm, y: vector.y / norm };
  if (u1.x < 0 || (Math.abs(u1.x) <= MIN_EIGENVALUE && u1.y < 0)) {
    u1 = { x: -u1.x, y: -u1.y };
  }
  return { lambda1, lambda2, u1, u2: { x: -u1.y, y: u1.x } };
}

function inverseSquareRoot(m: Mat2): Mat2 {
  const { lambda1, lambda2, u1, u2 } = symmetricEigenDecomposition(m);
  const d1 = 1 / Math.sqrt(Math.max(lambda1, MIN_EIGENVALUE));
  const d2 = 1 / Math.sqrt(Math.max(lambda2, MIN_EIGENVALUE));
  return [
    [d1 * u1.x * u1.x + d2 * u2.x * u2.x, d1 * u1.x * u1.y + d2 * u2.x * u2.y],
    [d1 * u1.y * u1.x + d2 * u2.y * u2.x, d1 * u1.y * u1.y + d2 * u2.y * u2.y],
  ];
}

function initialRotation(): Mat2 {
  const angle = (17 * Math.PI) / 180;
  return [
    [Math.cos(angle), Math.sin(angle)],
    [-Math.sin(angle), Math.cos(angle)],
  ];
}

function fastICAStep(current: Mat2, whitened: Vec2[]): { next: Mat2; delta: number } {
  const w = { x: current[0][0], y: current[0][1] };
  let weightedX = 0;
  let weightedY = 0;
  let derivativeMean = 0;
  for (const z of whitened) {
    const projection = w.x * z.x + w.y * z.y;
    const g = Math.tanh(projection);
    weightedX += z.x * g;
    weightedY += z.y * g;
    derivativeMean += 1 - g * g;
  }
  const n = whitened.length;
  let candidate = {
    x: weightedX / n - (derivativeMean / n) * w.x,
    y: weightedY / n - (derivativeMean / n) * w.y,
  };
  const norm = Math.hypot(candidate.x, candidate.y);
  if (!Number.isFinite(norm) || norm <= MIN_EIGENVALUE) {
    return { next: current, delta: 0 };
  }
  candidate = { x: candidate.x / norm, y: candidate.y / norm };
  const alignment = candidate.x * w.x + candidate.y * w.y;
  if (alignment < 0) candidate = { x: -candidate.x, y: -candidate.y };
  const delta = Math.max(0, 1 - Math.abs(candidate.x * w.x + candidate.y * w.y));
  return {
    next: [
      [candidate.x, candidate.y],
      [-candidate.y, candidate.x],
    ],
    delta,
  };
}

function correlation(a: Vec2[], aKey: keyof Vec2, b: Vec2[], bKey: keyof Vec2): number {
  const meanA = a.reduce((sum, p) => sum + p[aKey], 0) / a.length;
  const meanB = b.reduce((sum, p) => sum + p[bKey], 0) / b.length;
  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;
  for (let i = 0; i < a.length; i++) {
    const da = a[i][aKey] - meanA;
    const db = b[i][bKey] - meanB;
    covariance += da * db;
    varianceA += da * da;
    varianceB += db * db;
  }
  const denominator = Math.sqrt(varianceA * varianceB);
  return denominator > 0 ? covariance / denominator : 0;
}

const mixingA: Mat2 = [
  [1, 0.8],
  [0.5, 1.2],
];

export default function ICAPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十三章 · 独立成分分析
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">独立成分分析</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          独立成分分析（ICA）与 PCA 一样寻找新的坐标系来表示数据，但目标截然不同：
          PCA 只去除二阶相关性，ICA 则进一步利用非高斯性，把观测混合分离成尽可能统计独立的分量。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">问题动机：鸡尾酒会问题</h2>
        </div>
        <p className="text-gray-700 mb-4">
          想象一个房间里有多个人同时说话，多个麦克风记录下了这些声音的叠加。
          每个麦克风因为位置不同，接收到的各个人声音的权重也不同。
          鸡尾酒会问题就是：能否只从这些混合录音中恢复出每个人的原始声音？
        </p>
        <p className="text-gray-700">
          形式上，假设存在 d 个相互独立的源信号 s，我们观测到的是它们的线性混合：
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FormulaCard
          title="观测模型"
          formula={
            <KaTeX
              math={String.raw`x^{(i)} = A s^{(i)}`}
              display
            />
          }
          description="A 是未知混合矩阵。在无噪声、源数等于观测数且 A 可逆的理想模型中，目标是估计 W≈A⁻¹；实际恢复仍存在排列、符号和尺度不确定性。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ICA 与 PCA：独立不只是零相关</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">PCA</h3>
            <p>寻找正交且互不相关的最大方差方向，只使用均值与协方差。除高斯等特殊情形外，零相关不能推出独立。</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-semibold text-violet-800 mb-2">ICA</h3>
            <p>利用高阶统计量或非高斯性寻找独立分量。解混向量通常不要求在原观测空间中彼此正交。</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ICA 的不确定性</h2>
        <p className="text-gray-700 mb-4">
          仅凭观测数据 x，我们无法唯一确定 A 和 s。主要有两类固有的不确定性：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>排列不确定性：</strong>我们无法知道恢复出的第 j 个信号对应原来的第几个源，但这在大多数应用中并不重要。</li>
          <li><strong>尺度不确定性：</strong>若 A 的某一列乘以非零常数，对应源除以同一常数，观测 x 不变。对声音而言，这只影响音量或符号。</li>
        </ul>
        <p className="text-gray-700">
          在方阵无噪声模型中，常见可辨识条件还包括源统计独立、混合矩阵满秩，以及独立源中至多一个为高斯分布。
          若多个标准化源都是高斯，联合分布具有旋转对称性，无法仅凭观测区分其正交旋转。源数与传感器数不相等、有噪声或混合非线性时，需要扩展模型，不能直接套用这里的结论。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">线性变换下的密度</h2>
        <p className="text-gray-700 mb-4">
          在 W 可逆时，s=Wx。由变量替换公式，观测密度等于源密度在 Wx 处的值乘以雅可比行列式绝对值：
        </p>
        <FormulaCard
          title="变换后的密度"
          formula={
            <KaTeX
              math={String.raw`p_x(x)=p_s(Wx)\,\left|\det W\right|`}
              display
            />
          }
          description="|det W| 是从 x 到 s 的体积缩放因子，保证变换后的密度积分仍为 1；不能省略绝对值。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">中心化与白化</h2>
        <p className="text-gray-700 mb-4">
          实践中先用训练均值中心化，再把协方差变为单位阵。若 Σ=UΛUᵀ，可取对称白化矩阵 V=UΛ⁻¹ᐟ²Uᵀ，令 z=V(x−μ)。
          白化只消除二阶相关性；在方阵 ICA 模型下，它把剩余解混自由度简化为正交旋转，但不会自动得到独立源。
        </p>
        <FormulaCard
          title="白化"
          formula={
            <KaTeX
              math={String.raw`z=V(x-\mu),\qquad V=U\Lambda^{-1/2}U^T,\qquad \operatorname{Cov}(z)=I`}
              display
            />
          }
          description="很小的特征值会放大噪声，实际实现通常需要降维或正则化。均值与白化矩阵都只能在训练数据上估计。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ICA 算法</h2>
        <p className="text-gray-700 mb-4">
          假设各源独立，联合密度可分解为各自边缘密度的乘积：
        </p>
        <FormulaCard
          title="源密度假设"
          formula={
            <KaTeX
              math={String.raw`p_s(s)=\prod_{j=1}^d p_j(s_j)`}
              display
            />
          }
          description="独立性假设体现在乘积形式上。"
        />
        <p className="text-gray-700 mt-4 mb-4">
          代入密度变换公式，对中心化样本可得一般对数似然：
        </p>
        <FormulaCard
          title="对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(W)=\sum_{i=1}^n\left[\sum_{j=1}^d\log p_j\!\left(w_j^T x_c^{(i)}\right)+\log\left|\det W\right|\right]`}
              display
            />
          }
          description="源密度 p_j 的选择决定得分函数 ψ_j(s)=d log p_j(s)/ds；模型错配、局部解与步长都会影响最大似然算法。"
        />
        <p className="text-gray-700 mt-4 mb-4">
          对 W 求导，可写出平均对数似然的梯度；其中 ψ 按分量作用：
        </p>
        <FormulaCard
          title="最大似然梯度"
          formula={
            <KaTeX
              math={String.raw`\frac{1}{n}\nabla_W\ell(W)=\frac{1}{n}\sum_{i=1}^n\psi\!\left(Wx_c^{(i)}\right)(x_c^{(i)})^T+W^{-T}`}
              display
            />
          }
          description="这给出梯度上升方向，但普通梯度法对步长和尺度敏感。下面的演示采用白化后的 FastICA 固定点更新。"
        />

        <FormulaCard
          title="一单位 FastICA（g=tanh）"
          formula={
            <KaTeX
              math={String.raw`w^+\leftarrow\mathbb E\!\left[z\tanh(w^Tz)\right]-\mathbb E\!\left[1-\tanh^2(w^Tz)\right]w,\qquad w\leftarrow\frac{w^+}{\|w^+\|_2}`}
              display
            />
          }
          description="固定点更新寻找非高斯性对比函数的极值。二维白化数据中，第二方向取第一方向的正交补；高维时还需去相关或正交化多个方向。"
        />
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ICA 优化非凸，可能收敛到不同局部解；应比较多次初始化，并根据源的尾部性质选择合适的非线性函数。算法输出的顺序、符号和尺度没有固定语义。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：二维盲源分离</h2>
        <p className="text-gray-700 mb-4">
          下面的演示生成了两个非高斯独立源（左侧），通过一个未知混合矩阵得到观测数据（中间）。
          点击「迭代一次」或「运行至收敛」，观察白化后的 FastICA 如何旋转坐标并恢复源信号。分离质量使用绝对相关系数，
          会自动选择最佳排列，因此不受 ICA 固有的排列、符号和尺度不确定性影响。
        </p>
        <ICADemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">应用</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>盲源分离：</strong>在瞬时线性混合假设近似成立时处理鸡尾酒会问题、脑电图或脑磁图信号。</li>
          <li><strong>特征提取：</strong>从图像或语音中提取统计独立的基函数。</li>
          <li><strong>伪迹处理：</strong>识别可能对应眼动、心跳等伪迹的分量；删除分量需要领域判断，不能仅凭算法自动决定。</li>
        </ul>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ICA 分量没有天然顺序或固定符号，也不保证每个分量都对应真实物理源。时间延迟混合、非平稳源、强噪声与非线性混合通常需要卷积 ICA、时频方法或其他专门模型。
        </p>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>ICA 利用非高斯性寻找统计独立分量，而 PCA 只保证二阶不相关。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>ICA 存在排列和尺度不确定性；通常要求独立源中至多一个是高斯分布。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>密度变换中的 |det W| 体积因子是 ICA 最大似然目标不可缺少的一项。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>白化简化了解混问题；FastICA 通过非高斯性对比函数的固定点迭代估计剩余旋转。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function ICADemo() {
  const [seed, setSeed] = useState(42);
  const [rotation, setRotation] = useState<Mat2>(() => initialRotation());
  const [iterations, setIterations] = useState(0);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [converged, setConverged] = useState(false);

  const sources = useMemo(() => generateSources(400, seed), [seed]);
  const observations = useMemo(() => center(mix(sources, mixingA)), [sources]);
  const observationCovariance = useMemo(() => covarianceMatrix(observations), [observations]);
  const whitening = useMemo(() => inverseSquareRoot(observationCovariance), [observationCovariance]);
  const whitened = useMemo(() => observations.map((p) => matVecMul(whitening, p)), [observations, whitening]);
  const recovered = useMemo(() => whitened.map((p) => matVecMul(rotation, p)), [whitened, rotation]);
  const overallDemixing = useMemo(() => matMul(rotation, whitening), [rotation, whitening]);

  const separation = useMemo(() => {
    const correlations = [
      [Math.abs(correlation(recovered, 'x', sources, 'x')), Math.abs(correlation(recovered, 'x', sources, 'y'))],
      [Math.abs(correlation(recovered, 'y', sources, 'x')), Math.abs(correlation(recovered, 'y', sources, 'y'))],
    ];
    const direct = correlations[0][0] + correlations[1][1];
    const swapped = correlations[0][1] + correlations[1][0];
    const matched = direct >= swapped
      ? [correlations[0][0], correlations[1][1]]
      : [correlations[0][1], correlations[1][0]];
    return { matched, quality: (matched[0] + matched[1]) / 2 };
  }, [recovered, sources]);

  const applyIterations = (limit: number) => {
    let current = rotation;
    let delta = Number.POSITIVE_INFINITY;
    let completed = 0;
    while (completed < limit) {
      const result = fastICAStep(current, whitened);
      current = result.next;
      delta = result.delta;
      completed += 1;
      if (delta <= CONVERGENCE_TOLERANCE) break;
    }
    setRotation(current);
    setIterations((count) => count + completed);
    setLastDelta(delta);
    setConverged(delta <= CONVERGENCE_TOLERANCE);
  };

  const reset = () => {
    setRotation(initialRotation());
    setIterations(0);
    setLastDelta(null);
    setConverged(false);
  };

  const regenerate = () => {
    setSeed((value) => value + 1);
    reset();
  };

  const statusLabel = converged ? '已收敛' : iterations === 0 ? '可开始迭代' : '可继续迭代';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyIterations(1)}
          disabled={converged}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors text-sm"
        >
          <SkipForward className="w-4 h-4" />
          迭代一次
        </button>
        <button
          type="button"
          onClick={() => applyIterations(100)}
          disabled={converged}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          运行至收敛
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重置
        </button>
        <button
          type="button"
          onClick={regenerate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重新采样
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ScatterPanel id="ica-sources" title="标准化源信号 s" data={sources} color="#2563eb" />
        <ScatterPanel id="ica-observations" title="中心化观测 x" data={observations} color="#7c3aed" />
        <ScatterPanel id="ica-recovered" title="恢复信号 ŝ = Rz" data={recovered} color="#ef4444" />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-1" aria-live="polite">
        <div className="flex justify-between">
          <span className="text-gray-600">状态:</span>
          <span className="font-medium text-gray-800">{statusLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">总体解混矩阵 B=RV:</span>
        </div>
        <div className="font-mono text-gray-700">
          [{overallDemixing[0][0].toFixed(6)}, {overallDemixing[0][1].toFixed(6)}]
        </div>
        <div className="font-mono text-gray-700">
          [{overallDemixing[1][0].toFixed(6)}, {overallDemixing[1][1].toFixed(6)}]
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-600">迭代次数:</span>
          <span className="font-mono font-medium text-blue-700">{iterations}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">方向变化量 1−|w⁺ᵀw|:</span>
          <span className="font-mono font-medium text-blue-700">{lastDelta === null ? '—' : lastDelta.toExponential(3)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">匹配后 |corr|（模拟真值）:</span>
          <span className="font-mono font-medium text-emerald-700">
            {separation.matched[0].toFixed(4)}, {separation.matched[1].toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">平均分离质量（模拟）:</span>
          <span className="font-mono font-medium text-emerald-700">{(separation.quality * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

function ScatterPanel({ id, title, data, color }: { id: string; title: string; data: Vec2[]; color: string }) {
  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const PADDING = 12;
  const maxAbs = Math.max(1.5, ...data.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]));
  const scale = (SIZE / 2 - PADDING) / maxAbs;

  function toSvg(p: Vec2): { x: number; y: number } {
    return {
      x: CX + p.x * scale,
      y: CY - p.y * scale,
    };
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">{title}</h4>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full"
        style={{ maxHeight: 260 }}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>二维散点图，展示 400 个样本在两个分量上的联合分布。</desc>
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x={PADDING} y={PADDING} width={SIZE - 2 * PADDING} height={SIZE - 2 * PADDING} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="#f9fafb" />
        <line x1={PADDING} y1={CY} x2={SIZE - PADDING} y2={CY} stroke="#d1d5db" strokeWidth={1} />
        <line x1={CX} y1={PADDING} x2={CX} y2={SIZE - PADDING} stroke="#d1d5db" strokeWidth={1} />
        <g clipPath={`url(#${id}-clip)`}>
          {data.map((p, idx) => {
            const s = toSvg(p);
            return <circle key={idx} cx={s.x} cy={s.y} r={2.5} fill={color} opacity={0.6} />;
          })}
        </g>
      </svg>
    </div>
  );
}
