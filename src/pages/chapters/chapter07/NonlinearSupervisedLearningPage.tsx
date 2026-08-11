import { useState, useMemo } from 'react';
import { ShieldAlert, Activity, CheckCircle2 , Circle} from 'lucide-react';
import KaTeX from '@/components/KaTeX';
import FormulaCard from '@/components/FormulaCard';

const TRUE_POINTS = [
  { x: -3, y: 9 },
  { x: -2, y: 4 },
  { x: -1, y: 1 },
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 4 },
  { x: 3, y: 9 },
];

export default function NonlinearSupervisedLearningPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          第七章 · 深度学习
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">非线性模型监督学习</h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          现实世界的数据往往无法用线性模型很好地描述。非线性模型可以捕捉更复杂的模式，
          而神经网络是其中最强大、最灵活的一类方法。
        </p>

        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" /> 本内容仅供教学与非商业学习使用，完整授权说明见页脚。</p>
      </section>

      {/* Why nonlinear */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-gray-900">为什么需要非线性模型？</h2>
        </div>
        <p className="text-gray-700 mb-4">
          线性模型假设输入与输出之间存在线性关系。但很多实际问题中，这种假设过于简化：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>图像识别中，像素与类别之间没有简单的线性关系。</li>
          <li>语音识别中，声波特征与文字之间是高度非线性的映射。</li>
          <li>预测问题中，某些因素只在特定阈值之后才产生影响。</li>
        </ul>

        <FormulaCard
          title="非线性假设函数"
          formula={
            <KaTeX
              math={String.raw`h(x) = W^{[2]} f\bigl(W^{[1]}x+b^{[1]}\bigr)+b^{[2]}`}
              display
            />
          }
          description="隐藏层先产生非线性特征，再由输出层组合这些特征；仅有一个单调激活的单神经元分类器，其阈值边界仍然是线性的。"
        />
      </section>

      {/* Interactive demo */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">交互演示：拟合非线性函数</h2>
        <p className="text-gray-700 mb-4">
          下面是一组服从 <KaTeX math={String.raw`y = x^2`} /> 的数据。分别用线性模型和二次模型去拟合，
          观察哪种模型能更好地捕捉数据规律。
        </p>
        <NonlinearFittingDemo />
      </section>

      {/* XOR problem */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">经典例子：XOR 问题</h2>
        <p className="text-gray-700 mb-4">
          XOR（异或）是展示非线性必要性的经典例子。四个点分别位于 (0,0)、(0,1)、(1,0)、(1,1)，
          标签为相同类别得 0，不同类别得 1。
        </p>
        <p className="text-gray-700 mb-4">
          没有任何一条直线能把标签 0 和标签 1 分开。但隐藏层配合非线性激活可以表示解决 XOR 所需的非线性决策边界。
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[
            { x1: 0, x2: 0, y: 0 },
            { x1: 0, x2: 1, y: 1 },
            { x1: 1, x2: 0, y: 1 },
            { x1: 1, x2: 1, y: 0 },
          ].map((p, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg text-center font-bold ${p.y === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
            >
              ({p.x1}, {p.x2}) → {p.y}
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          小结
        </h3>
        <ul className="space-y-2 text-sm text-rose-800">
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-0.5 mt-1" />
            <span>现实问题通常需要非线性模型。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-0.5 mt-1" />
            <span>非线性激活函数让模型能够学习复杂映射。</span>
          </li>
          <li className="flex items-start gap-2">
            <Circle className="w-2 h-2 fill-current text-rose-500 mt-0.5 mt-1" />
            <span>XOR 问题是线性模型无法解决的典型例子。</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function NonlinearFittingDemo() {
  const [mode, setMode] = useState<'linear' | 'quadratic'>('linear');

  // Precomputed best-fit parameters for y = x^2
  // Linear: y = a x + b, least squares on TRUE_POINTS
  const linearParams = useMemo(() => {
    const n = TRUE_POINTS.length;
    const sumX = TRUE_POINTS.reduce((s, p) => s + p.x, 0);
    const sumY = TRUE_POINTS.reduce((s, p) => s + p.y, 0);
    const sumXY = TRUE_POINTS.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = TRUE_POINTS.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumXX - sumX * sumX;
    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumXX * sumY - sumX * sumXY) / denom;
    return { a, b };
  }, []);

  const quadraticParams = useMemo(() => {
    const design = TRUE_POINTS.map((p) => [p.x * p.x, p.x, 1]);
    const gram = Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => design.reduce((sum, row) => sum + row[r] * row[c], 0)),
    );
    const rhs = Array.from({ length: 3 }, (_, r) =>
      design.reduce((sum, row, i) => sum + row[r] * TRUE_POINTS[i].y, 0),
    );
    const augmented = gram.map((row, i) => [...row, rhs[i]]);
    for (let col = 0; col < 3; col += 1) {
      let pivotRow = col;
      for (let row = col + 1; row < 3; row += 1) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) pivotRow = row;
      }
      [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];
      const pivot = augmented[col][col];
      for (let j = col; j < 4; j += 1) augmented[col][j] /= pivot;
      for (let row = 0; row < 3; row += 1) {
        if (row === col) continue;
        const factor = augmented[row][col];
        for (let j = col; j < 4; j += 1) augmented[row][j] -= factor * augmented[col][j];
      }
    }
    return { a: augmented[0][3], b: augmented[1][3], c: augmented[2][3] };
  }, []);

  const predict = (x: number) => {
    if (mode === 'linear') {
      return linearParams.a * x + linearParams.b;
    }
    return quadraticParams.a * x * x + quadraticParams.b * x + quadraticParams.c;
  };

  const mse = TRUE_POINTS.reduce((sum, point) => sum + (predict(point.x) - point.y) ** 2, 0) / TRUE_POINTS.length;

  const width = 520;
  const height = 320;
  const padding = 40;
  const xMin = -3.5;
  const xMax = 3.5;
  const yMin = -1;
  const yMax = 10;

  const xScale = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const yScale = (y: number) => padding + (1 - (y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const curvePoints: { x: number; y: number }[] = [];
  for (let x = xMin; x <= xMax; x += 0.05) {
    const y = predict(x);
    if (y >= yMin && y <= yMax) curvePoints.push({ x, y });
  }
  const path = curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode('linear')}
          aria-pressed={mode === 'linear'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'linear' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          线性模型 y = ax + b
        </button>
        <button
          type="button"
          onClick={() => setMode('quadratic')}
          aria-pressed={mode === 'quadratic'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'quadratic' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          二次模型 y = x²
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: 320 }} role="img" aria-label={`${mode === 'linear' ? '线性' : '二次'}最小二乘拟合曲线`}>
        <title>{mode === 'linear' ? '线性最小二乘拟合' : '二次最小二乘拟合'}</title>
        {/* grid */}
        {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
          <line key={`v-${x}`} x1={xScale(x)} y1={yScale(yMin)} x2={xScale(x)} y2={yScale(yMax)} stroke="#e5e7eb" />
        ))}
        {[0, 2, 4, 6, 8, 10].map((y) => (
          <line key={`h-${y}`} x1={xScale(xMin)} y1={yScale(y)} x2={xScale(xMax)} y2={yScale(y)} stroke="#e5e7eb" />
        ))}
        {/* axes */}
        <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="#6b7280" strokeWidth={1.5} />
        <line x1={xScale(0)} y1={yScale(yMin)} x2={xScale(0)} y2={yScale(yMax)} stroke="#6b7280" strokeWidth={1.5} />
        {/* curve */}
        <path d={path} fill="none" stroke={mode === 'linear' ? '#2563eb' : '#10b981'} strokeWidth={3} strokeLinecap="round" />
        {/* points */}
        {TRUE_POINTS.map((p, i) => (
          <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r={5} fill="#f43f5e" stroke="white" strokeWidth={2} />
        ))}
      </svg>

      <div className="text-sm text-gray-600">
        {mode === 'linear'
          ? `线性最小二乘：y = ${linearParams.a.toFixed(2)}x + ${linearParams.b.toFixed(2)}，MSE = ${mse.toFixed(2)}。直线无法捕捉抛物线形状。`
          : `二次最小二乘：y = ${quadraticParams.a.toFixed(2)}x² + ${quadraticParams.b.toFixed(2)}x + ${quadraticParams.c.toFixed(2)}，MSE = ${mse.toExponential(2)}。`}
      </div>
    </div>
  );
}
