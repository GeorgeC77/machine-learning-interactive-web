const fs = require('fs');
const path = require('path');

/* -------------------------------------------------------------------------- */
/* 数值工具（与页面端保持一致）                                               */
/* -------------------------------------------------------------------------- */
function transpose(A) {
  return A[0].map((_, j) => A.map((row) => row[j]));
}

function thinQR(A) {
  const rows = A.length;
  const cols = A[0].length;
  if (rows < cols) throw new Error('thinQR requires rows >= columns');

  const qColumns = [];
  const R = Array.from({ length: cols }, () => new Array(cols).fill(0));
  for (let j = 0; j < cols; j++) {
    const v = A.map((row) => row[j]);
    for (let i = 0; i < j; i++) {
      const projection = qColumns[i].reduce((sum, q, row) => sum + q * v[row], 0);
      R[i][j] += projection;
      for (let row = 0; row < rows; row++) v[row] -= projection * qColumns[i][row];
    }
    // 再正交化一次，避免在插值阈值附近使用正规方程造成条件数平方。
    for (let i = 0; i < j; i++) {
      const correction = qColumns[i].reduce((sum, q, row) => sum + q * v[row], 0);
      R[i][j] += correction;
      for (let row = 0; row < rows; row++) v[row] -= correction * qColumns[i][row];
    }
    const norm = Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
    if (norm < 1e-12) throw new Error('rank-deficient design matrix');
    R[j][j] = norm;
    qColumns.push(v.map((value) => value / norm));
  }
  return { qColumns, R };
}

function backSubstitute(R, rhs) {
  const result = new Array(rhs.length).fill(0);
  for (let i = rhs.length - 1; i >= 0; i--) {
    const known = R[i].reduce((sum, value, j) => (j > i ? sum + value * result[j] : sum), 0);
    result[i] = (rhs[i] - known) / R[i][i];
  }
  return result;
}

function generateGaussianMatrix(rows, cols, seed) {
  let s = seed;
  const M = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      s = (s * 9301 + 49297) % 233280;
      const u = Math.max(1e-10, s / 233280);
      s = (s * 9301 + 49297) % 233280;
      const v = s / 233280;
      row.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
    }
    M.push(row);
  }
  return M;
}

function generateDataLinear(n, d, noiseStd, seed) {
  const betaTrue = Array.from({ length: d }, (_, j) => (j < 5 ? 1.0 : 0.0));
  const X = generateGaussianMatrix(n, d, seed);
  let s = seed + 7;
  const y = X.map((row) => {
    const pred = row.reduce((sum, xj, j) => sum + xj * betaTrue[j], 0);
    s = (s * 9301 + 49297) % 233280;
    const u = Math.max(1e-10, s / 233280);
    s = (s * 9301 + 49297) % 233280;
    const v = s / 233280;
    return pred + noiseStd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  });
  return { X, y, betaTrue };
}

function fitLinearModel(X, y) {
  const n = X.length;
  const d = X[0].length;

  if (d <= n) {
    const { qColumns, R } = thinQR(X);
    const qty = qColumns.map((column) => column.reduce((sum, q, row) => sum + q * y[row], 0));
    return backSubstitute(R, qty);
  } else {
    const Xt = transpose(X);
    const { qColumns, R } = thinQR(Xt);
    // X^T = QR，因此 Xβ=y 的最小范数解为 β=Qz，其中 R^T z=y。
    const z = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let known = 0;
      for (let j = 0; j < i; j++) known += R[j][i] * z[j];
      z[i] = (y[i] - known) / R[i][i];
    }
    return Array.from({ length: d }, (_, row) =>
      qColumns.reduce((sum, column, j) => sum + column[row] * z[j], 0),
    );
  }
}

function mseLinear(X, beta, y) {
  const pred = X.map((row) => row.reduce((sum, xj, j) => sum + xj * beta[j], 0));
  return pred.reduce((sum, p, i) => sum + Math.pow(p - y[i], 2), 0) / pred.length;
}

/* -------------------------------------------------------------------------- */
/* 生成双下降曲线数据                                                         */
/* -------------------------------------------------------------------------- */
function generateCurve(n, noise, maxD, numTrials, seedOffset) {
  const trainSums = new Array(maxD).fill(0);
  const testSums = new Array(maxD).fill(0);
  const validTrials = new Array(maxD).fill(0);

  // 每次重复实验先生成一个固定的 maxD 维数据集；比较不同 d 时只揭示前 d 个特征，
  // 从而保持样本、标签与真实的前 5 维信号不变。
  for (let t = 0; t < numTrials; t++) {
    const baseSeed = seedOffset * 100000 + t;
    const trainFull = generateDataLinear(n, maxD, noise, baseSeed);
    const testFull = generateDataLinear(200, maxD, noise, baseSeed + 50000);
    for (let d = 1; d <= maxD; d++) {
      try {
        const trainX = trainFull.X.map((row) => row.slice(0, d));
        const testX = testFull.X.map((row) => row.slice(0, d));
        const betaHat = fitLinearModel(trainX, trainFull.y);
        const trainErr = mseLinear(trainX, betaHat, trainFull.y);
        const testErr = mseLinear(testX, betaHat, testFull.y);
        if (Number.isFinite(trainErr) && Number.isFinite(testErr)) {
          trainSums[d - 1] += trainErr;
          testSums[d - 1] += testErr;
          validTrials[d - 1]++;
        }
      } catch {
        // 数值不稳定时跳过
      }
    }
  }
  return Array.from({ length: maxD }, (_, index) => ({
    d: index + 1,
    train: trainSums[index] / validTrials[index],
    test: testSums[index] / validTrials[index],
  })).filter((point, index) => validTrials[index] > 0 && Number.isFinite(point.train) && Number.isFinite(point.test));
}

const PARAMS = {
  nValues: [20, 40, 60],
  noiseValues: [0.1, 0.3, 0.5],
  maxDValues: [80, 120, 160],
  numTrials: 15,
  signalDimensions: 5,
  seedOffset: 0,
};

const dataset = [];
let completed = 0;
const total = PARAMS.nValues.length * PARAMS.noiseValues.length;
const largestMaxD = Math.max(...PARAMS.maxDValues);

for (const n of PARAMS.nValues) {
  for (const noise of PARAMS.noiseValues) {
    console.log(`[${++completed}/${total}] Computing n=${n}, noise=${noise}, maxD=${largestMaxD}`);
    const fullCurve = generateCurve(n, noise, largestMaxD, PARAMS.numTrials, PARAMS.seedOffset);
    for (const maxD of PARAMS.maxDValues) {
      const curve = fullCurve.filter((point) => point.d <= maxD);
      dataset.push({ n, noise, maxD, numTrials: PARAMS.numTrials, curve });
    }
  }
}

const outDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'double-descent-curves.json');
fs.writeFileSync(outPath, JSON.stringify({ params: PARAMS, dataset }, null, 2));
console.log(`Wrote ${outPath} (${dataset.length} curves)`);
