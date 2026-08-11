import { ShieldAlert, Activity, CheckCircle2, Circle } from 'lucide-react';
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
          基础模型先在广泛数据上通过自监督、监督或混合目标学习可迁移能力，再通过冻结表示、参数更新或提示适配到具体任务。
          预训练并不自动保证泛化、安全或公平，适配方式必须结合数据量、成本和风险选择。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">基础模型范式</h2>
        </div>
        <p className="text-gray-700 mb-4">
          为每个任务从头训练通常需要大量数据和计算。基础模型（foundation models）先在覆盖面较广的数据与目标上预训练，
          再服务多个下游任务。预训练数据不一定完全无标注，适配也不一定需要更新全部参数。
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">预训练阶段</h3>
            <p className="text-sm text-gray-700">
              使用自监督、监督、弱监督或多目标训练学习表示与生成能力。自监督目标从输入本身构造训练信号，不等于数据没有版权、隐私或质量风险。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">适配阶段</h3>
            <p className="text-sm text-gray-700">
              可冻结骨干网络、更新全部参数、训练少量新增参数，或仅在上下文中提供任务说明与示例；不同方法的成本和能力边界不同。
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
          description="ℓ_pre 的设计决定模型被鼓励保留哪些信息，例如视觉增强不变性或 next-token 预测。低预训练损失不保证下游性能，仍需独立评估。"
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
          description="线性探测用于评估冻结表示的线性可分性，训练和部署成本较低；它不能代表所有非线性适配能力。"
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
          description="全量微调容量最大但显存、存储与训练成本较高，也可能过拟合或遗忘预训练能力；应使用验证集选择学习率、正则化与停止时机。"
        />

        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">参数高效微调（PEFT）</h3>
        <p className="text-gray-700 mb-4">
          冻结大部分预训练参数，只训练适配器、低秩更新或软提示等小规模参数。它能降低每个任务的可训练参数与检查点成本，
          但不保证达到全量微调效果，推理开销也取决于具体方法。
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-6">提示与上下文学习</h3>
        <p className="text-gray-700">
          对支持生成或条件预测的模型，可在不更新权重时提供任务指令、约束和示例。此方式便于快速试验，但对措辞、示例顺序和上下文分布可能敏感。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">下游任务设置</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>零样本（zero-shot）：</strong>评估时不给任务专用标注示例，但仍需提供任务定义、标签语义或提示；不能据此断言模型从未见过相似数据。</li>
          <li><strong>少样本（few-shot）：</strong>只提供少量任务示例，可用于训练参数或放入上下文；“少量”的具体数量依任务而定。</li>
          <li><strong>全量适配：</strong>任务数据较充足时可训练更多参数，但数据量不是唯一依据，还要考虑分布偏移、算力、延迟与合规要求。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">可靠评估与生命周期</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">防止泄漏</h3>
            <p>按用户、时间或实体划分数据，避免同源样本跨集合；预处理和超参数只能用训练集与验证集拟合，测试集留到最终评估。</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-800 mb-2">面向部署</h3>
            <p>除平均指标外，还要检查子群体、校准、鲁棒性、延迟、资源消耗与失败模式，并在数据或环境变化后持续监测。</p>
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
            <span>基础模型通过广泛预训练获得可迁移能力，再以训练或提示等方式适配。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>自监督从输入构造训练信号，但基础模型也可能结合监督、弱监督和多目标训练。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>线性探测、全量微调、PEFT 与上下文学习具有不同的容量、成本和风险。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>适配方案应由独立验证、部署约束与风险评估共同决定，不能只看标注数量。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
