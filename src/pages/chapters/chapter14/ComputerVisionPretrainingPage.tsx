import { useState, useMemo } from 'react';
import { ShieldAlert, Activity, CheckCircle2, SkipForward, RefreshCw , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

interface Point2D {
  x: number;
  y: number;
  label: number;
}

function generateData(nPerClass: number, seed: number): Point2D[] {
  let s = seed;
  const data: Point2D[] = [];
  const centers = [
    { x: -1.5, y: 1 },
    { x: 1.5, y: 1 },
    { x: 0, y: -1.5 },
  ];
  for (let c = 0; c < centers.length; c++) {
    for (let i = 0; i < nPerClass; i++) {
      s = (s * 9301 + 49297) % 233280;
      const u1 = s / 233280;
      s = (s * 9301 + 49297) % 233280;
      const u2 = s / 233280;
      const r = Math.sqrt(-2 * Math.log(Math.max(1e-10, u1)));
      const z1 = r * Math.cos(2 * Math.PI * u2);
      const z2 = r * Math.sin(2 * Math.PI * u2);
      data.push({
        x: centers[c].x + 0.35 * z1,
        y: centers[c].y + 0.35 * z2,
        label: c,
      });
    }
  }
  return data;
}

function augment(p: Point2D, seed: number): Point2D {
  let s = seed;
  s = (s * 9301 + 49297) % 233280;
  const dx = (s / 233280 - 0.5) * 0.4;
  s = (s * 9301 + 49297) % 233280;
  const dy = (s / 233280 - 0.5) * 0.4;
  return { x: p.x + dx, y: p.y + dy, label: p.label };
}

export default function ComputerVisionPretrainingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十四章 · 自监督学习与基础模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">计算机视觉中的预训练</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          计算机视觉中常用的预训练方法包括监督预训练和对比学习。对比学习通常通过数据增强构造正样本对，
          把同一图像的不同视图拉近，并在 instance discrimination 目标下把其他图像视图作为负样本推远；这种训练可能诱导语义结构，但并不直接使用类别标签。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">监督预训练</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在监督预训练中，预训练数据集本身带有标签（如 ImageNet）。我们训练一个深度神经网络进行图像分类，
          然后在下游任务中丢弃最后的分类层，把倒数第二层的激活作为固定特征提取器，或直接在此基础上微调。
        </p>
        <p className="text-gray-700">
          形式化地，若网络可写成 U φ_θ(x)，其中 U 是最后一层分类器参数，φ_θ(x) 是倒数第二层特征，
          则监督预训练后我们只保留 φ_θ̂(x)，去掉 U。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">对比学习</h2>
        <p className="text-gray-700 mb-4">
          对比学习是无监督预训练的重要方法。核心思想是：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>正样本对：</strong>同一张图像的两个不同增强视图应该在表示空间中相近。</li>
          <li><strong>负样本对：</strong>在 instance discrimination 中，不同原始图像的增强视图通常被当作负样本推远；但它们未必语义不相关，同类图像也可能成为 false negatives。</li>
        </ul>
        <p className="text-gray-700 mb-4">
          以 SIMCLR 为例，对于一个大小为 B 的批次，每个样本生成两个增强视图，得到一个 2B 个样本的增强批次。
          对每个正样本对 (x̂^(i), x̃^(i))，损失函数鼓励它们的表示相似，同时与其余样本的增强视图不同（此处为只含 B−1 个负样本的简化形式；完整 SimCLR/NT-Xent 的负样本为 2(B−1) 个）：
        </p>
        <FormulaCard
          title="SIMCLR 损失"
          formula={
            <KaTeX
              math={String.raw`L_{\text{pre}}(\theta) = -\sum_{i=1}^B \log \frac{\exp\bigl(\phi(\hat{x}^{(i)})^\top \phi(\tilde{x}^{(i)})\bigr)}{\exp\bigl(\phi(\hat{x}^{(i)})^\top \phi(\tilde{x}^{(i)})\bigr) + \sum_{j \neq i} \exp\bigl(\phi(\hat{x}^{(i)})^\top \phi(\tilde{x}^{(j)})\bigr)}`}
              display
            />
          }
          description="分母中的正项使同一样本的增强视图相互吸引，负项使不同样本的视图相互排斥。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：L_pre(θ) = -Σ_i log [ exp(φ(̂x^(i))^T φ(̃x^(i))) / (exp(...) + Σ_{j≠i} exp(φ(̂x^(i))^T φ(̃x^(j)))) ]'}
        </p>

        <FormulaCard
          title="NT-Xent 损失"
          formula={
            <KaTeX
              math={String.raw`\ell(i,j) = -\log \frac{\exp\bigl(\text{sim}(z_i, z_j) / \tau\bigr)}{\sum_{k \neq i} \exp\bigl(\text{sim}(z_i, z_k) / \tau\bigr)}`}
              display
            />
          }
          description="对正样本对 (i,j) 做归一化交叉熵；分母包含 batch 内所有其他样本。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：ℓ(i,j) = -log [ exp(sim(z_i,z_j)/τ) / Σ_{k≠i} exp(sim(z_i,z_k)/τ) ]'}
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：对比学习一步</h2>
        <p className="text-gray-700 mb-4">
          下图将三类二维数据视为三个「图像类」。每个原始点经过一次随机增强得到正样本（同色小圆点）。
          点击「对比学习一步」，模型会把正样本对拉近、负样本对推远。观察在这个玩具数据和当前增强设定下，嵌入空间是否逐渐呈现类别分离趋势。
        </p>
        <p className="text-xs text-gray-500 mb-4">
          教学简化：本演示只生成一个增强视图，并把其他图像的增强视图作为负样本；
          完整的 SIMCLR 还会包含同批次中其他原始视图作为负样本，负样本总数为 2(B-1)。
          类别分离是该玩具数据和增强方式下的可视化现象，不是纯对比学习必然保证的结果。
          本演示直接移动二维嵌入点，而不是训练图像编码器；目的是可视化对比损失的吸引/排斥趋势。
        </p>
        <ContrastiveDemo />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>监督预训练在有标签数据上训练深度网络，然后迁移其特征。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>对比学习通过正/负样本对对无标注数据进行自监督训练。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>SIMCLR 是视觉对比学习的代表性算法之一。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function ContrastiveDemo() {
  const [seed, setSeed] = useState(42);
  const [embeddings, setEmbeddings] = useState<Point2D[]>(() => generateData(15, 42));
  const [augSeed, setAugSeed] = useState(100);
  const [step, setStep] = useState(0);

  const augmented = useMemo(() => {
    return embeddings.map((p, idx) => augment(p, augSeed + idx));
  }, [embeddings, augSeed]);

  const lr = 0.05;
  const sampleCount = embeddings.length;

  const doStep = () => {
    setEmbeddings((current) => {
      const n = current.length;
      const grads: Point2D[] = current.map(() => ({ x: 0, y: 0, label: 0 }));

      for (let i = 0; i < n; i++) {
        const zi = current[i];
        const zia = augmented[i];
        let posSim = zi.x * zia.x + zi.y * zia.y;
        let denom = Math.exp(posSim);
        const negs: number[] = [];
        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          const sim = zi.x * augmented[j].x + zi.y * augmented[j].y;
          negs.push(sim);
          denom += Math.exp(sim);
        }

        // 正样本梯度
        const posCoeff = -1 + Math.exp(posSim) / denom;
        grads[i].x += posCoeff * zia.x;
        grads[i].y += posCoeff * zia.y;

        // 负样本梯度
        for (let k = 0; k < negs.length; k++) {
          const j = k < i ? k : k + 1;
          const coeff = Math.exp(negs[k]) / denom;
          grads[i].x += coeff * augmented[j].x;
          grads[i].y += coeff * augmented[j].y;
        }
      }

      return current.map((p, i) => ({
        x: p.x - lr * grads[i].x,
        y: p.y - lr * grads[i].y,
        label: p.label,
      }));
    });
    setAugSeed((s) => s + sampleCount * 2 + 1);
    setStep((s) => s + 1);
  };

  const reset = () => {
    const fresh = generateData(15, seed);
    setEmbeddings(fresh);
    setAugSeed(100);
    setStep(0);
  };

  const resample = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    const fresh = generateData(15, nextSeed);
    setEmbeddings(fresh);
    setAugSeed(100);
    setStep(0);
  };

  const colors = ['#2563eb', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={doStep}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
        >
          <SkipForward className="w-4 h-4" />
          对比学习一步
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重置
        </button>
        <button
          onClick={resample}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          重新采样
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <EmbeddingPlot title="原始/锚点嵌入 φ(x)" data={embeddings} colors={colors} />
        <EmbeddingPlot title="增强视图 φ(x̂)" data={augmented} colors={colors} />
      </div>

      <div className="text-sm text-gray-600">
        已执行步数: <span className="font-mono font-medium text-blue-700">{step}</span>
      </div>
    </div>
  );
}

function EmbeddingPlot({ title, data, colors }: { title: string; data: Point2D[]; colors: string[] }) {
  const SIZE = 300;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const SCALE = 60;

  function toSvg(p: Point2D): { x: number; y: number } {
    return {
      x: CX + p.x * SCALE,
      y: CY - p.y * SCALE,
    };
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">{title}</h4>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" style={{ maxHeight: 300 }}>
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="#f9fafb" />
        <line x1={10} y1={CY} x2={SIZE - 10} y2={CY} stroke="#d1d5db" strokeWidth={1} />
        <line x1={CX} y1={10} x2={CX} y2={SIZE - 10} stroke="#d1d5db" strokeWidth={1} />
        {data.map((p, idx) => {
          const s = toSvg(p);
          return (
            <circle
              key={idx}
              cx={s.x}
              cy={s.y}
              r={4}
              fill={colors[p.label % colors.length]}
              opacity={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}
