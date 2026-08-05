import { useState, useMemo } from 'react';
import { ShieldAlert, Brain, CheckCircle2, Circle, Ban, Mail } from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

const EXAMPLE_EMAILS = [
  { text: '恭喜您中奖了！请点击链接领取奖金', label: '垃圾邮件' as const },
  { text: '今晚开会讨论项目进度', label: '正常邮件' as const },
  { text: '限时优惠，立即购买享受折扣', label: '垃圾邮件' as const },
  { text: '明天下午三点交报告', label: '正常邮件' as const },
];

const TRAIN_SPAM = [
  '中奖 奖金 点击 链接 领取 免费 优惠 立即 购买',
  '限时 优惠 抢购 特价 免费 赠送 点击 查看',
  '恭喜 您 中奖 了 请 尽快 联系 客服 领取',
  '免费 获得 iphone 点击 链接 填写 信息',
  '恭喜 您 的 快递 已 中奖 请 点击 链接 领取 奖品',
  '尊敬 的 用户 您 已 获得 万元 大奖 立即 拨打 电话 领奖',
  '点击 下方 链接 下载 免费 软件 即可 获得 红包',
  '限时 秒杀 全场 一折 立即 下单 享受 优惠',
  '您 的 账户 存在 异常 请 点击 链接 验证 信息',
  '免费 抽奖 100% 中奖  ipad 手机 等 您 来 拿',
];

const TRAIN_HAM = [
  '明天 下午 开会 讨论 项目 进度',
  '报告 已经 提交 请 查收 附件',
  '今晚 三点 交 报告 记得 按时',
  '会议 记录 已经 发送 请 确认',
  '下周 三 上午 十 点 项目 评审 记得 准备 材料',
  '请 大家 本周 五 前 完成 周报 并 发送 给 组长',
  '明天 下午 的 培训 取消 请 互相 转告',
  '附件 是 本次 会议 的 纪要 请 查阅 并 反馈',
  '请 您 确认 一下 合同 的 修改 意见',
  '本周 项目 进度 正常 下周 计划 已经 更新',
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

// 从输入文本中提取词汇表里存在的特征词，并统计出现次数。
// 采用最长匹配优先（从左到右扫描），避免多字词与其单字成分被重复计数。
function extractFeatures(text: string, vocab: Set<string>): string[] {
  const sorted = Array.from(vocab).sort((a, b) => b.length - a.length);
  const features: string[] = [];
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const word of sorted) {
      if (text.startsWith(word, i)) {
        features.push(word);
        i += word.length;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return features;
}

function buildVocabAndCounts(docs: string[]) {
  const counts: Record<string, number> = {};
  let total = 0;
  docs.forEach((doc) => {
    tokenize(doc).forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
      total += 1;
    });
  });
  return { counts, total };
}

export default function NaiveBayesPage() {
  const [input, setInput] = useState('限时优惠，点击链接领取免费奖品');

  const spamData = useMemo(() => buildVocabAndCounts(TRAIN_SPAM), []);
  const hamData = useMemo(() => buildVocabAndCounts(TRAIN_HAM), []);
  const vocab = useMemo(() => {
    const set = new Set<string>();
    Object.keys(spamData.counts).forEach((w) => set.add(w));
    Object.keys(hamData.counts).forEach((w) => set.add(w));
    return set;
  }, [spamData, hamData]);

  const result = useMemo(() => {
    const words = extractFeatures(input, vocab);
    if (words.length === 0) return null;

    const priorSpam = TRAIN_SPAM.length / (TRAIN_SPAM.length + TRAIN_HAM.length);
    const priorHam = TRAIN_HAM.length / (TRAIN_SPAM.length + TRAIN_HAM.length);

    let logSpam = Math.log(priorSpam);
    let logHam = Math.log(priorHam);

    words.forEach((word) => {
      const spamProb = ((spamData.counts[word] || 0) + 1) / (spamData.total + vocab.size);
      const hamProb = ((hamData.counts[word] || 0) + 1) / (hamData.total + vocab.size);
      logSpam += Math.log(spamProb);
      logHam += Math.log(hamProb);
    });

    const spamScore = Math.exp(logSpam);
    const hamScore = Math.exp(logHam);
    const total = spamScore + hamScore;
    return {
      spamProb: total > 0 ? spamScore / total : 0.5,
      words,
    };
  }, [input, spamData, hamData, vocab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第四章 · 生成学习算法
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">朴素贝叶斯</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          朴素贝叶斯假设给定类别后，各个特征条件独立。虽然这个假设很"朴素"，
          但它在文本分类等任务上往往效果出奇地好。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Naive assumption */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">朴素贝叶斯假设</h2>
        </div>
        <p className="text-gray-700 mb-4">
          假设特征向量 <KaTeX math={String.raw`x = (x_1, x_2, \dots, x_n)`} />，朴素贝叶斯假设：
        </p>

        <FormulaCard
          title="条件独立性假设"
          formula={
            <KaTeX
              math={String.raw`p(x \mid y) = p(x_1 \mid y) \, p(x_2 \mid y) \cdots p(x_n \mid y) = \prod_{j=1}^{n} p(x_j \mid y)`}
              display
            />
          }
          description="给定类别 y 后，所有特征相互独立。"
        />

        <p className="text-gray-700 mb-4">
          结合贝叶斯定理，得到分类规则：
        </p>

        <FormulaCard
          title="朴素贝叶斯分类器"
          formula={
            <KaTeX
              math={String.raw`p(y \mid x) \propto p(y) \prod_{j=1}^{n} p(x_j \mid y)`}
              display
            />
          }
          description="预测时选择使上式最大的类别 y。"
        />
      </section>

      {/* Laplace smoothing */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">拉普拉斯平滑</h2>
        <p className="text-gray-700 mb-4">
          如果某个词在训练集中从未出现在某个类别里，直接相乘会得到 0 概率。拉普拉斯平滑为每个特征计数加 1：
        </p>

        <FormulaCard
          title="平滑后的条件概率"
          formula={
            <KaTeX
              math={String.raw`p(x_j \mid y) = \frac{\text{count}(x_j, y) + 1}{\text{count}(y) + |V|}`}
              display
            />
          }
          description="count(x_j, y) 是词 x_j 在类别 y 中出现的次数；count(y) 是类别 y 中所有词的总词数（非文档数）；|V| 是所有类别共享的并集词表大小。这样即使某个词未出现，概率也不会为 0。"
        />
      </section>

      {/* Training data */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">训练数据</h2>
        <p className="text-gray-700 mb-4">
          下面是用 10 封垃圾邮件和 10 封正常邮件构成的训练集。程序会统计每个词在两类邮件中出现的次数，形成词表。
        </p>
        <TrainingDataDisplay />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：垃圾邮件分类器</h2>
        <p className="text-gray-700 mb-4">
          输入一段中文文本后，程序会从文本中提取训练词表里出现过的词作为特征，
          再用拉普拉斯平滑的朴素贝叶斯计算后验概率。
        </p>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          注意：这里显示的是该玩具朴素贝叶斯模型的归一化后验分数，可用于比较类别倾向，但不应理解为真实世界中严格校准的概率。
        </div>

        <div className="space-y-3 mb-4">
          <label className="block text-sm font-medium text-gray-700">输入邮件内容</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="输入一段中文文本..."
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_EMAILS.map((ex) => (
              <button
                key={ex.text}
                onClick={() => setInput(ex.text)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 transition-colors"
              >
                {ex.label === '垃圾邮件' ? <Ban className="w-3 h-3 inline-block align-text-bottom" /> : <Mail className="w-3 h-3 inline-block align-text-bottom" />} {ex.text.slice(0, 12)}...
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">识别结果</span>
              <span className={`font-bold ${result.spamProb > 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {result.spamProb > 0.5 ? '垃圾邮件' : '正常邮件'}（{(Math.max(result.spamProb, 1 - result.spamProb) * 100).toFixed(1)}%）
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-600">垃圾邮件概率</span>
                  <span className="font-mono">{(result.spamProb * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${result.spamProb * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-600">正常邮件概率</span>
                  <span className="font-mono">{((1 - result.spamProb) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(1 - result.spamProb) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              识别到的特征词：{result.words.join(' · ') || '（无有效词汇）'}
            </div>
          </div>
        )}
      </section>

      {/* When to use */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">适用场景</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">文本分类</h3>
            <p className="text-sm text-gray-700">垃圾邮件过滤、情感分析、新闻分类等。词袋特征通常用条件独立假设近似建模（词频实际并不条件独立，这正是"朴素"所在），实践中效果往往不错。</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <h3 className="font-semibold text-violet-800 mb-2">小数据集</h3>
            <p className="text-sm text-gray-700">参数少、训练快，在数据量不大时也能给出有用的分类基线；但由于条件独立假设较强，输出概率未必校准良好。</p>
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
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>朴素贝叶斯假设给定类别后特征条件独立。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>拉普拉斯平滑避免零概率问题。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-violet-500 mt-0.5 mt-1" />
            <span>文本分类是朴素贝叶斯最经典的应用场景之一。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}


function TrainingDataDisplay() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
        <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
          <Ban className="w-5 h-5 text-rose-700" />
          垃圾邮件（10 封）
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {TRAIN_SPAM.map((text, idx) => (
            <li key={idx} className="bg-white rounded-md px-3 py-2 border border-rose-100">
              <span className="text-rose-500 font-medium mr-2">{idx + 1}.</span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
        <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-700" />
          正常邮件（10 封）
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {TRAIN_HAM.map((text, idx) => (
            <li key={idx} className="bg-white rounded-md px-3 py-2 border border-emerald-100">
              <span className="text-emerald-500 font-medium mr-2">{idx + 1}.</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
