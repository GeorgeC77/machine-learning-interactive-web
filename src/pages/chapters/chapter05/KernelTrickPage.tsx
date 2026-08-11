import { useState, useMemo } from 'react';
import { ShieldAlert, Sparkles, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function KernelTrickPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第五章 · 核方法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">核技巧</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          核技巧让我们能够隐式地使用高维特征空间，而无需显式计算特征映射 φ(x)。
          这是核方法最核心的思想。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Kernel definition */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">核函数</h2>
        </div>
        <p className="text-gray-700 mb-4">
          核函数 <KaTeX math={String.raw`K(x, z)`} /> 定义为特征映射后的内积：
        </p>

        <FormulaCard
          title="核函数定义"
          formula={
            <KaTeX
              math={String.raw`K(x, z) = \phi(x)^T \phi(z)`}
              display
            />
          }
          description="它直接计算两个样本在特征空间中的相似度，而无需显式构造 φ(x)。"
        />

        <p className="text-gray-700 mb-4">
          一个经典的例子是二次核。对于 <KaTeX math={String.raw`x, z \in \mathbb{R}^2`} />，定义：
        </p>

        <FormulaCard
          title="二次核"
          formula={
            <KaTeX
              math={String.raw`K(x, z) = (x^T z)^2`}
              display
            />
          }
          description="它等价于某个二次特征映射后的内积，但计算量为 O(n)（与原始空间内积同阶），而显式构造二次特征需要 O(n²)。"
        />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：核函数 vs 显式特征映射</h2>
        <p className="text-gray-700 mb-4">
          下面比较两种计算方式：左边用显式的二次特征映射计算内积，右边直接用核函数 <KaTeX math={String.raw`K(x, z) = (x^T z)^2`} />。
          拖动滑块改变向量 x，观察两者结果始终相同。
        </p>
        <KernelComparisonDemo />
      </section>

      {/* Kernelized LMS derivation */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">一个完整例子：核化 LMS</h2>
        <p className="text-gray-700 mb-4">
          上一节提到"算法只依赖内积即可核化"。这里以特征空间中的 LMS 为例，完整演示如何把一个算法改写成只依赖核函数的形式。
          从 <KaTeX math={String.raw`\theta = 0`} /> 出发，LMS 的更新规则为：
        </p>
        <FormulaCard
          title="特征空间中的 LMS 更新"
          formula={
            <KaTeX
              math={String.raw`\theta := \theta + \alpha\bigl(y^{(i)} - \theta^T \phi(x^{(i)})\bigr) \phi(x^{(i)})`}
              display
            />
          }
          description="每一步都向 θ 加上某个 φ(x⁽ⁱ⁾) 的倍数。"
        />
        <p className="text-gray-700 mb-4">
          关键观察：由于 θ 从 0 开始，且每次更新只加上特征向量的倍数，所以 θ 始终可以写成训练样本特征映射的线性组合。
          用数学归纳法立即可证——初始时所有系数为 0 成立，每次更新后仍成立：
        </p>
        <FormulaCard
          title="θ 的 β 表示"
          formula={
            <KaTeX
              math={String.raw`\theta = \sum_{i=1}^{m} \beta_i \, \phi\bigl(x^{(i)}\bigr)`}
              display
            />
          }
          description="维护 m 个系数 β 就等价于维护高维（甚至无限维）向量 θ 本身。"
        />
        <p className="text-gray-700 mb-4">
          把 β 表示代入预测函数与更新规则，所有出现的 φ 都只剩下内积形式，可以用核函数 K 替换：
        </p>
        <FormulaCard
          title="核化预测"
          formula={
            <KaTeX
              math={String.raw`h(x) = \theta^T \phi(x) = \sum_{i=1}^{m} \beta_i \, K\bigl(x^{(i)}, x\bigr)`}
              display
            />
          }
          description="对新样本预测时，只需要计算它与训练样本之间的核函数值。"
        />
        <FormulaCard
          title="β 的更新规则"
          formula={
            <KaTeX
              math={String.raw`\beta_i := \beta_i + \alpha\Bigl(y^{(i)} - \sum_{j=1}^{m} \beta_j \, K\bigl(x^{(i)}, x^{(j)}\bigr)\Bigr)`}
              display
            />
          }
          description="其中求和项就是当前模型在 x⁽ⁱ⁾ 上的预测。预先计算一次 Gram 矩阵 K_{ij} = K(x⁽ⁱ⁾, x⁽ʲ⁾)，整个训练过程就不再需要显式的 φ。"
        />
        <p className="text-gray-700 mt-4">
          至此，整个 LMS 算法——训练与预测——都只通过核函数 K 与数据交互。同样的改写技巧也适用于 SVM 的对偶形式（第六章）和核 PCA。
        </p>
      </section>

      {/* Why it matters */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">核技巧为什么强大？</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">避免维度爆炸</h3>
            <p className="text-sm text-gray-700">
              高斯核对应的特征映射是无限维的，但核函数计算只需要原始空间中的距离，
              避免了显式构造无限维特征映射；计算复杂度不依赖隐式特征空间维度，但仍依赖原始输入维度 d（通常需要 O(d)）。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">算法通用性</h3>
            <p className="text-sm text-gray-700">
              只要学习算法可以写成样本内积的形式，就可以用核技巧扩展，
              例如 SVM、PCA、LMS 等。
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-violet-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>核函数 K(x, z) 等于特征映射后的内积。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>通过核函数可以隐式使用高维特征空间，避免显式计算 φ(x)。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-1" />
            <span>核技巧适用于任何只依赖样本内积的算法。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function KernelComparisonDemo() {
  const [x1, setX1] = useState(0.6);
  const [x2, setX2] = useState(0.4);
  const z = useMemo(() => ({ x1: 0.8, x2: 0.3 }), []);

  const xTz = x1 * z.x1 + x2 * z.x2;
  const kernelValue = xTz * xTz;

  const phiX = useMemo(() => [x1 * x1, x2 * x2, Math.SQRT2 * x1 * x2], [x1, x2]);
  const phiZ = useMemo(() => [z.x1 * z.x1, z.x2 * z.x2, Math.SQRT2 * z.x1 * z.x2], [z]);
  const explicitInner = phiX[0] * phiZ[0] + phiX[1] * phiZ[1] + phiX[2] * phiZ[2];

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            x₁ = <span className="font-mono">{x1.toFixed(2)}</span>
          </label>
          <input
            type="range"
            aria-label="向量 x 的第一维"
            min={-1}
            max={1}
            step={0.05}
            value={x1}
            onChange={(e) => setX1(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            x₂ = <span className="font-mono">{x2.toFixed(2)}</span>
          </label>
          <input
            type="range"
            aria-label="向量 x 的第二维"
            min={-1}
            max={1}
            step={0.05}
            value={x2}
            onChange={(e) => setX2(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">显式特征映射</h3>
          <p className="text-xs text-gray-600 mb-2">
            φ(x) = ({phiX[0].toFixed(3)}, {phiX[1].toFixed(3)}, {phiX[2].toFixed(3)})
          </p>
          <p className="text-xs text-gray-600 mb-2">
            φ(z) = ({phiZ[0].toFixed(3)}, {phiZ[1].toFixed(3)}, {phiZ[2].toFixed(3)})
          </p>
          <p className="text-lg font-mono text-blue-700">
            φ(x)ᵀφ(z) = {explicitInner.toFixed(4)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">核函数</h3>
          <p className="text-xs text-gray-600 mb-2">
            xᵀz = {xTz.toFixed(4)}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            K(x, z) = (xᵀz)²
          </p>
          <p className="text-lg font-mono text-violet-700">
            K(x, z) = {kernelValue.toFixed(4)}
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-emerald-700 bg-emerald-50 rounded-lg py-2 border border-emerald-200">
        两种方式结果相同，验证了核技巧的正确性。
      </div>
    </div>
  );
}
