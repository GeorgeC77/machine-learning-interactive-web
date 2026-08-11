import { ShieldAlert, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function GMMRevisitedPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十一章 · EM 算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">高斯混合模型再探</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          现在用一般 EM 框架重新推导高斯混合模型。我们看到，11.1 节中的具体更新公式正是 E-step 和 M-step 的必然结果。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <RotateCcw className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">E-step</h2>
        </div>
        <p className="text-gray-700 mb-4">
          根据一般 EM 框架，E-step 需要计算隐变量 z^(i) 在当前参数下的后验分布。对于高斯混合模型，这就是：
        </p>
        <FormulaCard
          title="后验权重"
          formula={
            <KaTeX
              math={String.raw`w_j^{(i)} = Q_i\bigl(z^{(i)}=j\bigr) = p\bigl(z^{(i)}=j|x^{(i)};\phi,\mu,\sigma\bigr) = \frac{\phi_j \, \mathcal{N}(x^{(i)};\mu_j,\sigma_j^2)}{\sum_{l=1}^K \phi_l \, \mathcal{N}(x^{(i)};\mu_l,\sigma_l^2)}`}
              display
            />
          }
          description="这与 11.1 节中的 E-step 完全一致。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">M-step</h2>
        <p className="text-gray-700 mb-4">
          M-step 固定 E-step 得到的责任度，关于满足 φ_j≥0、Σ_jφ_j=1 且 σ_j²&gt;0 的参数最大化以下 ELBO：
        </p>
        <FormulaCard
          title="GMM 的 ELBO"
          formula={
            <KaTeX
              math={String.raw`\sum_{i=1}^n \sum_{j=1}^K w_j^{(i)} \log \frac{\phi_j \, \mathcal{N}(x^{(i)};\mu_j,\sigma_j^2)}{w_j^{(i)}}`}
              display
            />
          }
          description="分母 w_j^(i) 是固定责任度产生的熵项，与本轮待优化参数无关；对 μ_j、σ_j² 和带单纯形约束的 φ_j 优化可得闭式更新。"
        />

        <p className="text-gray-700 mt-4">
          对 μ_l 求导并令其为零，得到：
        </p>
        <FormulaCard
          title="均值更新"
          formula={
            <KaTeX
              math={String.raw`\mu_l = \frac{\sum_{i=1}^n w_l^{(i)} x^{(i)}}{\sum_{i=1}^n w_l^{(i)}}`}
              display
            />
          }
          description="这是加权平均，权重是样本属于第 l 个分量的后验概率。"
        />

        <p className="text-gray-700 mt-4">
          对方差 σ_l² 求导，得到：
        </p>
        <FormulaCard
          title="方差更新"
          formula={
            <KaTeX
              math={String.raw`\sigma_l^2 = \frac{\sum_{i=1}^n w_l^{(i)} \bigl(x^{(i)}-\mu_l\bigr)^2}{\sum_{i=1}^n w_l^{(i)}}`}
              display
            />
          }
          description="同样是加权平均，权重相同。"
        />

        <p className="text-gray-700 mt-4">
          对混合权重 φ_j，需要在约束 Σ_j φ_j = 1 下最大化。引入拉格朗日乘子后得到：
        </p>
        <FormulaCard
          title="混合权重更新"
          formula={
            <KaTeX
              math={String.raw`\phi_l = \frac{1}{n}\sum_{i=1}^n w_l^{(i)}`}
              display
            />
          }
          description="每个分量的权重等于所有样本对其后验概率的平均。"
        />

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          若某个分量的有效样本量 N_l=Σ_iw_l^(i) 接近零，更新会数值不稳定；无约束 GMM 还可能令方差趋近零并使似然无界。
          实践中常使用方差下限、先验或正则化，并比较多次初始化。
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
            <span>高斯混合模型的 EM 公式是一般 EM 框架的特例。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>E-step 计算后验权重 w_j^(i)。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>M-step 在有效样本量非零且约束满足时得到 φ、μ、σ² 的闭式更新；退化分量需单独处理。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
