import { useId } from 'react';
import {
  ACTIONS,
  indexToState,
  isObstacle,
  isTerminal,
  type GridWorldConfig,
} from './GridWorld';

interface GridWorldViewProps {
  config: GridWorldConfig;
  values: number[];
  policy: number[];
  description: string;
}

export default function GridWorldView({
  config,
  values,
  policy,
  description,
}: GridWorldViewProps) {
  const markerId = useId().replace(/:/g, '');
  const cellSize = 72;
  const width = config.cols * cellSize;
  const height = config.rows * cellSize;
  const startIndex = config.start.r * config.cols + config.start.c;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[300px]"
          style={{ maxHeight: 360 }}
          role="img"
          aria-labelledby={`${markerId}-title ${markerId}-description`}
        >
          <title id={`${markerId}-title`}>4×4 网格世界的价值函数与策略</title>
          <desc id={`${markerId}-description`}>{description}</desc>
          <defs>
            <marker
              id={`${markerId}-arrow`}
              markerWidth={6}
              markerHeight={6}
              refX={5}
              refY={2.5}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,5 L5,2.5 z" fill="#2563eb" />
            </marker>
          </defs>

          {Array.from({ length: config.rows * config.cols }, (_, index) => {
            const position = indexToState(index, config.cols);
            const x = position.c * cellSize;
            const y = position.r * cellSize;
            const isGoal = position.r === config.goal.r && position.c === config.goal.c;
            const isTrap = config.traps.some(
              (trap) => trap.r === position.r && trap.c === position.c,
            );
            const obstacle = isObstacle(index, config);

            let fill = '#ffffff';
            if (isGoal) fill = '#d1fae5';
            else if (isTrap) fill = '#fee2e2';
            else if (obstacle) fill = '#374151';

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={fill}
                  stroke="#d1d5db"
                  strokeWidth={1}
                />
                {!obstacle && (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fill="#1f2937"
                  >
                    {values[index].toFixed(3)}
                  </text>
                )}
                {(isGoal || isTrap || obstacle || index === startIndex) && (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fill={obstacle ? '#ffffff' : isTrap ? '#b91c1c' : '#1d4ed8'}
                  >
                    {isGoal ? '目标 +1' : isTrap ? '陷阱 −1' : obstacle ? '障碍' : '起点'}
                  </text>
                )}
                {!obstacle && !isTerminal(index, config) && policy[index] >= 0 && (
                  <PolicyArrow
                    x={x + cellSize / 2}
                    y={y + cellSize * 0.68}
                    action={policy[index]}
                    markerId={`${markerId}-arrow`}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>数字：当前状态价值</span>
        <span>蓝色箭头：当前贪婪动作</span>
        <span>进入绿色/红色终止格后回合结束</span>
      </div>
    </div>
  );
}

function PolicyArrow({
  x,
  y,
  action,
  markerId,
}: {
  x: number;
  y: number;
  action: number;
  markerId: string;
}) {
  const direction = ACTIONS[action];
  const size = 11;
  const dx = direction.dc * size;
  const dy = direction.dr * size;
  return (
    <line
      x1={x - dx * 0.35}
      y1={y - dy * 0.35}
      x2={x + dx * 0.35}
      y2={y + dy * 0.35}
      stroke="#2563eb"
      strokeWidth={2}
      markerEnd={`url(#${markerId})`}
    />
  );
}
