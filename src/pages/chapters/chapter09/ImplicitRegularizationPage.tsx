import { ShieldAlert, Brain, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

export default function ImplicitRegularizationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第九章 · 正则化与模型选择
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">隐式正则化效应</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          除了显式地加入 L1/L2 正则项，训练过程中使用的优化器、学习率、批量大小等选择
          也会隐式地影响模型最终收敛到的解，这种现象被称为隐式正则化。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">优化器也是有偏好的</h2>
        </div>
        <p className="text-gray-700 mb-4">
          在严格凸且设计矩阵满秩等条件下，优化问题可以有唯一全局最小值，此时不同算法若收敛到同一解，差别主要体现在优化过程。
          但在过参数化模型中，损失函数往往有许多（近似）全局最小值，它们的训练损失相近，泛化性能却可能不同。
          此时，优化器不再只是“最小化训练损失”的工具，它还会偏好某些类型的解。
        </p>

        <FormulaCard
          title="损失景观中的多个极小值"
          formula={
            <KaTeX
              math={String.raw`\theta^* = \arg\min_\theta J(\theta) \quad \text{可能有多个 } \theta^* \text{ 使得 } J(\theta^*) \approx 0`}
              display
            />
          }
          description="不同优化轨迹可能到达训练损失相近但性质不同的解；平坦性是常用直觉和经验指标，却不是与参数化无关的泛化保证。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">影响隐式正则化的因素</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">初始学习率</h3>
            <p className="text-sm text-gray-700">
              在部分问题中，较大的初始学习率会改变可稳定到达的区域，并可能偏向局部更平坦的解；过大则会导致震荡或发散。
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2">批量大小</h3>
            <p className="text-sm text-gray-700">
              较小批量通常带来更强的梯度噪声，可能改变算法的隐式偏好，但结果还取决于学习率、数据和模型结构。
            </p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">初始化尺度</h3>
            <p className="text-sm text-gray-700">
              初始化尺度与网络参数化、优化轨迹相互作用，在某些模型中会偏向更小范数或特定结构的解。
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">动量</h3>
            <p className="text-sm text-gray-700">
              动量不仅能加速优化，也会改变轨迹和噪声响应；其最终偏好没有脱离具体任务的统一结论。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">平坦最小值 vs 尖锐最小值</h2>
        <p className="text-gray-700 mb-4">
          在固定参数化和扰动尺度下，平坦最小值附近的损失变化较慢，而尖锐最小值对参数扰动更敏感。
          这常被用来解释鲁棒性与泛化，但“平坦度”会随坐标重参数化而改变，不能单独作为泛化好坏的充分条件。
        </p>
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <svg
            viewBox="0 0 640 240"
            className="w-full"
            style={{ maxHeight: 240 }}
            role="img"
            aria-labelledby="sharpness-chart-title sharpness-chart-desc"
          >
            <title id="sharpness-chart-title">平坦与尖锐损失谷的示意图</title>
            <desc id="sharpness-chart-desc">左侧损失谷较宽，右侧损失谷较窄；两图只表示固定参数化下对参数扰动的局部敏感度。</desc>
            {/* 平坦最小值 */}
            <text x={160} y={30} textAnchor="middle" fontSize={14} fill="#374151">平坦最小值</text>
            <path d="M 40 55 Q 160 235 280 55" fill="none" stroke="#2563eb" strokeWidth={3} />
            <circle cx={160} cy={145} r={5} fill="#2563eb" />
            <text x={160} y={220} textAnchor="middle" fontSize={12} fill="#4b5563">局部变化较缓</text>

            {/* 尖锐最小值 */}
            <text x={480} y={30} textAnchor="middle" fontSize={14} fill="#374151">尖锐最小值</text>
            <path d="M 400 55 L 474 185 L 486 185 L 560 55" fill="none" stroke="#ef4444" strokeWidth={3} />
            <circle cx={480} cy={185} r={5} fill="#ef4444" />
            <text x={480} y={220} textAnchor="middle" fontSize={12} fill="#4b5563">局部变化较剧烈</text>
          </svg>
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
            <span>优化器的选择不仅影响训练速度，还会影响最终解的性质。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>学习率、批量大小、初始化与动量会共同改变优化轨迹；其影响依赖任务，不能归结为一条通用规则。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>平坦性是有用直觉，但依赖参数化；隐式正则化仍是深度学习理论研究的活跃课题。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
