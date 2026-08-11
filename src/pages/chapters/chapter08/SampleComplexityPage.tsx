import { useState, useMemo, type ReactNode } from 'react';
import { ShieldAlert, Database, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';
import { Slider } from '@/components/ui/slider';

export default function SampleComplexityPage() {
  const [n, setN] = useState(100);
  const [logHSize, setLogHSize] = useState(3);
  const [delta, setDelta] = useState(0.05);
  const [epsilon, setEpsilon] = useState(0.1);
  const hSize = Math.max(2, Math.round(10 ** logHSize));

  const bound = useMemo(() => {
    return Math.sqrt(Math.log((2 * hSize) / delta) / (2 * n));
  }, [n, hSize, delta]);
  const requiredN = useMemo(
    () => Math.ceil(Math.log((2 * hSize) / delta) / (2 * epsilon * epsilon)),
    [hSize, delta, epsilon],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第八章 · 泛化
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">样本复杂度与泛化界</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          偏差-方差权衡从实验角度解释泛化，而样本复杂度从理论角度回答：
          究竟需要多少训练样本，才能以高概率保证期望风险接近经验风险？
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">从经验风险到期望风险</h2>
        </div>
        <p className="text-gray-700 mb-4">
          训练误差（经验风险）是期望风险的样本估计。独立测试集可以估计期望风险，
          但理论上的泛化界直接研究经验风险与期望风险之间的差距。
        </p>

        <FormulaCard
          title="Hoeffding 不等式"
          formula={
            <KaTeX
              math={String.raw`P\left(\left|\frac{1}{n}\sum_{i=1}^n Z_i - \mathbb{E}[Z]\right| \ge \varepsilon\right) \le 2\exp(-2n\varepsilon^2)`}
              display
            />
          }
          description="对于独立同分布的随机变量 Z_i ∈ [0,1]，经验均值偏离期望的概率随样本数 n 指数衰减。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">有限假设类的泛化界</h2>
        <p className="text-gray-700 mb-4">
          如果假设空间是有限的，利用联合界（Union Bound）可以把单个假设的偏差推广到所有假设：
        </p>

        <FormulaCard
          title="联合界泛化界"
          formula={
            <KaTeX
              math={String.raw`P\left(\exists h \in \mathcal{H}:\ |L(h) - \hat{L}(h)| \ge \varepsilon\right) \le 2|\mathcal{H}|\exp(-2n\varepsilon^2)`}
              display
            />
          }
          description="L(h) 是期望风险，L̂(h) 是经验风险。右边随着假设类大小 |H| 增大而增大，随样本数 n 增大而减小。"
        />

        <p className="text-gray-700 mt-4">
          令右边等于 δ，我们可以得到以至少 1-δ 概率成立的泛化误差上界：
        </p>

        <FormulaCard
          title="泛化误差上界"
          formula={
            <KaTeX
              math={String.raw`\Pr\!\left(\forall h\in\mathcal H:\ |L(h) - \hat{L}(h)| \le \sqrt{\frac{\log\!\left(2|\mathcal{H}|/\delta\right)}{2n}}\right)\ge 1-\delta`}
              display
            />
          }
          description="这是取值于 [0,1] 的有界损失下，由 Hoeffding 不等式与联合界得到的标准形式。增加样本数 n、减小 |H|，或增大失败概率 δ（即接受较低置信度），都会缩小右侧数值。"
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：样本数、假设类大小与泛化界</h2>
        <p className="text-gray-700 mb-4">
          调整样本数、假设类大小、失败概率和目标精度，观察泛化界与所需样本数如何变化。
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <ControlRow label={`样本数 n: ${n}`}>
              <Slider aria-label="泛化界样本数" value={[n]} min={10} max={10000} step={10} onValueChange={(v) => setN(v[0])} />
            </ControlRow>
            <ControlRow label={`假设类大小 |H|: ${hSize.toLocaleString()}`}>
              <Slider aria-label="有限假设类大小的十进制对数" value={[logHSize]} min={0.3} max={6} step={0.05} onValueChange={(v) => setLogHSize(v[0])} />
            </ControlRow>
            <ControlRow label={`失败概率 δ: ${delta.toFixed(3)}`}>
              <Slider aria-label="泛化界失败概率 delta" value={[delta]} min={0.001} max={0.5} step={0.001} onValueChange={(v) => setDelta(v[0])} />
            </ControlRow>
            <ControlRow label={`目标误差 ε: ${epsilon.toFixed(3)}`}>
              <Slider aria-label="目标泛化误差 epsilon" value={[epsilon]} min={0.01} max={0.5} step={0.005} onValueChange={(v) => setEpsilon(v[0])} />
            </ControlRow>
          </div>

          <div className="grid gap-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col justify-center items-center text-center">
              <div className="text-sm text-gray-600 mb-2">当前 n 的一致泛化上界</div>
              <div className="text-4xl font-mono font-bold text-blue-700">{bound.toFixed(6)}</div>
              <div className="text-xs text-gray-500 mt-2">以至少 {((1 - delta) * 100).toFixed(delta < 0.01 ? 1 : 0)}% 的概率，对所有 h∈H 同时成立</div>
              {bound > 1 && <div className="mt-3 text-xs text-amber-700">该数值大于 1；对 [0,1] 损失而言仍成立，但只给出平凡保证。</div>}
            </div>
            <div className={`rounded-xl border p-5 text-center ${n >= requiredN ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-sm text-gray-600 mb-1">要保证误差不超过 ε，至少需要</div>
              <div className="text-3xl font-mono font-bold text-violet-700">{requiredN.toLocaleString()} 个样本</div>
              <div className="text-xs text-gray-600 mt-2">当前 n {n >= requiredN ? '满足' : '尚未满足'}这一充分条件。</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">样本复杂度</h2>
        <p className="text-gray-700 mb-4">
          样本复杂度回答：给定精度 ε 和失败概率 δ（置信度为 1-δ），需要多少样本 n 才能保证泛化误差不超过 ε？
          从上面的上界反解可得：
        </p>
        <FormulaCard
          title="有限假设类的充分样本数"
          formula={
            <KaTeX
              math={String.raw`n \ge \frac{\log\!\left(2|\mathcal H|/\delta\right)}{2\varepsilon^2}
              \quad\Longrightarrow\quad
              n=O\!\left(\frac{1}{\varepsilon^2}\log\frac{|\mathcal H|}{\delta}\right)`}
              display
            />
          }
          description="这是由本页一致收敛界反解得到的充分条件，不是所有问题上的必要样本数。所需样本量对 |H| 为对数依赖，对 ε 为平方反比。"
        />
      </section>

      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>Hoeffding 不等式给出了单个假设经验风险偏离期望风险的指数级概率界。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>联合界把结论推广到有限假设类中的所有假设。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-blue-500 mt-0.5 mt-1" />
            <span>样本复杂度随假设类大小对数增长，随精度平方倒数增长。</span>
          </li>
        </ul>
      </section>
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
