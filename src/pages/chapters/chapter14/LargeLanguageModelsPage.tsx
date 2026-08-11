import { useState, type ReactNode } from 'react';
import { ShieldAlert, Activity, CheckCircle2, Circle } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function LargeLanguageModelsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第十四章 · 自监督学习与基础模型
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">预训练大语言模型</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          自回归 Transformer 通过预测下一个 token 学习文本分布，可通过提示、上下文示例或参数更新适配任务。
          训练目标衡量 token 概率而不是真实性、无害性或任务正确性，因此生成结果必须按用途独立校验。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">语言模型</h2>
        </div>
        <p className="text-gray-700 mb-4">
          语言模型描述 token 序列 x = (x_1, ..., x_T) 的概率分布。token 可能是词、子词、字符或其他离散单元。直接对序列整体建模很困难，
          因此通常使用链式法则将其分解为条件概率的乘积：
        </p>
        <FormulaCard
          title="链式法则"
          formula={
            <KaTeX
              math={String.raw`p(x_1, \dots, x_T) = \prod_{t=1}^T p(x_t | x_1, \dots, x_{t-1})`}
              display
            />
          }
          description="每个位置建模词表大小为 V 的条件分布；等式来自概率链式法则，本身不要求使用 Transformer。"
        />
        <p className="text-gray-700 mt-4">
          {'训练时把输入右移一位：模型在位置 t 输出 logits u_t=f_θ(x_0,…,x_{t−1})∈R^V，用来预测 x_t。因果注意力掩码阻止位置 t 读取未来 token，条件概率由 softmax 给出：'}
        </p>
        <FormulaCard
          title="条件分布"
          formula={
            <KaTeX
              math={String.raw`p_\theta(x_t=v\mid x_{<t})=\operatorname{softmax}(u_t)_v,\qquad u_t=f_\theta(x_{<t})`}
              display
            />
          }
          description="x_<t 表示当前位置之前的上下文；具体实现可使用起始 token、分段边界和 padding mask，并通常并行计算训练序列上所有位置的 logits。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">预训练损失</h2>
        <p className="text-gray-700 mb-4">
          给定文本序列集合，最大化似然等价于最小化非 padding 目标位置的平均负对数似然：
        </p>
        <FormulaCard
          title="交叉熵损失"
          formula={
            <KaTeX
              math={String.raw`L(\theta)=-\frac{1}{N_{\rm tok}}\sum_{i,t}m_t^{(i)}\log p_\theta\!\left(x_t^{(i)}\mid x_{<t}^{(i)}\right),\qquad \operatorname{PPL}=e^{L}`}
              display
            />
          }
          description="m_t^(i) 标记有效目标 token，N_tok=Σ_(i,t)m_t^(i)。困惑度 PPL 仅在相同 token 化与评估分布下才适合比较，较低 PPL 也不保证下游质量或事实正确性。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">文本生成与温度</h2>
        <p className="text-gray-700 mb-4">
          训练完成后，语言模型可以自回归地生成文本。给定前缀，模型依次采样下一个 token，再把采样结果作为新的输入。
          温度参数 τ 控制生成分布的尖锐程度：
        </p>
        <FormulaCard
          title="带温度的采样"
          formula={
            <KaTeX
              math={String.raw`x_{t+1} \sim \text{softmax}\left(\frac{f_\theta(x_0, \dots, x_t)}{\tau}\right)`}
              display
            />
          }
          description="τ>0；τ=1 保持原分布，且在最大 logit 唯一时 τ→0⁺ 的极限趋近贪婪选择。升高温度会摊平分布，但不保证更有创意、更正确或更安全。"
        />
        <p className="mt-4 text-sm text-gray-700 rounded-lg border border-blue-200 bg-blue-50 p-4">
          实际解码常结合 top-k 或 nucleus（top-p）截断、重复控制与停止条件。它们改变的是抽样分布，不会修复模型知识、推理或数据来源上的缺陷。
        </p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：温度对 softmax 的影响</h2>
        <p className="text-gray-700 mb-4">
          调整温度，观察一组固定 logit 上的 softmax 分布如何变化。低温会让概率集中在最大 logit 对应的 token 上，
          高温则让分布更均匀。
        </p>
        <TemperatureDemo />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">下游适配方式</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>监督或指令微调：</strong>在任务示例上更新全部参数或少量适配参数，使输出行为更符合目标格式与偏好。</li>
          <li><strong>零样本提示：</strong>不给任务专用示例，但仍通过自然语言说明、标签描述和输出约束定义任务。</li>
          <li><strong>上下文学习：</strong>在提示中提供输入—输出示例，不更新权重；效果可能受措辞、示例选择、顺序和上下文长度影响。</li>
          <li><strong>检索增强：</strong>在推理时加入检索到的外部证据；仍需评估检索覆盖率、引用一致性和提示注入等失败模式。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">能力边界与评估</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-800 mb-2">生成不等于检索事实</h3>
            <p>模型按条件分布生成 token，可能产生流畅但错误、过时或无来源的内容。高风险用途需要外部证据、工具校验和人工监督。</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <h3 className="font-semibold text-violet-800 mb-2">评估必须贴近使用场景</h3>
            <p>应同时检查任务质量、鲁棒性、校准、偏差、安全、隐私、延迟与成本，并防止训练数据污染测试集或基准答案。</p>
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
            <span>语言模型通过链式法则把 token 序列概率分解为 next-token 条件概率。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>因果 Transformer 用注意力掩码避免看到未来 token，并在训练时并行输出各位置 logits。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>预训练最小化 token 交叉熵；温度改变抽样分布，却不保证正确性或安全性。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>参数微调、提示、上下文学习和检索增强各有成本与失败模式，必须按部署场景评估。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function TemperatureDemo() {
  const [temperature, setTemperature] = useState(1.0);

  // 固定的 logits，对应几个假想的 next-token 候选
  const tokens = ['猫', '狗', '车', '书', '天'];
  const logits = [2.0, 1.2, 0.5, -0.3, -1.0];

  const maxLogit = Math.max(...logits);
  const expSum = logits.reduce((sum, z) => sum + Math.exp((z - maxLogit) / temperature), 0);
  const probs = logits.map((z) => Math.exp((z - maxLogit) / temperature) / expSum);
  const entropy = -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0);
  const maxProb = Math.max(...probs);
  const maxIndex = probs.indexOf(maxProb);
  const effectiveCandidates = Math.exp(entropy);
  const probabilitySum = probs.reduce((sum, probability) => sum + probability, 0);

  return (
    <div className="space-y-4">
      <ControlRow label={`温度 τ: ${temperature.toFixed(2)}`}>
        <Slider
          aria-label="softmax 温度"
          value={[temperature]}
          min={0.1}
          max={2.5}
          step={0.05}
          onValueChange={(v) => setTemperature(v[0])}
        />
      </ControlRow>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200" aria-live="polite">
        {tokens.map((token, idx) => {
          return (
            <div key={token} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="w-8 text-sm font-medium text-gray-700 text-center">{token}</div>
              <div
                className="flex-1 bg-white rounded border border-gray-200 h-6 overflow-hidden"
                role="progressbar"
                aria-label={`token ${token} 的概率`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={probs[idx] * 100}
              >
                <div
                  className="h-full bg-blue-500 transition-all duration-150"
                  style={{ width: `${probs[idx] * 100}%` }}
                />
              </div>
              <div className="w-20 text-right text-sm font-mono text-gray-700">
                {probs[idx].toFixed(6)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm" aria-live="polite">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">分布熵（nats）:</span>
          <span className="ml-2 font-mono font-medium text-blue-700">{entropy.toFixed(6)}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">最大概率:</span>
          <span className="ml-2 font-mono font-medium text-emerald-700">{maxProb.toFixed(6)}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">有效候选数 eᴴ:</span>
          <span className="ml-2 font-mono font-medium text-violet-700">{effectiveCandidates.toFixed(4)}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">最高概率 token:</span>
          <span className="ml-2 font-medium text-amber-700">{tokens[maxIndex]}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">概率和：{probabilitySum.toFixed(12)}。柱长按绝对概率绘制，完整轨道表示概率 1。</p>
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
