import { ShieldAlert, Activity, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function PretrainingAdaptationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十四章 · 自监督学习与基础模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">预训练与适配</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          基础模型通常先在大量无标注数据上进行预训练，学习通用表示，
          再通过少量标注数据适配到具体的下游任务。这种范式正在改变深度学习应用的开发方式。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">基础模型范式</h2>
        </div>
        <p className="text-gray-700 mb-4">
          传统监督学习需要为每个任务收集大量标注数据，成本高昂。基础模型（foundation models）
          通过两阶段方式缓解这一问题：首先在大规模无标注数据上预训练，然后在下游任务上用少量标注样本进行适配。
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">预训练阶段</h3>
            <p className="text-sm text-gray-700">
              利用大量无标注数据学习通用表示 φ(x)。预训练损失 ℓ_pre 通常来自数据本身，因此称为自监督损失。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">适配阶段</h3>
            <p className="text-sm text-gray-700">
              在下游任务的小规模标注数据上，固定或微调预训练模型，使其输出任务所需的预测。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">预训练目标</h2>
        <p className="text-gray-700 mb-4">
          设预训练数据集为 {'{x^(1), ..., x^(n)}'}，模型 φ_θ 把输入 x 映射到 m 维表示。预训练目标通常是对每个样本的自监督损失取平均：
        </p>
        <FormulaCard
          title="预训练损失"
          formula={
            <KaTeX
              math={String.raw`L_{\text{pre}}(\theta) = \frac{1}{n}\sum_{i=1}^n \ell_{\text{pre}}(\theta, x^{(i)})`}
              display
            />
          }
          description="ℓ_pre 的设计取决于具体预训练任务，例如对比学习中的相似性损失，或语言模型中的 next-token 预测损失。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">适配方法</h2>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">线性探测（Linear Probe）</h3>
        <p className="text-gray-700 mb-4">
          保持预训练模型 θ̂ 不变，只在下游数据上训练一个线性分类头或回归头 w：
        </p>
        <FormulaCard
          title="线性探测"
          formula={
            <KaTeX
              math={String.raw`\min_w \frac{1}{n_{\text{task}}}\sum_{i=1}^{n_{\text{task}}} \ell_{\text{task}}\bigl(y_{\text{task}}^{(i)}, w^T \phi_{\hat{\theta}}(x_{\text{task}}^{(i)})\bigr)`}
              display
            />
          }
          description="当预训练表示足够好时，仅用一个线性层就能在下游任务上取得不错的效果。"
        />

        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">微调（Finetuning）</h3>
        <p className="text-gray-700 mb-4">
          在下游任务上同时优化线性头 w 和预训练模型的参数 θ，但用预训练得到的 θ̂ 作为初始化：
        </p>
        <FormulaCard
          title="微调"
          formula={
            <KaTeX
              math={String.raw`\min_{w,\theta} \frac{1}{n_{\text{task}}}\sum_{i=1}^{n_{\text{task}}} \ell_{\text{task}}\bigl(y_{\text{task}}^{(i)}, w^T \phi_\theta(x_{\text{task}}^{(i)})\bigr)`}
              display
            />
          }
          description="微调允许模型针对下游任务调整表示，通常在下游数据较充足时比线性探测取得更好的性能；下游标注极少时，线性探测往往更稳健。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">下游任务设置</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>零样本学习（zero-shot）：</strong>下游任务没有任何标注样本，直接利用预训练模型完成任务。</li>
          <li><strong>少样本学习（few-shot）：</strong>下游任务只有极少数（如 1–50 个）标注样本。</li>
          <li><strong>全量微调：</strong>下游任务有较多标注数据，可充分微调模型。</li>
        </ul>
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>基础模型通过预训练 + 适配两阶段工作。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>预训练利用自监督损失从大量无标注数据中学习通用表示。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>线性探测只训练输出层，微调则同时更新预训练参数。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>根据下游标注数据量可选择零样本、少样本或全量微调。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
