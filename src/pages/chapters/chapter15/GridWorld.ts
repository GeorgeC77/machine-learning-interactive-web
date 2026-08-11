export interface Pos {
  r: number;
  c: number;
}

export interface GridWorldConfig {
  rows: number;
  cols: number;
  start: Pos;
  goal: Pos;
  traps: Pos[];
  obstacles: Pos[];
  slipProb: number;
  gamma: number;
}

export interface Transition {
  nextIdx: number;
  prob: number;
}

export interface Experience {
  state: number;
  action: number;
  reward: number;
  nextState: number;
}

export interface PolicyIterationResult {
  newV: number[];
  newPolicy: number[];
  evaluationIterations: number;
  residual: number;
  policyStable: boolean;
}

export const ACTIONS = [
  { name: '上', dr: -1, dc: 0 },
  { name: '下', dr: 1, dc: 0 },
  { name: '左', dr: 0, dc: -1 },
  { name: '右', dr: 0, dc: 1 },
] as const;

export function defaultConfig(): GridWorldConfig {
  return {
    rows: 4,
    cols: 4,
    start: { r: 3, c: 0 },
    goal: { r: 0, c: 3 },
    traps: [{ r: 1, c: 1 }, { r: 2, c: 2 }],
    obstacles: [{ r: 1, c: 2 }],
    slipProb: 0.2,
    gamma: 0.95,
  };
}

export function stateIndex(pos: Pos, cols: number): number {
  return pos.r * cols + pos.c;
}

export function indexToState(idx: number, cols: number): Pos {
  return { r: Math.floor(idx / cols), c: idx % cols };
}

export function isSamePos(a: Pos, b: Pos): boolean {
  return a.r === b.r && a.c === b.c;
}

export function isTerminal(idx: number, config: GridWorldConfig): boolean {
  const pos = indexToState(idx, config.cols);
  return isSamePos(pos, config.goal) || config.traps.some((trap) => isSamePos(pos, trap));
}

export function isObstacle(idx: number, config: GridWorldConfig): boolean {
  const pos = indexToState(idx, config.cols);
  return config.obstacles.some((obstacle) => isSamePos(pos, obstacle));
}

/** The episodic demo pays reward when the agent enters a terminal state. */
export function transitionReward(nextIdx: number, config: GridWorldConfig): number {
  const pos = indexToState(nextIdx, config.cols);
  if (isSamePos(pos, config.goal)) return 1;
  if (config.traps.some((trap) => isSamePos(pos, trap))) return -1;
  return 0;
}

function clampMove(pos: Pos, action: { dr: number; dc: number }, config: GridWorldConfig): Pos {
  const next = { r: pos.r + action.dr, c: pos.c + action.dc };
  if (next.r < 0 || next.r >= config.rows || next.c < 0 || next.c >= config.cols) {
    return pos;
  }
  if (config.obstacles.some((obstacle) => isSamePos(next, obstacle))) {
    return pos;
  }
  return next;
}

export function getTransitions(
  idx: number,
  actionIdx: number,
  config: GridWorldConfig,
): Transition[] {
  if (isTerminal(idx, config) || isObstacle(idx, config)) return [];

  const pos = indexToState(idx, config.cols);
  const intended = ACTIONS[actionIdx];
  if (!intended) return [];

  const result = new Map<number, number>();
  const addMove = (move: { dr: number; dc: number }, probability: number) => {
    if (probability <= 0) return;
    const nextIdx = stateIndex(clampMove(pos, move, config), config.cols);
    result.set(nextIdx, (result.get(nextIdx) ?? 0) + probability);
  };

  addMove(intended, 1 - config.slipProb);
  addMove({ dr: intended.dc, dc: -intended.dr }, config.slipProb / 2);
  addMove({ dr: -intended.dc, dc: intended.dr }, config.slipProb / 2);

  return Array.from(result, ([nextIdx, prob]) => ({ nextIdx, prob }));
}

export function actionValue(
  state: number,
  action: number,
  V: number[],
  config: GridWorldConfig,
): number {
  return getTransitions(state, action, config).reduce(
    (sum, transition) => sum + transition.prob * (
      transitionReward(transition.nextIdx, config) + config.gamma * V[transition.nextIdx]
    ),
    0,
  );
}

export function valueIterationStep(V: number[], config: GridWorldConfig): number[] {
  const nStates = config.rows * config.cols;
  const nextV = new Array(nStates).fill(0);

  for (let state = 0; state < nStates; state++) {
    if (isObstacle(state, config) || isTerminal(state, config)) continue;
    nextV[state] = Math.max(...ACTIONS.map((_, action) => actionValue(state, action, V, config)));
  }
  return nextV;
}

export function extractPolicy(V: number[], config: GridWorldConfig): number[] {
  const nStates = config.rows * config.cols;
  const policy = new Array(nStates).fill(-1);

  for (let state = 0; state < nStates; state++) {
    if (isObstacle(state, config) || isTerminal(state, config)) continue;
    let bestAction = 0;
    let bestValue = -Infinity;
    for (let action = 0; action < ACTIONS.length; action++) {
      const candidate = actionValue(state, action, V, config);
      if (candidate > bestValue) {
        bestValue = candidate;
        bestAction = action;
      }
    }
    policy[state] = bestAction;
  }
  return policy;
}

export function policyEvaluationStep(
  V: number[],
  policy: number[],
  config: GridWorldConfig,
): number[] {
  const nStates = config.rows * config.cols;
  const nextV = new Array(nStates).fill(0);

  for (let state = 0; state < nStates; state++) {
    if (isObstacle(state, config) || isTerminal(state, config)) continue;
    const action = policy[state];
    nextV[state] = action >= 0 ? actionValue(state, action, V, config) : 0;
  }
  return nextV;
}

export function maxAbsDiff(a: number[], b: number[]): number {
  let diff = 0;
  for (let index = 0; index < a.length; index++) {
    diff = Math.max(diff, Math.abs(a[index] - b[index]));
  }
  return diff;
}

export function bellmanOptimalityResidual(V: number[], config: GridWorldConfig): number {
  return maxAbsDiff(V, valueIterationStep(V, config));
}

export function policyIterationStep(
  V: number[],
  policy: number[],
  config: GridWorldConfig,
  tolerance = 1e-8,
  maxEvaluationIterations = 1_000,
): PolicyIterationResult {
  let currentV = V.slice();
  let residual = Infinity;
  let evaluationIterations = 0;

  for (; evaluationIterations < maxEvaluationIterations; evaluationIterations++) {
    const nextV = policyEvaluationStep(currentV, policy, config);
    residual = maxAbsDiff(nextV, currentV);
    currentV = nextV;
    if (residual < tolerance) {
      evaluationIterations += 1;
      break;
    }
  }

  const newPolicy = extractPolicy(currentV, config);
  const policyStable = newPolicy.every((action, state) => action === policy[state]);
  return { newV: currentV, newPolicy, evaluationIterations, residual, policyStable };
}

export function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % 2_147_483_647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

export function sampleNextState(transitions: Transition[], random: () => number): number {
  if (transitions.length === 0) throw new Error('Cannot sample from an empty transition list.');
  const sample = random();
  let cumulative = 0;
  for (const transition of transitions) {
    cumulative += transition.prob;
    if (sample < cumulative) return transition.nextIdx;
  }
  return transitions[transitions.length - 1].nextIdx;
}

export function simulateEpisode(
  policy: number[],
  config: GridWorldConfig,
  maxSteps: number,
  seed: number,
  epsilon = 0,
): Experience[] {
  let state = stateIndex(config.start, config.cols);
  const experience: Experience[] = [];
  const random = createSeededRandom(seed);

  for (let step = 0; step < maxSteps && !isTerminal(state, config); step++) {
    const greedyAction = policy[state] >= 0 ? policy[state] : 0;
    const explore = random() < epsilon;
    const action = explore ? Math.floor(random() * ACTIONS.length) : greedyAction;
    const nextState = sampleNextState(getTransitions(state, action, config), random);
    experience.push({
      state,
      action,
      reward: transitionReward(nextState, config),
      nextState,
    });
    state = nextState;
  }

  return experience;
}
