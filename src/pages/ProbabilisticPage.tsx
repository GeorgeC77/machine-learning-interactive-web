import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Dices, Target, Search } from 'lucide-react';
import KaTeX from '../components/KaTeX';
import FormulaCard from '../components/FormulaCard';
import InteractiveDemo from '../components/InteractiveDemo';
import InteractivePanel from '../components/InteractivePanel';

/* ------------------------------------------------------------------ */
/*  Gaussian PDF helper                                                 */
/* ------------------------------------------------------------------ */
function gaussianPdf(x: number, mu: number, sigma: number) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

/* ------------------------------------------------------------------ */
/*  Bell Curve D3 Chart (with σ slider)                                 */
/* ------------------------------------------------------------------ */
function BellCurveChart({ sigma, mu }: { sigma: number; mu: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 560;
    const height = 320;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3.scaleLinear().domain([-12, 12]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 1.5]).range([innerH, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    /* axes */
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .text('ε');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.2f')))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .text('p(ε)');

    /* area under curve */
    const data = d3.range(-12, 12, 0.12).map((x) => ({ x, y: gaussianPdf(x, mu, sigma) }));

    const area = d3
      .area<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y0(innerH)
      .y1((d) => yScale(d.y))
      .curve(d3.curveBasis);

    g.append('path').datum(data).attr('d', area).attr('fill', '#3a7bd5').attr('opacity', 0.15);

    /* curve line */
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveBasis);

    g.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', '#3a7bd5').attr('stroke-width', 2.5);

    /* center line */
    g.append('line')
      .attr('x1', xScale(mu))
      .attr('y1', 0)
      .attr('x2', xScale(mu))
      .attr('y2', innerH)
      .attr('stroke', '#e25b5b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.7);

    /* annotation */
    g.append('text')
      .attr('x', xScale(mu) + 6)
      .attr('y', 12)
      .attr('fill', '#e25b5b')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter, sans-serif')
      .text(`μ = ${mu}`);
  }, [sigma, mu]);

  return <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: 320 }} />;
}

/* ------------------------------------------------------------------ */
/*  Scatter + Noise Bands Chart                                          */
/* ------------------------------------------------------------------ */
function ScatterNoiseChart({ sigma }: { sigma: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const points = useMemo(() => {
    /* fixed seed-like deterministic data */
    const pts: { x: number; y: number }[] = [];
    const xs = [0.5, 1.2, 2.1, 2.8, 3.5, 4.0, 4.6, 5.2, 5.9, 6.5, 7.1, 7.8, 8.4, 9.0, 9.7];
    const noises = [0.3, -0.5, 0.8, -0.2, 0.6, -0.7, 0.4, -0.3, 0.9, -0.6, 0.2, -0.4, 0.7, -0.8, 0.5];
    xs.forEach((x, i) => {
      pts.push({ x, y: 1.5 + 0.8 * x + sigma * noises[i] });
    });
    return pts;
  }, [sigma]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 560;
    const height = 320;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xMin = 0;
    const xMax = 10.5;
    const yMin = 0;
    const yMax = 12;

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    /* axes */
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', 40)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .text('x');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -45)
      .attr('fill', '#636e72')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .text('y');

    /* noise band: upper and lower */
    const bandData = d3.range(xMin, xMax, 0.1).map((x) => ({
      x,
      yUpper: 1.5 + 0.8 * x + 2 * sigma,
      yLower: 1.5 + 0.8 * x - 2 * sigma,
    }));

    const areaUpper = d3
      .area<{ x: number; yUpper: number; yLower: number }>()
      .x((d) => xScale(d.x))
      .y0((d) => yScale(d.yLower))
      .y1((d) => yScale(d.yUpper))
      .curve(d3.curveBasis);

    g.append('path').datum(bandData).attr('d', areaUpper).attr('fill', '#3a7bd5').attr('opacity', 0.08);

    /* 回归线 */
    const lineData = [
      { x: xMin, y: 1.5 + 0.8 * xMin },
      { x: xMax, y: 1.5 + 0.8 * xMax },
    ];
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    g.append('path').datum(lineData).attr('d', line).attr('fill', 'none').attr('stroke', '#3a7bd5').attr('stroke-width', 2.5);

    /* data points */
    g.selectAll('circle.data')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', '#e25b5b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    /* legend */
    const legend = g.append('g').attr('transform', `translate(${innerW - 120}, 10)`);
    legend.append('line').attr('x1', 0).attr('y1', 6).attr('x2', 18).attr('y2', 6).attr('stroke', '#3a7bd5').attr('stroke-width', 2);
    legend.append('text').attr('x', 24).attr('y', 10).attr('fill', '#636e72').attr('font-size', '11px').attr('font-family', 'Inter, sans-serif').text('θᵀx');
    legend.append('rect').attr('x', 0).attr('y', 18).attr('width', 18).attr('height', 8).attr('fill', '#3a7bd5').attr('opacity', 0.15);
    legend.append('text').attr('x', 24).attr('y', 26).attr('fill', '#636e72').attr('font-size', '11px').attr('font-family', 'Inter, sans-serif').text('±2σ 区间');
  }, [points, sigma]);

  return <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: 320 }} />;
}

/* ------------------------------------------------------------------ */
/*  main page                                                            */
/* ------------------------------------------------------------------ */
export default function ProbabilisticPage() {
  const [sigma, setSigma] = useState(1.0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-deep-blue mb-6">概率解释</h1>
      <p className="text-med-gray mb-8 leading-relaxed">
        线性回归的最小二乘法可以从概率论的角度进行解释：在高斯噪声假设下，最小化平方误差等价于最大化似然函数。
      </p>

      {/* Section 1 — Modeling Assumption */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">建模假设</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          假设目标值与输入特征之间存在线性关系，并叠加一个独立同分布的高斯噪声项 ε：
        </p>
        <FormulaCard
          title="线性模型加高斯噪声"
          formula={
            <>
              <KaTeX math={String.raw`y^{(i)} = \theta^T x^{(i)} + \epsilon^{(i)}`} display />
              <div className="mt-2">
                <KaTeX math={String.raw`\epsilon^{(i)} \sim \mathcal{N}(0, \sigma^2)`} display />
              </div>
            </>
          }
          description={
            <>
              噪声项 <KaTeX math={String.raw`\epsilon^{(i)}`} /> 服从均值为 0、方差为 σ² 的独立同分布高斯分布。
              在本页讨论中，σ 是一个固定的已知（或待估计）常数；只要 σ 为常数，最大似然估计得到的 θ 就与最小二乘解相同。
            </>
          }
        />
      </section>

      {/* Section 2 — Noise Intuition */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-sky-800 mb-3 flex items-center gap-2">
            <Dices className="w-6 h-6 text-sky-700" />
            噪声的直觉：考试成绩与真实水平
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/80 border border-sky-200 rounded-lg p-4">
                <h4 className="font-semibold text-sky-800 text-sm mb-2">考试成绩 = 真实水平 + 随机波动</h4>
                <p className="text-sm text-sky-700 leading-relaxed">
                  一个学生的考试成绩不仅取决于他的真实知识水平，还受到很多随机因素影响：
                  当天身体状态、题目是否刚好熟悉、甚至座位光线。ε 就是这些随机因素的总和。
                </p>
              </div>
              <div className="bg-white/80 border border-sky-200 rounded-lg p-4">
                <h4 className="font-semibold text-sky-800 text-sm mb-2">房价 = 基础价格 + 随机因素</h4>
                <p className="text-sm text-sky-700 leading-relaxed">
                  一套房子的售价 = 由面积、地段等特征决定的基础价格 + 随机因素（装修细节、
                  邻里氛围、市场情绪、买卖双方的心理博弈）。ε 就是我们没考虑到的那些因素。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-sky-200 rounded-lg p-3">
              <p className="text-sm text-sky-800 leading-relaxed">
                <strong>关键理解：</strong>噪声 ε 不代表"错误"，而是代表我们模型无法解释的部分。
                世界上没有完美的模型，总有一些随机性是我们无法预测的。好的模型能尽可能减小这种不可预测性。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Likelihood Function */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">似然函数</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          在高斯噪声假设下，给定 x⁽ⁱ⁾ 时 y⁽ⁱ⁾ 的条件概率也服从高斯分布：
        </p>
        <div className="formula-block">
          <KaTeX
            math={String.raw`p(y^{(i)} | x^{(i)}; \theta) = \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{(y^{(i)} - \theta^T x^{(i)})^2}{2\sigma^2}\right)`}
            display
          />
        </div>

        {/* Gaussian Distribution Intuition */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mt-4 mb-4">
          <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-700" />
            高斯分布的直觉：射击靶子
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/80 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 text-sm mb-2">钟形曲线的含义</h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  钟形曲线 = "大多数接近平均值，极端值很少"。就像射击——
                  大部分人打靶，子弹密集在靶心附近，脱靶的很少。
                </p>
              </div>
              <div className="bg-white/80 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 text-sm mb-2">σ 小 = 神枪手</h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  σ 很小 → 数据高度集中在均值附近 → 预测很准。
                  就像神枪手，每一枪都几乎命中靶心。σ 越小，似然函数越陡峭。
                </p>
              </div>
              <div className="bg-white/80 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 text-sm mb-2">σ 大 = 新手</h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  σ 很大 → 数据分散 → 预测困难。
                  就像新手打靶，子弹满天飞舞。σ 越大，似然函数越平缓，但最优 θ 的位置不变。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 leading-relaxed">
                <strong>回到线性回归：</strong>我们的目标是找到一组参数 θ，使得预测值 θᵀx 尽可能接近真实值 y。
                在高斯假设下，这意味着让预测误差 <KaTeX math={String.raw`\epsilon = y - \theta^T x`} /> 尽可能集中在 0 附近——
                就像让射击成绩尽可能集中在靶心上。
              </p>
            </div>
          </div>
        </div>

        <p className="text-dark-gray leading-relaxed mb-4">
          对于 m 个独立样本，联合似然函数为各样本条件概率的乘积：
        </p>
        <div className="formula-block">
          <KaTeX
            math={String.raw`L(\theta) = \prod_{i=1}^m p(y^{(i)} | x^{(i)}; \theta) = \prod_{i=1}^m \frac{1}{\sqrt{2\pi}\sigma} \exp\left(-\frac{(y^{(i)} - \theta^T x^{(i)})^2}{2\sigma^2}\right)`}
            display
          />
        </div>
      </section>

      {/* Section 4 — Log-Likelihood */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">对数似然</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          为了简化乘积的求导，我们对似然函数取对数，得到对数似然函数：
        </p>
        <FormulaCard
          title="对数似然"
          formula={
            <KaTeX
              math={String.raw`\ell(\theta) = m\log\frac{1}{\sqrt{2\pi}\sigma} - \frac{m}{\sigma^2} J(\theta)`}
              display
            />
          }
          description={
            <>
              其中 <KaTeX math={String.raw`J(\theta) = \frac{1}{2m}\sum_{i=1}^m (h_\theta(x^{(i)}) - y^{(i)})^2`} /> 是 half-MSE 代价函数。
              由于 m/σ² 是正的常数，最大化 log L(θ) 等价于最小化 J(θ)。
            </>
          }
        />
      </section>

      {/* Section 5 — MLE gives least squares */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">最大似然估计 = 最小二乘法</h2>
        <p className="text-dark-gray leading-relaxed mb-4">
          最大化对数似然 ℓ(θ) 等价于最小化其中的 J(θ)，因为第一项是常数，而第二项前面有负号。因此：
        </p>
        <div className="formula-block">
          <KaTeX
            math={String.raw`\arg\max_\theta \ell(\theta) = \arg\min_\theta J(\theta)`}
            display
          />
        </div>

        {/* MLE Intuition */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mt-4 mb-4">
          <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-700" />
            最大似然的直觉："什么参数最可能产生我的数据？"
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/80 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 text-sm mb-2">类比：猜学生的平均水平</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  假设你看到一个班 100 个学生的考试成绩。你要猜两个数：平均分 μ 和波动程度 σ。
                  如果大部分成绩在 75 到 85 之间，你会猜 μ ≈ 80。如果成绩范围很窄，σ 就小；如果范围很宽，σ 就大。
                  MLE 就是找到最可能产生这些分数的 (μ, σ) 组合。
                </p>
              </div>
              <div className="bg-white/80 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 text-sm mb-2">为什么 MLE = 最小二乘？</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  直观地说：<strong>"最可能的情况就是误差最小的"</strong>。数学上看，
                  对数似然函数中只有一个与 θ 相关的项：-(m/σ²) · J(θ)。最大化似然等价于最小化 J(θ)，
                  这正是最小二乘法的目标。
                </p>
              </div>
            </div>
            <div className="bg-white/60 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>核心洞见：</strong>在高斯噪声假设下，最小二乘法不仅是一个数学技巧，
                更是一种统计推断方法——它找到了<strong>使观测数据出现概率最大</strong>的参数 θ。
                这就是为什么最小二乘法在实践中如此有效：它背后有坚实的概率理论基础。
              </p>
            </div>
          </div>
        </div>

        <p className="text-dark-gray leading-relaxed">
          这一结论说明：在高斯噪声假设下，最小二乘法是一种自然的统计推断方法——它等价于寻找使观测数据出现概率最大的参数 θ。
        </p>
      </section>

      {/* Section 6 — Interactive Visualization */}
      <section className="mb-10">
        <InteractiveDemo title="交互式可视化：高斯噪声与似然">
          <div className="space-y-6">
            {/* Bell curve panel */}
            <InteractivePanel
              hint="调整 σ 观察高斯分布的扩散变化：σ 越大，噪声越分散"
              chart={<BellCurveChart sigma={sigma} mu={0} />}
              controls={
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-2">
                      噪声标准差 σ: {sigma.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      aria-label="噪声标准差 sigma"
                      min={0.3}
                      max={3.0}
                      step={0.1}
                      value={sigma}
                      onChange={(e) => setSigma(Number(e.target.value))}
                      className="w-full accent-med-blue"
                    />
                    <div className="flex justify-between text-xs text-med-gray mt-1">
                      <span>0.3 (集中)</span>
                      <span>3.0 (分散)</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium mb-1">噪声分布</p>
                    <p className="text-blue-700">
                      当 σ = {sigma.toFixed(1)} 时，约 95% 的噪声落在 ±{(2 * sigma).toFixed(1)} 范围内
                    </p>
                  </div>
                </div>
              }
            />

            {/* Scatter + noise band panel */}
            <InteractivePanel
              hint="散点围绕回归线分布，蓝色区域表示模型假设下的 ±2σ 噪声区间"
              chart={<ScatterNoiseChart sigma={sigma} />}
              controls={
                <div className="space-y-4">
                  <div className="text-sm text-dark-gray">
                    <p className="font-medium mb-2">图示说明</p>
                    <ul className="space-y-2 text-med-gray">
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-med-blue inline-block" />
                        <span>蓝色直线：真实回归线 y = θᵀx</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-soft-red inline-block" />
                        <span>红色散点：带噪声的观测值</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-3 h-2 bg-med-blue opacity-20 inline-block" />
                        <span>蓝色区域：±2σ 噪声区间</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-border-gray rounded-lg p-3 text-sm text-dark-gray">
                    <p className="font-medium mb-1">关键理解</p>
                    <p className="text-med-gray">
                      增大 σ 会使数据点更加分散，似然函数变得更平缓；减小 σ 则数据更集中，似然函数更陡峭。
                      在固定 σ 的同方差高斯噪声假设下，最大似然估计得到的 θ 与最小二乘解完全一致，
                      σ 只影响似然函数的尺度和陡峭程度，不改变最优 θ 的位置。
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        </InteractiveDemo>
      </section>
    </div>
  );
}
