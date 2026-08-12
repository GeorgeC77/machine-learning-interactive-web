export interface ChainConfig {
  stateCount: number;
  startState: number;
  goalState: number;
  trapState: number;
  maxSteps: number;
  stepReward: number;
  goalReward: number;
  trapReward: number;
}

export interface Episode {
  states: number[];
  actions: number[];
  rewards: number[];
  trajectory: number[];
  outcome: 'goal' | 'trap' | 'timeout';
}

export interface ReinforceBatchOptions {
  learningRate: number;
  gamma: number;
  batchSize: number;
  useBaseline: boolean;
  baselineRate: number;
  seed: number;
}

export interface ReinforceBatchResult {
  theta: number[][];
  baselines: number[];
  episodeReturns: number[];
  episodeLengths: number[];
  outcomes: Episode['outcome'][];
  lastEpisode: Episode;
  gradient: number[][];
  gradientNorm: number;
}

export const CHAIN_ACTIONS = [-1, 0, 1] as const;

export const DEFAULT_CHAIN: ChainConfig = {
  stateCount: 5,
  startState: 2,
  goalState: 4,
  trapState: 0,
  maxSteps: 15,
  stepReward: -0.02,
  goalReward: 1,
  trapReward: -1,
};

export function stableSoftmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const maximum = Math.max(...logits);
  const exponentials = logits.map((logit) => Math.exp(logit - maximum));
  const normalizer = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / normalizer);
}

export function policyFromTheta(theta: number[][]): number[][] {
  return theta.map(stableSoftmax);
}

export function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.trunc(seed)) % 2_147_483_647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

export function sampleCategorical(probabilities: number[], random: () => number): number {
  if (probabilities.length === 0) throw new Error('Cannot sample an empty categorical distribution.');
  const draw = random();
  let cumulative = 0;
  for (let index = 0; index < probabilities.length; index++) {
    cumulative += probabilities[index];
    if (draw < cumulative) return index;
  }
  return probabilities.length - 1;
}

export function sampleChainEpisode(
  policy: number[][],
  config: ChainConfig,
  random: () => number,
): Episode {
  const states: number[] = [];
  const actions: number[] = [];
  const rewards: number[] = [];
  const trajectory = [config.startState];
  let state = config.startState;
  let outcome: Episode['outcome'] = 'timeout';

  for (let step = 0; step < config.maxSteps; step++) {
    const actionIndex = sampleCategorical(policy[state], random);
    const nextState = Math.max(
      0,
      Math.min(config.stateCount - 1, state + CHAIN_ACTIONS[actionIndex]),
    );
    let reward = config.stepReward;
    if (nextState === config.goalState) {
      reward = config.goalReward;
      outcome = 'goal';
    } else if (nextState === config.trapState) {
      reward = config.trapReward;
      outcome = 'trap';
    }

    states.push(state);
    actions.push(actionIndex);
    rewards.push(reward);
    trajectory.push(nextState);
    state = nextState;
    if (outcome !== 'timeout') break;
  }

  return { states, actions, rewards, trajectory, outcome };
}

export function discountedReturns(rewards: number[], gamma: number): number[] {
  const returns = new Array(rewards.length).fill(0);
  let runningReturn = 0;
  for (let time = rewards.length - 1; time >= 0; time--) {
    runningReturn = rewards[time] + gamma * runningReturn;
    returns[time] = runningReturn;
  }
  return returns;
}

export function reinforceBatchStep(
  theta: number[][],
  baselines: number[],
  config: ChainConfig,
  options: ReinforceBatchOptions,
): ReinforceBatchResult {
  const policy = policyFromTheta(theta);
  const random = createSeededRandom(options.seed);
  const gradient = theta.map((row) => new Array(row.length).fill(0));
  const baselineSums = new Array(config.stateCount).fill(0);
  const baselineCounts = new Array(config.stateCount).fill(0);
  const episodeReturns: number[] = [];
  const episodeLengths: number[] = [];
  const outcomes: Episode['outcome'][] = [];
  let lastEpisode = sampleChainEpisode(policy, config, random);

  for (let episodeIndex = 0; episodeIndex < options.batchSize; episodeIndex++) {
    const episode = episodeIndex === 0
      ? lastEpisode
      : sampleChainEpisode(policy, config, random);
    lastEpisode = episode;
    const returns = discountedReturns(episode.rewards, options.gamma);
    episodeReturns.push(returns[0] ?? 0);
    episodeLengths.push(episode.states.length);
    outcomes.push(episode.outcome);

    for (let time = 0; time < episode.states.length; time++) {
      const state = episode.states[time];
      const action = episode.actions[time];
      const advantage = returns[time] - (options.useBaseline ? baselines[state] : 0);
      const discountWeight = options.gamma ** time;
      for (let actionIndex = 0; actionIndex < policy[state].length; actionIndex++) {
        const score = (actionIndex === action ? 1 : 0) - policy[state][actionIndex];
        gradient[state][actionIndex] += (
          discountWeight * advantage * score / options.batchSize
        );
      }
      baselineSums[state] += returns[time];
      baselineCounts[state] += 1;
    }
  }

  const nextTheta = theta.map((row, state) => row.map((logit, action) =>
    Math.max(-20, Math.min(20, logit + options.learningRate * gradient[state][action])),
  ));
  const nextBaselines = baselines.map((baseline, state) => {
    if (!options.useBaseline) return baseline;
    if (baselineCounts[state] === 0) return baseline;
    const batchTarget = baselineSums[state] / baselineCounts[state];
    return (1 - options.baselineRate) * baseline + options.baselineRate * batchTarget;
  });
  const gradientNorm = Math.sqrt(
    gradient.flat().reduce((sum, value) => sum + value * value, 0),
  );

  return {
    theta: nextTheta,
    baselines: nextBaselines,
    episodeReturns,
    episodeLengths,
    outcomes,
    lastEpisode,
    gradient,
    gradientNorm,
  };
}

export function meanPolicyEntropy(policy: number[][], config: ChainConfig): number {
  const decisionStates = policy.filter((_, state) =>
    state !== config.goalState && state !== config.trapState,
  );
  if (decisionStates.length === 0) return 0;
  return decisionStates.reduce((sum, probabilities) => sum - probabilities.reduce(
    (entropy, probability) => entropy + (probability > 0 ? probability * Math.log(probability) : 0),
    0,
  ), 0) / decisionStates.length;
}

export function exactStartValue(policy: number[][], config: ChainConfig, gamma: number): number {
  let nextValues = new Array(config.stateCount).fill(0);
  for (let remaining = 1; remaining <= config.maxSteps; remaining++) {
    const currentValues = new Array(config.stateCount).fill(0);
    for (let state = 0; state < config.stateCount; state++) {
      if (state === config.goalState || state === config.trapState) continue;
      currentValues[state] = policy[state].reduce((value, probability, actionIndex) => {
        const nextState = Math.max(
          0,
          Math.min(config.stateCount - 1, state + CHAIN_ACTIONS[actionIndex]),
        );
        const terminal = nextState === config.goalState || nextState === config.trapState;
        const reward = nextState === config.goalState
          ? config.goalReward
          : nextState === config.trapState
            ? config.trapReward
            : config.stepReward;
        return value + probability * (reward + (terminal ? 0 : gamma * nextValues[nextState]));
      }, 0);
    }
    nextValues = currentValues;
  }
  return nextValues[config.startState];
}
