import { useState, useMemo } from 'react';
import { ShieldAlert, Activity, CheckCircle2, SkipForward, RefreshCw, Circle, Play } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

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

function normalizePoint(p: Point2D): Point2D {
  const norm = Math.hypot(p.x, p.y);
  if (norm <= 1e-12) return { x: 1, y: 0, label: p.label };
  return { x: p.x / norm, y: p.y / norm, label: p.label };
}

function createContrastiveViews(nPerClass: number, seed: number): Point2D[] {
  const raw = generateData(nPerClass, seed);
  const anchors = raw.map(normalizePoint);
  const positives = raw.map((point, index) => normalizePoint(augment(point, seed * 997 + index + 1)));
  return [...anchors, ...positives];
}

function dot(a: Point2D, b: Point2D): number {
  return a.x * b.x + a.y * b.y;
}

function positiveIndex(index: number, pairCount: number): number {
  return index < pairCount ? index + pairCount : index - pairCount;
}

function contrastiveStats(views: Point2D[], temperature: number): { loss: number; positiveSimilarity: number; negativeSimilarity: number } {
  const pairCount = views.length / 2;
  let loss = 0;
  let positiveSimilarity = 0;
  let negativeSimilarity = 0;
  let negativeCount = 0;
  for (let i = 0; i < views.length; i++) {
    const positive = positiveIndex(i, pairCount);
    const logits = views.map((view, index) => index === i ? -Infinity : dot(views[i], view) / temperature);
    const maximum = Math.max(...logits);
    const logNormalizer = maximum + Math.log(logits.reduce(
      (sum, value) => sum + (Number.isFinite(value) ? Math.exp(value - maximum) : 0),
      0,
    ));
    loss += -logits[positive] + logNormalizer;
    positiveSimilarity += dot(views[i], views[positive]);
    for (let j = 0; j < views.length; j++) {
      if (j === i || j === positive) continue;
      negativeSimilarity += dot(views[i], views[j]);
      negativeCount += 1;
    }
  }
  return {
    loss: loss / views.length,
    positiveSimilarity: positiveSimilarity / views.length,
    negativeSimilarity: negativeSimilarity / negativeCount,
  };
}

function contrastiveStep(views: Point2D[], temperature: number, learningRate = 0.2): Point2D[] {
  const count = views.length;
  const pairCount = count / 2;
  const gradients = views.map(() => ({ x: 0, y: 0 }));
  const scale = 1 / (count * temperature);

  for (let i = 0; i < count; i++) {
    const positive = positiveIndex(i, pairCount);
    gradients[i].x -= views[positive].x * scale;
    gradients[i].y -= views[positive].y * scale;
    gradients[positive].x -= views[i].x * scale;
    gradients[positive].y -= views[i].y * scale;

    const logits = views.map((view, index) => index === i ? -Infinity : dot(views[i], view) / temperature);
    const maximum = Math.max(...logits);
    const weights = logits.map((value) => Number.isFinite(value) ? Math.exp(value - maximum) : 0);
    const normalizer = weights.reduce((sum, value) => sum + value, 0);
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const probabilityScale = (weights[j] / normalizer) * scale;
      gradients[i].x += probabilityScale * views[j].x;
      gradients[i].y += probabilityScale * views[j].y;
      gradients[j].x += probabilityScale * views[i].x;
      gradients[j].y += probabilityScale * views[i].y;
    }
  }

  return views.map((view, index) => {
    const radial = gradients[index].x * view.x + gradients[index].y * view.y;
    const tangentX = gradients[index].x - radial * view.x;
    const tangentY = gradients[index].y - radial * view.y;
    return normalizePoint({
      x: view.x - learningRate * tangentX,
      y: view.y - learningRate * tangentY,
      label: view.label,
    });
  });
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
          对比学习是自监督预训练的一类方法。它不使用人工类别标签，但增强策略本身编码了希望模型保持不变的先验：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li><strong>正样本对：</strong>同一张图像的两个不同增强视图应该在表示空间中相近。</li>
          <li><strong>负样本对：</strong>在 instance discrimination 中，不同原始图像的增强视图通常被当作负样本推远；但它们未必语义不相关，同类图像也可能成为 false negatives。</li>
        </ul>
        <p className="text-gray-700 mb-4">
          以 SimCLR 为例，对大小为 B 的原始批次各生成两个随机增强视图，经编码器与投影头得到 2B 个 L2 归一化向量 q。
          余弦相似度等于归一化向量的点积；下游任务通常使用投影头之前的编码器表示。
        </p>
        <FormulaCard
          title="归一化表示与相似度"
          formula={
            <KaTeX
              math={String.raw`q_a=\frac{z_a}{\|z_a\|_2},\qquad \operatorname{sim}(q_a,q_b)=q_a^Tq_b`}
              display
            />
          }
          description="归一化防止仅靠增大向量范数降低损失，使温度 τ 明确控制相似度 logits 的尺度。"
        />

        <FormulaCard
          title="对称 NT-Xent 损失"
          formula={
            <KaTeX
              math={String.raw`\ell_{a,b}=-\log\frac{\exp(\operatorname{sim}(q_a,q_b)/\tau)}{\sum_{k\ne a}\exp(\operatorname{sim}(q_a,q_k)/\tau)},\qquad L=\frac1{2B}\sum_{i=1}^B\!\left(\ell_{2i-1,2i}+\ell_{2i,2i-1}\right)`}
              display
            />
          }
          description="每个锚点的分母含一个正样本和 2B−2 个负样本。较小 τ 会强化难例权重，但也可能放大噪声和 false negatives。"
        />
        <p className="text-gray-700 mt-2 text-sm">
          {'文本形式：ℓ(a,b) = −log[exp(sim(q_a,q_b)/τ) / Σ_{k≠a}exp(sim(q_a,q_k)/τ)]，再对两个方向和所有样本取平均。'}
        </p>

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          增强必须尽量保留下游语义：例如某些任务中翻转、裁剪或颜色变化会改变标签。大批次提供更多负样本，但同类实例可能成为 false negatives。
          视觉自监督也包括无负样本的自蒸馏、聚类目标和掩码图像建模，不能把自监督等同于对比学习。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：对比学习一步</h2>
        <p className="text-gray-700 mb-4">
          下图把三类二维点视为三个「图像类」，但类别颜色只用于检查，绝不会传入损失。每个实例有两个增强视图并组成正样本对；
          点击迭代后，演示对所有 2B 个单位向量执行对称 NT-Xent 的投影梯度下降。
        </p>
        <p className="text-xs text-gray-500 mb-4">
          教学简化：这里直接优化二维编码器输出，而不是反向传播到图像编码器；每个锚点仍使用一个正样本和 2B−2 个负样本。
          优化目标是实例区分，不是类别聚类；同色点可能互为 false negatives，因此颜色簇不保证收紧。
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
  const [views, setViews] = useState<Point2D[]>(() => createContrastiveViews(10, 42));
  const [temperature, setTemperature] = useState(0.2);
  const [step, setStep] = useState(0);
  const pairCount = views.length / 2;
  const stats = useMemo(() => contrastiveStats(views, temperature), [views, temperature]);

  const applySteps = (count: number) => {
    setViews((current) => {
      let next = current;
      for (let i = 0; i < count; i++) next = contrastiveStep(next, temperature);
      return next;
    });
    setStep((value) => value + count);
  };

  const reset = () => {
    setViews(createContrastiveViews(10, seed));
    setStep(0);
  };

  const resample = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setViews(createContrastiveViews(10, nextSeed));
    setStep(0);
  };

  const colors = ['#2563eb', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applySteps(1)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
        >
          <SkipForward className="w-4 h-4" />
          对比学习一步
        </button>
        <button
          type="button"
          onClick={() => applySteps(10)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          连续 10 步
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
          onClick={resample}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          重新采样
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">温度 τ: {temperature.toFixed(2)}</label>
        <Slider
          aria-label="NT-Xent 温度"
          value={[temperature]}
          min={0.1}
          max={1}
          step={0.05}
          onValueChange={(value) => setTemperature(value[0])}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <EmbeddingPlot id="contrastive-view-a" title="视图 A 的单位嵌入" data={views.slice(0, pairCount)} colors={colors} />
        <EmbeddingPlot id="contrastive-view-b" title="视图 B 的单位嵌入" data={views.slice(pairCount)} colors={colors} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm" aria-live="polite">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="block text-gray-600">平均 NT-Xent</span>
          <span className="font-mono font-medium text-blue-700">{stats.loss.toFixed(6)}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="block text-gray-600">正样本平均余弦</span>
          <span className="font-mono font-medium text-emerald-700">{stats.positiveSimilarity.toFixed(6)}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="block text-gray-600">负样本平均余弦</span>
          <span className="font-mono font-medium text-amber-700">{stats.negativeSimilarity.toFixed(6)}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="block text-gray-600">已执行步数</span>
          <span className="font-mono font-medium text-blue-700">{step}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-600">
        {colors.map((color, index) => (
          <span key={color} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            检查标签 {index + 1}（损失不可见）
          </span>
        ))}
      </div>
    </div>
  );
}

function EmbeddingPlot({ id, title, data, colors }: { id: string; title: string; data: Point2D[]; colors: string[] }) {
  const SIZE = 300;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const PADDING = 16;
  const SCALE = SIZE / 2 - PADDING;

  function toSvg(p: Point2D): { x: number; y: number } {
    return {
      x: CX + p.x * SCALE,
      y: CY - p.y * SCALE,
    };
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">{title}</h4>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full"
        style={{ maxHeight: 300 }}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>单位圆上的二维嵌入散点；颜色仅用于事后检查类别，不参与对比损失。</desc>
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x={PADDING} y={PADDING} width={SIZE - 2 * PADDING} height={SIZE - 2 * PADDING} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="#f9fafb" />
        <circle cx={CX} cy={CY} r={SCALE} fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={PADDING} y1={CY} x2={SIZE - PADDING} y2={CY} stroke="#d1d5db" strokeWidth={1} />
        <line x1={CX} y1={PADDING} x2={CX} y2={SIZE - PADDING} stroke="#d1d5db" strokeWidth={1} />
        <g clipPath={`url(#${id}-clip)`}>
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
        </g>
      </svg>
    </div>
  );
}
