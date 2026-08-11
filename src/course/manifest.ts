export type SectionStatus = "draft" | "beta" | "completed";

export type Section = {
  id: string;
  title: string;
  path: string;
  status: SectionStatus;
  description?: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  sections: Section[];
};

export type Part = {
  id: string;
  number: number;
  title: string;
  chapters: Chapter[];
};

export const courseManifest: Part[] = [
  {
    id: "part-i",
    number: 1,
    title: "监督学习",
    chapters: [
      {
        id: "ch01",
        number: 1,
        title: "线性回归",
        sections: [
          {
            id: "ch01-overview",
            title: "1.0 课程概览",
            path: "/overview",
            status: "completed",
            description: "监督学习与线性回归引入、学习路线。",
          },
          {
            id: "ch01-model",
            title: "1.1 模型表示",
            path: "/model",
            status: "completed",
            description: "假设函数、参数与最小二乘直觉。",
          },
          {
            id: "ch01-cost",
            title: "1.2 代价函数",
            path: "/cost-function",
            status: "completed",
            description: "平方误差代价与 Half-MSE。",
          },
          {
            id: "ch01-gd",
            title: "1.3 梯度下降",
            path: "/gradient-descent",
            status: "completed",
            description: "批量梯度下降与动量。",
          },
          {
            id: "ch01-normal",
            title: "1.4 正规方程",
            path: "/normal-equation",
            status: "completed",
            description: "通过矩阵求导得到闭式解。",
          },
          {
            id: "ch01-prob",
            title: "1.5 概率解释",
            path: "/probabilistic",
            status: "completed",
            description: "高斯噪声假设与最大似然估计。",
          },
          {
            id: "ch01-overfit",
            title: "1.6 过拟合",
            path: "/overfitting",
            status: "completed",
            description: "过拟合、训练/测试误差与正则化思想。",
          },
        ],
      },
      {
        id: "ch02",
        number: 2,
        title: "分类与逻辑回归",
        sections: [
          {
            id: "ch02-overview",
            title: "2.0 课程概览",
            path: "/ch02/overview",
            status: "completed",
            description: "分类问题与学习路线。",
          },
          {
            id: "ch02-model",
            title: "2.1 模型表示",
            path: "/ch02/model",
            status: "completed",
            description: "逻辑回归与 sigmoid 函数。",
          },
          {
            id: "ch02-cost",
            title: "2.2 代价函数",
            path: "/ch02/cost-function",
            status: "completed",
            description: "交叉熵损失与最大似然。",
          },
          {
            id: "ch02-gd",
            title: "2.3 梯度下降",
            path: "/ch02/gradient-descent",
            status: "completed",
            description: "逻辑回归的梯度下降。",
          },
          {
            id: "ch02-perceptron",
            title: "2.4 感知机",
            path: "/ch02/perceptron",
            status: "completed",
            description: "感知机学习算法。",
          },
          {
            id: "ch02-multiclass",
            title: "2.5 多分类",
            path: "/ch02/multiclass",
            status: "completed",
            description: "Softmax 回归。",
          },
          {
            id: "ch02-newton",
            title: "2.6 牛顿法",
            path: "/ch02/newton",
            status: "completed",
            description: "牛顿法与优化。",
          },
        ],
      },
      {
        id: "ch03",
        number: 3,
        title: "广义线性模型",
        sections: [
          {
            id: "ch03-overview",
            title: "3.0 课程概览",
            path: "/ch03/overview",
            status: "completed",
            description: "GLM 的核心思想与学习路线。",
          },
          {
            id: "ch03-exponential-family",
            title: "3.1 指数族分布",
            path: "/ch03/exponential-family",
            status: "completed",
            description: "统一描述多种概率分布的框架。",
          },
          {
            id: "ch03-building-glm",
            title: "3.2 构建 GLM",
            path: "/ch03/building-glm",
            status: "completed",
            description: "三个假设与一般形式。",
          },
          {
            id: "ch03-ols-as-glm",
            title: "3.3 普通最小二乘作为 GLM",
            path: "/ch03/ols-as-glm",
            status: "completed",
            description: "高斯分布导出线性回归。",
          },
          {
            id: "ch03-logistic-as-glm",
            title: "3.4 逻辑回归作为 GLM",
            path: "/ch03/logistic-as-glm",
            status: "completed",
            description: "伯努利分布导出 sigmoid。",
          },
          {
            id: "ch03-softmax-as-glm",
            title: "3.5 Softmax 回归作为 GLM",
            path: "/ch03/softmax-as-glm",
            status: "completed",
            description: "多项分布导出多分类。",
          },
          {
            id: "ch03-summary",
            title: "3.6 本章总结",
            path: "/ch03/summary",
            status: "completed",
            description: "核心公式与模型对比。",
          },
        ],
      },
      {
        id: "ch04",
        number: 4,
        title: "生成学习算法",
        sections: [
          {
            id: "ch04-overview",
            title: "4.0 课程概览",
            path: "/ch04/overview",
            status: "completed",
            description: "生成式与判别式方法的区别。",
          },
          {
            id: "ch04-generative-vs-discriminative",
            title: "4.1 生成式 vs 判别式",
            path: "/ch04/generative-vs-discriminative",
            status: "completed",
            description: "两种建模思路的本质区别。",
          },
          {
            id: "ch04-gda",
            title: "4.2 高斯判别分析",
            path: "/ch04/gaussian-discriminant-analysis",
            status: "completed",
            description: "基于多元高斯分布的生成式分类方法。",
          },
          {
            id: "ch04-naive-bayes",
            title: "4.3 朴素贝叶斯",
            path: "/ch04/naive-bayes",
            status: "completed",
            description: "生成式文本分类与拉普拉斯平滑。",
          },
        ],
      },
      {
        id: "ch05",
        number: 5,
        title: "核方法",
        sections: [
          {
            id: "ch05-overview",
            title: "5.0 课程概览",
            path: "/ch05/overview",
            status: "completed",
            description: "核方法的核心思想与学习路线。",
          },
          {
            id: "ch05-feature-mapping",
            title: "5.1 特征映射",
            path: "/ch05/feature-mapping",
            status: "completed",
            description: "将输入映射到高维特征空间。",
          },
          {
            id: "ch05-lms-in-feature-space",
            title: "5.2 特征空间中的 LMS",
            path: "/ch05/lms-in-feature-space",
            status: "completed",
            description: "在高维特征空间中进行梯度下降。",
          },
          {
            id: "ch05-kernel-trick",
            title: "5.3 核技巧",
            path: "/ch05/kernel-trick",
            status: "completed",
            description: "通过核函数隐式实现高维计算。",
          },
          {
            id: "ch05-kernel-properties",
            title: "5.4 核函数的性质",
            path: "/ch05/kernel-properties",
            status: "completed",
            description: "有效核函数及其封闭性质。",
          },
        ],
      },
      {
        id: "ch06",
        number: 6,
        title: "支持向量机",
        sections: [
          {
            id: "ch06-overview",
            title: "6.0 课程概览",
            path: "/ch06/overview",
            status: "completed",
            description: "SVM 的核心思想与学习路线。",
          },
          {
            id: "ch06-margin-intuition",
            title: "6.1 间隔的直观理解",
            path: "/ch06/margin-intuition",
            status: "completed",
            description: "函数间隔、几何间隔与支持向量。",
          },
          {
            id: "ch06-svm-theory",
            title: "6.2 SVM 理论与算法",
            path: "/ch06/svm-theory",
            status: "completed",
            description: "原始问题、对偶问题、SMO 与核 SVM。",
          },
        ],
      },
    ],
  },
  {
    id: "part-ii",
    number: 2,
    title: "深度学习",
    chapters: [
      {
        id: "ch07",
        number: 7,
        title: "深度学习",
        sections: [
          {
            id: "ch07-overview",
            title: "7.0 课程概览",
            path: "/ch07/overview",
            status: "completed",
            description: "深度学习的核心思想与学习路线。",
          },
          {
            id: "ch07-nonlinear-supervised-learning",
            title: "7.1 非线性模型监督学习",
            path: "/ch07/nonlinear-supervised-learning",
            status: "completed",
            description: "超越线性假设的模型。",
          },
          {
            id: "ch07-neural-networks",
            title: "7.2 神经网络",
            path: "/ch07/neural-networks",
            status: "completed",
            description: "分层计算与激活函数。",
          },
          {
            id: "ch07-modern-nn-modules",
            title: "7.3 现代神经网络模块",
            path: "/ch07/modern-nn-modules",
            status: "completed",
            description: "深度网络中常见的构建模块。",
          },
          {
            id: "ch07-backpropagation",
            title: "7.4 反向传播",
            path: "/ch07/backpropagation",
            status: "completed",
            description: "计算图中的高效梯度计算。",
          },
          {
            id: "ch07-vectorization",
            title: "7.5 训练样本的向量化",
            path: "/ch07/vectorization",
            status: "completed",
            description: "用矩阵表示并行化神经网络训练。",
          },
        ],
      },
    ],
  },
  {
    id: "part-iii",
    number: 3,
    title: "泛化与正则化",
    chapters: [
      {
        id: "ch08",
        number: 8,
        title: "泛化",
        sections: [
          {
            id: "ch08-overview",
            title: "8.0 课程概览",
            path: "/ch08/overview",
            status: "completed",
            description: "泛化的核心思想与学习路线。",
          },
          {
            id: "ch08-bias-variance",
            title: "8.1 偏差-方差权衡",
            path: "/ch08/bias-variance",
            status: "completed",
            description: "预测误差的分解。",
          },
          {
            id: "ch08-double-descent",
            title: "8.2 双下降现象",
            path: "/ch08/double-descent",
            status: "completed",
            description: "超越经典 U 型风险曲线。",
          },
          {
            id: "ch08-sample-complexity",
            title: "8.3 样本复杂度上界",
            path: "/ch08/sample-complexity",
            status: "completed",
            description: "有限假设类的泛化界。",
          },
        ],
      },
      {
        id: "ch09",
        number: 9,
        title: "正则化与模型选择",
        sections: [
          {
            id: "ch09-overview",
            title: "9.0 课程概览",
            path: "/ch09/overview",
            status: "completed",
            description: "正则化与模型选择的学习路线。",
          },
          {
            id: "ch09-regularization",
            title: "9.1 正则化",
            path: "/ch09/regularization",
            status: "completed",
            description: "通过惩罚项减少过拟合。",
          },
          {
            id: "ch09-implicit-regularization",
            title: "9.2 隐式正则化效应",
            path: "/ch09/implicit-regularization",
            status: "completed",
            description: "优化过程本身如何起到正则化作用。",
          },
          {
            id: "ch09-cross-validation",
            title: "9.3 交叉验证模型选择",
            path: "/ch09/cross-validation",
            status: "completed",
            description: "选择超参数与模型复杂度。",
          },
          {
            id: "ch09-bayesian-regularization",
            title: "9.4 贝叶斯统计与正则化",
            path: "/ch09/bayesian-regularization",
            status: "completed",
            description: "从概率角度看正则化。",
          },
        ],
      },
    ],
  },
  {
    id: "part-iv",
    number: 4,
    title: "无监督学习",
    chapters: [
      {
        id: "ch10",
        number: 10,
        title: "聚类与 K-means 算法",
        sections: [
          {
            id: "ch10-overview",
            title: "10.0 课程概览",
            path: "/ch10/overview",
            status: "completed",
            description: "聚类与 K-means 的学习路线。",
          },
          {
            id: "ch10-k-means",
            title: "10.1 K-means 聚类",
            path: "/ch10/k-means",
            status: "completed",
            description: "一种迭代聚类算法。",
          },
        ],
      },
      {
        id: "ch11",
        number: 11,
        title: "EM 算法",
        sections: [
          {
            id: "ch11-overview",
            title: "11.0 课程概览",
            path: "/ch11/overview",
            status: "completed",
            description: "EM 算法的学习路线。",
          },
          {
            id: "ch11-gaussian-mixture-em",
            title: "11.1 高斯混合模型的 EM",
            path: "/ch11/gaussian-mixture-em",
            status: "completed",
            description: "用于高斯混合模型的期望最大化算法。",
          },
          {
            id: "ch11-jensen-inequality",
            title: "11.2 Jensen 不等式",
            path: "/ch11/jensen-inequality",
            status: "completed",
            description: "EM 算法的数学基础。",
          },
          {
            id: "ch11-general-em",
            title: "11.3 一般 EM 算法",
            path: "/ch11/general-em",
            status: "completed",
            description: "通用 EM 框架与 ELBO。",
          },
          {
            id: "ch11-gmm-revisited",
            title: "11.4 高斯混合模型再探",
            path: "/ch11/gmm-revisited",
            status: "completed",
            description: "将通用 EM 应用于高斯混合模型。",
          },
          {
            id: "ch11-variational-inference",
            title: "11.5 变分推断与变分自编码器",
            path: "/ch11/variational-inference",
            status: "completed",
            description: "可选内容：变分自编码器。",
          },
        ],
      },
      {
        id: "ch12",
        number: 12,
        title: "主成分分析",
        sections: [
          {
            id: "ch12-overview",
            title: "12.0 课程概览",
            path: "/ch12/overview",
            status: "completed",
            description: "PCA 的学习路线。",
          },
          {
            id: "ch12-pca",
            title: "12.1 主成分分析",
            path: "/ch12/pca",
            status: "completed",
            description: "通过特征向量进行降维。",
          },
        ],
      },
      {
        id: "ch13",
        number: 13,
        title: "独立成分分析",
        sections: [
          {
            id: "ch13-overview",
            title: "13.0 课程概览",
            path: "/ch13/overview",
            status: "completed",
            description: "ICA 的学习路线。",
          },
          {
            id: "ch13-ica",
            title: "13.1 独立成分分析",
            path: "/ch13/ica",
            status: "completed",
            description: "盲源分离与密度变换。",
          },
        ],
      },
      {
        id: "ch14",
        number: 14,
        title: "自监督学习与基础模型",
        sections: [
          {
            id: "ch14-overview",
            title: "14.0 课程概览",
            path: "/ch14/overview",
            status: "completed",
            description: "自监督学习与基础模型的学习路线。",
          },
          {
            id: "ch14-pretraining-adaptation",
            title: "14.1 预训练与适配",
            path: "/ch14/pretraining-adaptation",
            status: "completed",
            description: "从预训练表示迁移学习。",
          },
          {
            id: "ch14-computer-vision-pretraining",
            title: "14.2 计算机视觉中的预训练",
            path: "/ch14/computer-vision-pretraining",
            status: "completed",
            description: "图像领域的自监督方法。",
          },
          {
            id: "ch14-large-language-models",
            title: "14.3 预训练大语言模型",
            path: "/ch14/large-language-models",
            status: "completed",
            description: "Transformer、零样本学习与上下文学习。",
          },
        ],
      },
    ],
  },
  {
    id: "part-v",
    number: 5,
    title: "强化学习",
    chapters: [
      {
        id: "ch15",
        number: 15,
        title: "强化学习",
        sections: [
          {
            id: "ch15-overview",
            title: "15.0 课程概览",
            path: "/ch15/overview",
            status: "draft",
            description: "强化学习的学习路线。",
          },
          {
            id: "ch15-mdp",
            title: "15.1 马尔可夫决策过程",
            path: "/ch15/mdp",
            status: "draft",
            description: "强化学习的形式化问题设定。",
          },
          {
            id: "ch15-value-policy-iteration",
            title: "15.2 值迭代与策略迭代",
            path: "/ch15/value-policy-iteration",
            status: "draft",
            description: "MDP 的动态规划算法。",
          },
          {
            id: "ch15-learning-mdp",
            title: "15.3 学习 MDP 模型",
            path: "/ch15/learning-mdp",
            status: "draft",
            description: "基于模型的强化学习。",
          },
          {
            id: "ch15-continuous-state-mdp",
            title: "15.4 连续状态 MDP",
            path: "/ch15/continuous-state-mdp",
            status: "draft",
            description: "离散化与值函数近似。",
          },
          {
            id: "ch15-value-policy-connection",
            title: "15.5 值迭代与策略迭代的关系",
            path: "/ch15/value-policy-connection",
            status: "draft",
            description: "可选内容：动态规划算法的统一视角。",
          },
        ],
      },
      {
        id: "ch16",
        number: 16,
        title: "线性二次调节与最优控制",
        sections: [
          {
            id: "ch16-finite-horizon-mdp",
            title: "16.1 有限时域 MDP",
            path: "/ch16/finite-horizon-mdp",
            status: "draft",
            description: "具有固定时间范围的 MDP。",
          },
          {
            id: "ch16-lqr",
            title: "16.2 线性二次调节（LQR）",
            path: "/ch16/lqr",
            status: "draft",
            description: "线性系统的最优控制。",
          },
          {
            id: "ch16-nonlinear-to-lqr",
            title: "16.3 从非线性动力学到 LQR",
            path: "/ch16/nonlinear-to-lqr",
            status: "draft",
            description: "线性化与微分动态规划。",
          },
          {
            id: "ch16-lqg",
            title: "16.4 线性二次高斯（LQG）",
            path: "/ch16/lqg",
            status: "draft",
            description: "部分可观测下的 LQR。",
          },
        ],
      },
      {
        id: "ch17",
        number: 17,
        title: "策略梯度（REINFORCE）",
        sections: [
          {
            id: "ch17-policy-gradient",
            title: "17.1 策略梯度与 REINFORCE",
            path: "/ch17/policy-gradient",
            status: "draft",
            description: "直接优化参数化策略。",
          },
        ],
      },
    ],
  },
];

export function getAllSections(): Section[] {
  return courseManifest.flatMap((part) => part.chapters.flatMap((chapter) => chapter.sections));
}

export function getSectionByPath(path: string): Section | undefined {
  return getAllSections().find((section) => section.path === path);
}

export function getCompletedSections(): Section[] {
  return getAllSections().filter((section) => section.status === "completed");
}

export function getBetaSections(): Section[] {
  return getAllSections().filter((section) => section.status === "beta");
}

export function getDraftSections(): Section[] {
  return getAllSections().filter((section) => section.status === "draft");
}

export function getTotalSectionCount(): number {
  return getAllSections().length;
}

export function getCompletedCount(): number {
  return getCompletedSections().length;
}

export function getBetaCount(): number {
  return getBetaSections().length;
}

export function getDraftCount(): number {
  return getDraftSections().length;
}

export function getChapterStatus(chapter: Chapter): SectionStatus {
  const statuses = chapter.sections.map((s) => s.status);
  if (statuses.some((s) => s === "draft")) return "draft";
  if (statuses.some((s) => s === "beta")) return "beta";
  return "completed";
}

export function statusLabel(status: SectionStatus): string {
  switch (status) {
    case "draft":
      return "制作中";
    case "beta":
      return "预览版";
    case "completed":
      return "已完成";
    default:
      return "";
  }
}
