import { ShieldAlert, GitBranch, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function GeneralEMPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十一章 · EM 算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">一般 EM 算法</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          EM 适用于一类隐变量后验可计算、且 M-step 可精确或充分改进的模型。它构造观测对数似然的下界——证据下界（ELBO），
          将困难的边际化问题转化为交替优化问题。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">问题设置</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设我们有一个隐变量模型 p(x, z; θ)，其中 x 是观测变量，z 是隐变量。我们的目标是最大化观测数据的对数似然：
        </p>
        <FormulaCard
          title="观测对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = \sum_{i=1}^n \log p\bigl(x^{(i)};\theta\bigr) = \sum_{i=1}^n \log \sum_{z^{(i)}} p\bigl(x^{(i)}, z^{(i)};\theta\bigr)`}
              display
            />
          }
          description="离散 z 使用求和；连续 z 应改为积分。直接优化通常困难，因为边际化位于对数内部。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">证据下界 ELBO</h2>
        <p className="text-gray-700 mb-4">
          引入支持集覆盖联合分布的任意分布 Q_i(z^(i))，利用对数函数的凹性和 Jensen 不等式，可以得到：
        </p>
        <FormulaCard
          title="ELBO"
          formula={
            <KaTeX
              math={String.raw`\log p(x;\theta) \ge \sum_z Q(z) \log \frac{p(x,z;\theta)}{Q(z)} = \mathbb{E}_{z\sim Q}\left[\log \frac{p(x,z;\theta)}{Q(z)}\right]`}
              display
            />
          }
          description="右边的表达式称为证据下界（Evidence Lower BOund，ELBO），它对任意 Q 都是 log p(x;θ) 的下界。"
        />

        <FormulaCard
          title="似然、ELBO 与 KL 的精确分解"
          formula={
            <KaTeX
              math={String.raw`\log p(x;\theta)=\mathcal L(Q,\theta)+D_{\mathrm{KL}}\!\left(Q(z)\,\|\,p(z|x;\theta)\right)`}
              display
            />
          }
          description="KL 散度非负，因此 ELBO 是下界；当 Q 等于当前参数下的后验时 KL 为零，下界在该参数处与似然相切。"
        />

        <p className="text-gray-700 mt-4">
          为了让下界尽可能紧，我们在 E-step 选择 Q_i 为当前参数下的后验分布：
        </p>
        <FormulaCard
          title="E-step：使下界紧致"
          formula={
            <KaTeX
              math={String.raw`Q_i^{(t)}\bigl(z^{(i)}\bigr) := p\bigl(z^{(i)}|x^{(i)};\theta^{(t)}\bigr)`}
              display
            />
          }
          description="此时 Jensen 不等式取等号，ELBO 恰好等于当前对数似然。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">一般 EM 算法流程</h2>
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 space-y-4">
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">E-step</h3>
            <p className="text-sm text-gray-700">
              对每个样本，按当前参数计算隐变量后验 Q_i^(t)(z^(i)) = p(z^(i)|x^(i); θ^(t))。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">M-step</h3>
            <p className="text-sm text-gray-700">
              固定 Q_i^(t)，最大化 ELBO 得到新参数 θ^(t+1)：
            </p>
            <KaTeX
              math={String.raw`\theta^{(t+1)} := \arg\max_\theta \sum_{i=1}^n \mathbb E_{Q_i^{(t)}}\!\left[\log p\bigl(x^{(i)},z^{(i)};\theta\bigr)\right]`}
              display
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">收敛性保证</h2>
        <p className="text-gray-700 mb-4">
          设 θ^(t) 和 θ^(t+1) 是 EM 连续两次迭代得到的参数。通过 ELBO 的构造可以证明：
        </p>
        <FormulaCard
          title="单调性"
          formula={
            <KaTeX
              math={String.raw`\ell\bigl(\theta^{(t)}\bigr) \le \ell\bigl(\theta^{(t+1)}\bigr)`}
              display
            />
          }
          description="该结论要求精确后验 E-step 与不降低 Q 函数的 M-step，并假设似然有限。适当正则条件下，极限点通常是驻点；EM 不保证全局最优，结果依赖初始化，某些模型的似然还可能无界。"
        />
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-800 mb-2">广义 EM（GEM）</h3>
            <p>M-step 不必找到全局最大值；只要让当前 Q 函数不下降，仍可保留观测似然不下降的结论。</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-semibold text-violet-800 mb-2">变分 EM</h3>
            <p>若 E-step 受限于近似分布族，坐标更新保证的是 ELBO 不下降，通常不再保证真实观测似然每步不下降。</p>
          </div>
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
            <span>EM 适用于 E-step 与 M-step 可处理的一类隐变量模型；不可解时常需变分或 Monte Carlo 近似。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>E-step 设 Q 为隐变量后验，使 ELBO 紧致。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>M-step 固定 Q 并最大化 ELBO 更新参数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>精确 EM 在条件满足时保证观测对数似然单调不减，但局部解、鞍点或奇异退化仍可能出现。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
