export type Vector2 = [number, number];
export type Matrix2 = [[number, number], [number, number]];

export interface FiniteHorizonChainSolution {
  values: number[][];
  policy: number[][];
}

export interface ChainStep {
  time: number;
  state: number;
  action: number | null;
}

export interface LqrSolution {
  gains: Vector2[];
  riccati: Matrix2[];
}

export interface LqrSimulation {
  states: Vector2[];
  controls: number[];
  stageCosts: number[];
  totalCost: number;
}

export interface KalmanSimulation {
  trueStates: number[];
  observations: number[];
  estimates: number[];
  variances: number[];
  gains: number[];
  rmse: number;
  coverage95: number;
}

export interface PendulumComparison {
  times: number[];
  nonlinear: number[];
  linear: number[];
  rmse: number;
  finalError: number;
}

export const CHAIN_ACTIONS = [-1, 0, 1] as const;

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % 2_147_483_647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

export function sampleStandardNormal(random: () => number): number {
  const u = Math.max(random(), Number.EPSILON);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function solveFiniteHorizonChain(
  horizon: number,
  stateCount: number,
  goal: number,
  slipProbability: number,
): FiniteHorizonChainSolution {
  const values = Array.from({ length: horizon + 1 }, () => new Array(stateCount).fill(0));
  const policy = Array.from({ length: horizon }, () => new Array(stateCount).fill(0));

  for (let state = 0; state < stateCount; state++) {
    values[horizon][state] = -Math.abs(state - goal);
  }

  for (let time = horizon - 1; time >= 0; time--) {
    for (let state = 0; state < stateCount; state++) {
      let bestValue = -Infinity;
      let bestAction = 0;
      for (const action of CHAIN_ACTIONS) {
        const intended = clamp(state + action, 0, stateCount - 1);
        const candidate = (
          (1 - slipProbability) * values[time + 1][intended]
          + slipProbability * values[time + 1][state]
        );
        if (candidate > bestValue + 1e-12) {
          bestValue = candidate;
          bestAction = action;
        }
      }
      values[time][state] = bestValue;
      policy[time][state] = bestAction;
    }
  }

  return { values, policy };
}

export function simulateFiniteHorizonChain(
  policy: number[][],
  start: number,
  stateCount: number,
  slipProbability: number,
  seed: number,
): ChainStep[] {
  const random = createSeededRandom(seed);
  const trajectory: ChainStep[] = [];
  let state = start;

  for (let time = 0; time < policy.length; time++) {
    const action = policy[time][state];
    trajectory.push({ time, state, action });
    if (random() >= slipProbability) {
      state = clamp(state + action, 0, stateCount - 1);
    }
  }
  trajectory.push({ time: policy.length, state, action: null });
  return trajectory;
}

export function solveFiniteHorizonLqr(
  A: Matrix2,
  B: Vector2,
  Q: Matrix2,
  R: number,
  terminalQ: Matrix2,
  horizon: number,
): LqrSolution {
  const gains = new Array<Vector2>(horizon);
  const riccati = new Array<Matrix2>(horizon + 1);
  riccati[horizon] = copyMatrix(terminalQ);

  for (let time = horizon - 1; time >= 0; time--) {
    const nextP = riccati[time + 1];
    const pB = matVec(nextP, B);
    const denominator = R + dot(B, pB);
    if (!(denominator > 0) || !Number.isFinite(denominator)) {
      throw new Error('LQR requires R + BᵀPB to be finite and positive.');
    }
    const pA = matMul(nextP, A);
    const gain: Vector2 = [
      (B[0] * pA[0][0] + B[1] * pA[1][0]) / denominator,
      (B[0] * pA[0][1] + B[1] * pA[1][1]) / denominator,
    ];
    gains[time] = gain;

    const atPA = matMul(transpose(A), pA);
    const atPB: Vector2 = [
      A[0][0] * pB[0] + A[1][0] * pB[1],
      A[0][1] * pB[0] + A[1][1] * pB[1],
    ];
    const update: Matrix2 = [
      [atPA[0][0] - atPB[0] * gain[0], atPA[0][1] - atPB[0] * gain[1]],
      [atPA[1][0] - atPB[1] * gain[0], atPA[1][1] - atPB[1] * gain[1]],
    ];
    riccati[time] = symmetrize(addMatrices(Q, update));
  }

  return { gains, riccati };
}

export function simulateLqr(
  A: Matrix2,
  B: Vector2,
  Q: Matrix2,
  R: number,
  terminalQ: Matrix2,
  gains: Vector2[],
  initialState: Vector2,
  noiseStandardDeviation: number,
  seed: number,
): LqrSimulation {
  const random = createSeededRandom(seed);
  const states: Vector2[] = [[...initialState]];
  const controls: number[] = [];
  const stageCosts: number[] = [];
  let state: Vector2 = [...initialState];

  for (const gain of gains) {
    const control = -dot(gain, state);
    controls.push(control);
    stageCosts.push(quadratic(state, Q) + R * control * control);
    const deterministic = matVec(A, state);
    state = [
      deterministic[0] + B[0] * control + noiseStandardDeviation * sampleStandardNormal(random),
      deterministic[1] + B[1] * control + noiseStandardDeviation * sampleStandardNormal(random),
    ];
    states.push(state);
  }

  const totalCost = stageCosts.reduce((sum, cost) => sum + cost, 0)
    + quadratic(states[states.length - 1], terminalQ);
  return { states, controls, stageCosts, totalCost };
}

export function simulateScalarKalmanFilter(
  horizon: number,
  processVariance: number,
  observationVariance: number,
  initialVariance: number,
  seed: number,
): KalmanSimulation {
  const random = createSeededRandom(seed);
  const initialTrueState = Math.sqrt(initialVariance) * sampleStandardNormal(random);
  const trueStates = [initialTrueState];
  const observations = [initialTrueState + Math.sqrt(observationVariance) * sampleStandardNormal(random)];
  const initialGain = initialVariance / (initialVariance + observationVariance);
  const estimates = [initialGain * observations[0]];
  const variances = [(1 - initialGain) * initialVariance];
  const gains = [initialGain];

  for (let time = 0; time < horizon; time++) {
    const nextTrueState = trueStates[time]
      + Math.sqrt(processVariance) * sampleStandardNormal(random);
    const observation = nextTrueState
      + Math.sqrt(observationVariance) * sampleStandardNormal(random);
    const predictedMean = estimates[time];
    const predictedVariance = variances[time] + processVariance;
    const gain = predictedVariance / (predictedVariance + observationVariance);
    const estimate = predictedMean + gain * (observation - predictedMean);
    const variance = (1 - gain) * predictedVariance;

    trueStates.push(nextTrueState);
    observations.push(observation);
    estimates.push(estimate);
    variances.push(variance);
    gains.push(gain);
  }

  const squaredErrors = estimates.map((estimate, index) =>
    (estimate - trueStates[index]) ** 2,
  );
  const rmse = Math.sqrt(squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length);
  const covered = estimates.filter((estimate, index) =>
    Math.abs(estimate - trueStates[index]) <= 1.96 * Math.sqrt(variances[index]),
  ).length;
  return {
    trueStates,
    observations,
    estimates,
    variances,
    gains,
    rmse,
    coverage95: covered / estimates.length,
  };
}

export function simulatePendulumLinearization(
  initialAngle: number,
  torque: number,
  duration: number,
  gravity: number,
  length: number,
  mass: number,
  damping: number,
): PendulumComparison {
  const integrationStep = 0.002;
  const stepCount = Math.max(1, Math.round(duration / integrationStep));
  const sampleCount = 100;
  const times: number[] = [];
  const nonlinear: number[] = [];
  const linear: number[] = [];
  let nonlinearAngle = initialAngle;
  let nonlinearVelocity = 0;
  let linearAngle = initialAngle;
  let linearVelocity = 0;

  for (let step = 0; step <= stepCount; step++) {
    if (step % Math.max(1, Math.floor(stepCount / sampleCount)) === 0 || step === stepCount) {
      times.push(step * integrationStep);
      nonlinear.push(nonlinearAngle);
      linear.push(linearAngle);
    }
    if (step === stepCount) break;

    const nonlinearAcceleration = (
      (gravity / length) * Math.sin(nonlinearAngle)
      + torque / (mass * length * length)
      - damping * nonlinearVelocity
    );
    const linearAcceleration = (
      (gravity / length) * linearAngle
      + torque / (mass * length * length)
      - damping * linearVelocity
    );
    nonlinearVelocity += nonlinearAcceleration * integrationStep;
    nonlinearAngle += nonlinearVelocity * integrationStep;
    linearVelocity += linearAcceleration * integrationStep;
    linearAngle += linearVelocity * integrationStep;
  }

  const squaredErrors = nonlinear.map((value, index) => (value - linear[index]) ** 2);
  const rmse = Math.sqrt(squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length);
  return {
    times,
    nonlinear,
    linear,
    rmse,
    finalError: Math.abs(nonlinear[nonlinear.length - 1] - linear[linear.length - 1]),
  };
}

export function spectralRadius2(matrix: Matrix2): number {
  const trace = matrix[0][0] + matrix[1][1];
  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const discriminant = trace * trace - 4 * determinant;
  if (discriminant >= 0) {
    const root = Math.sqrt(discriminant);
    return Math.max(Math.abs((trace + root) / 2), Math.abs((trace - root) / 2));
  }
  return Math.sqrt(Math.abs(determinant));
}

export function closedLoopMatrix(A: Matrix2, B: Vector2, gain: Vector2): Matrix2 {
  return [
    [A[0][0] - B[0] * gain[0], A[0][1] - B[0] * gain[1]],
    [A[1][0] - B[1] * gain[0], A[1][1] - B[1] * gain[1]],
  ];
}

function dot(a: Vector2, b: Vector2): number {
  return a[0] * b[0] + a[1] * b[1];
}

function quadratic(vector: Vector2, matrix: Matrix2): number {
  const transformed = matVec(matrix, vector);
  return dot(vector, transformed);
}

function matVec(matrix: Matrix2, vector: Vector2): Vector2 {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ];
}

function matMul(left: Matrix2, right: Matrix2): Matrix2 {
  return [
    [
      left[0][0] * right[0][0] + left[0][1] * right[1][0],
      left[0][0] * right[0][1] + left[0][1] * right[1][1],
    ],
    [
      left[1][0] * right[0][0] + left[1][1] * right[1][0],
      left[1][0] * right[0][1] + left[1][1] * right[1][1],
    ],
  ];
}

function transpose(matrix: Matrix2): Matrix2 {
  return [[matrix[0][0], matrix[1][0]], [matrix[0][1], matrix[1][1]]];
}

function addMatrices(left: Matrix2, right: Matrix2): Matrix2 {
  return [
    [left[0][0] + right[0][0], left[0][1] + right[0][1]],
    [left[1][0] + right[1][0], left[1][1] + right[1][1]],
  ];
}

function symmetrize(matrix: Matrix2): Matrix2 {
  const offDiagonal = (matrix[0][1] + matrix[1][0]) / 2;
  return [[matrix[0][0], offDiagonal], [offDiagonal, matrix[1][1]]];
}

function copyMatrix(matrix: Matrix2): Matrix2 {
  return [[...matrix[0]], [...matrix[1]]];
}
