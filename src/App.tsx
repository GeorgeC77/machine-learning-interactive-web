import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

// Legacy linear-regression sub-topic pages (Chapter 1)
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const ModelPage = lazy(() => import('./pages/ModelPage'));
const CostFunctionPage = lazy(() => import('./pages/CostFunctionPage'));
const GradientDescentPage = lazy(() => import('./pages/GradientDescentPage'));
const NormalEquationPage = lazy(() => import('./pages/NormalEquationPage'));
const ProbabilisticPage = lazy(() => import('./pages/ProbabilisticPage'));
const OverfittingPage = lazy(() => import('./pages/OverfittingPage'));

// Chapter 2 pages
const Chapter02OverviewPage = lazy(() => import('./pages/chapters/chapter02/OverviewPage'));
const Chapter02ModelPage = lazy(() => import('./pages/chapters/chapter02/ModelPage'));
const Chapter02CostFunctionPage = lazy(() => import('./pages/chapters/chapter02/CostFunctionPage'));
const Chapter02GradientDescentPage = lazy(() => import('./pages/chapters/chapter02/GradientDescentPage'));
const Chapter02PerceptronPage = lazy(() => import('./pages/chapters/chapter02/PerceptronPage'));
const Chapter02MulticlassPage = lazy(() => import('./pages/chapters/chapter02/MulticlassPage'));
const Chapter02NewtonPage = lazy(() => import('./pages/chapters/chapter02/NewtonPage'));

// Chapter 3 pages
const Chapter03OverviewPage = lazy(() => import('./pages/chapters/chapter03/OverviewPage'));
const Chapter03ExponentialFamilyPage = lazy(() => import('./pages/chapters/chapter03/ExponentialFamilyPage'));
const Chapter03BuildingGLMPage = lazy(() => import('./pages/chapters/chapter03/BuildingGLMPage'));
const Chapter03OLSasGLMPage = lazy(() => import('./pages/chapters/chapter03/OLSasGLMPage'));
const Chapter03LogisticAsGLMPage = lazy(() => import('./pages/chapters/chapter03/LogisticAsGLMPage'));
const Chapter03SoftmaxAsGLMPage = lazy(() => import('./pages/chapters/chapter03/SoftmaxAsGLMPage'));
const Chapter03SummaryPage = lazy(() => import('./pages/chapters/chapter03/SummaryPage'));

// Chapter 4 pages
const Chapter04OverviewPage = lazy(() => import('./pages/chapters/chapter04/OverviewPage'));
const Chapter04GenerativeVsDiscriminativePage = lazy(() => import('./pages/chapters/chapter04/GenerativeVsDiscriminativePage'));
const Chapter04GaussianDiscriminantAnalysisPage = lazy(() => import('./pages/chapters/chapter04/GaussianDiscriminantAnalysisPage'));
const Chapter04NaiveBayesPage = lazy(() => import('./pages/chapters/chapter04/NaiveBayesPage'));

// Chapter 5 pages
const Chapter05OverviewPage = lazy(() => import('./pages/chapters/chapter05/OverviewPage'));
const Chapter05FeatureMappingPage = lazy(() => import('./pages/chapters/chapter05/FeatureMappingPage'));
const Chapter05LMSInFeatureSpacePage = lazy(() => import('./pages/chapters/chapter05/LMSInFeatureSpacePage'));
const Chapter05KernelTrickPage = lazy(() => import('./pages/chapters/chapter05/KernelTrickPage'));
const Chapter05KernelPropertiesPage = lazy(() => import('./pages/chapters/chapter05/KernelPropertiesPage'));

// Chapter 6 pages
const Chapter06OverviewPage = lazy(() => import('./pages/chapters/chapter06/OverviewPage'));
const Chapter06MarginIntuitionPage = lazy(() => import('./pages/chapters/chapter06/MarginIntuitionPage'));
const Chapter06SVMTheoryPage = lazy(() => import('./pages/chapters/chapter06/SVMTheoryPage'));

// Chapter 7 pages
const Chapter07OverviewPage = lazy(() => import('./pages/chapters/chapter07/OverviewPage'));
const Chapter07NonlinearSupervisedLearningPage = lazy(() => import('./pages/chapters/chapter07/NonlinearSupervisedLearningPage'));
const Chapter07NeuralNetworksPage = lazy(() => import('./pages/chapters/chapter07/NeuralNetworksPage'));
const Chapter07ModernNNModulesPage = lazy(() => import('./pages/chapters/chapter07/ModernNNModulesPage'));
const Chapter07BackpropagationPage = lazy(() => import('./pages/chapters/chapter07/BackpropagationPage'));
const Chapter07VectorizationPage = lazy(() => import('./pages/chapters/chapter07/VectorizationPage'));

// Chapter 8 pages
const Chapter08OverviewPage = lazy(() => import('./pages/chapters/chapter08/OverviewPage'));
const Chapter08BiasVariancePage = lazy(() => import('./pages/chapters/chapter08/BiasVariancePage'));
const Chapter08DoubleDescentPage = lazy(() => import('./pages/chapters/chapter08/DoubleDescentPage'));
const Chapter08SampleComplexityPage = lazy(() => import('./pages/chapters/chapter08/SampleComplexityPage'));

// Chapter 9 pages
const Chapter09OverviewPage = lazy(() => import('./pages/chapters/chapter09/OverviewPage'));
const Chapter09RegularizationPage = lazy(() => import('./pages/chapters/chapter09/RegularizationPage'));
const Chapter09ImplicitRegularizationPage = lazy(() => import('./pages/chapters/chapter09/ImplicitRegularizationPage'));
const Chapter09CrossValidationPage = lazy(() => import('./pages/chapters/chapter09/CrossValidationPage'));
const Chapter09BayesianRegularizationPage = lazy(() => import('./pages/chapters/chapter09/BayesianRegularizationPage'));

// Chapter 10 pages
const Chapter10OverviewPage = lazy(() => import('./pages/chapters/chapter10/OverviewPage'));
const Chapter10KMeansPage = lazy(() => import('./pages/chapters/chapter10/KMeansPage'));

// Chapter 11 pages
const Chapter11OverviewPage = lazy(() => import('./pages/chapters/chapter11/OverviewPage'));
const Chapter11GaussianMixtureEMPage = lazy(() => import('./pages/chapters/chapter11/GaussianMixtureEMPage'));
const Chapter11JensenInequalityPage = lazy(() => import('./pages/chapters/chapter11/JensenInequalityPage'));
const Chapter11GeneralEMPage = lazy(() => import('./pages/chapters/chapter11/GeneralEMPage'));
const Chapter11GMMRevisitedPage = lazy(() => import('./pages/chapters/chapter11/GMMRevisitedPage'));
const Chapter11VariationalInferencePage = lazy(() => import('./pages/chapters/chapter11/VariationalInferencePage'));

// Chapter 12 pages
const Chapter12OverviewPage = lazy(() => import('./pages/chapters/chapter12/OverviewPage'));
const Chapter12PCAPage = lazy(() => import('./pages/chapters/chapter12/PCAPage'));

// Chapter 13 pages
const Chapter13OverviewPage = lazy(() => import('./pages/chapters/chapter13/OverviewPage'));
const Chapter13ICAPage = lazy(() => import('./pages/chapters/chapter13/ICAPage'));

// Chapter 14 pages
const Chapter14OverviewPage = lazy(() => import('./pages/chapters/chapter14/OverviewPage'));
const Chapter14PretrainingAdaptationPage = lazy(() => import('./pages/chapters/chapter14/PretrainingAdaptationPage'));
const Chapter14ComputerVisionPretrainingPage = lazy(() => import('./pages/chapters/chapter14/ComputerVisionPretrainingPage'));
const Chapter14LargeLanguageModelsPage = lazy(() => import('./pages/chapters/chapter14/LargeLanguageModelsPage'));

// Chapter 15 pages
const Chapter15OverviewPage = lazy(() => import('./pages/chapters/chapter15/OverviewPage'));
const Chapter15MDPPage = lazy(() => import('./pages/chapters/chapter15/MDPPage'));
const Chapter15ValuePolicyIterationPage = lazy(() => import('./pages/chapters/chapter15/ValuePolicyIterationPage'));
const Chapter15LearningMDPPage = lazy(() => import('./pages/chapters/chapter15/LearningMDPPage'));
const Chapter15ContinuousStateMDPPage = lazy(() => import('./pages/chapters/chapter15/ContinuousStateMDPPage'));
const Chapter15ValuePolicyConnectionPage = lazy(() => import('./pages/chapters/chapter15/ValuePolicyConnectionPage'));

// Chapter 16 pages
const Chapter16FiniteHorizonMDPPage = lazy(() => import('./pages/chapters/chapter16/FiniteHorizonMDPPage'));
const Chapter16LQRPage = lazy(() => import('./pages/chapters/chapter16/LQRPage'));
const Chapter16NonlinearToLQRPage = lazy(() => import('./pages/chapters/chapter16/NonlinearToLQRPage'));
const Chapter16LQGPage = lazy(() => import('./pages/chapters/chapter16/LQGPage'));

// Chapter 17 pages
const Chapter17PolicyGradientPage = lazy(() => import('./pages/chapters/chapter17/PolicyGradientPage'));

function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={(
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500" role="status">
            正在加载课程内容…
          </div>
        )}
      >
        <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />

          {/* Chapter 1: linear regression deep-dive pages */}
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/cost-function" element={<CostFunctionPage />} />
          <Route path="/gradient-descent" element={<GradientDescentPage />} />
          <Route path="/normal-equation" element={<NormalEquationPage />} />
          <Route path="/probabilistic" element={<ProbabilisticPage />} />
          <Route path="/overfitting" element={<OverfittingPage />} />

          {/* Chapter 2 routes */}
          <Route path="/ch02/overview" element={<Chapter02OverviewPage />} />
          <Route path="/ch02/model" element={<Chapter02ModelPage />} />
          <Route path="/ch02/cost-function" element={<Chapter02CostFunctionPage />} />
          <Route path="/ch02/gradient-descent" element={<Chapter02GradientDescentPage />} />
          <Route path="/ch02/perceptron" element={<Chapter02PerceptronPage />} />
          <Route path="/ch02/multiclass" element={<Chapter02MulticlassPage />} />
          <Route path="/ch02/newton" element={<Chapter02NewtonPage />} />

          {/* Chapter 3 routes */}
          <Route path="/ch03/overview" element={<Chapter03OverviewPage />} />
          <Route path="/ch03/exponential-family" element={<Chapter03ExponentialFamilyPage />} />
          <Route path="/ch03/building-glm" element={<Chapter03BuildingGLMPage />} />
          <Route path="/ch03/ols-as-glm" element={<Chapter03OLSasGLMPage />} />
          <Route path="/ch03/logistic-as-glm" element={<Chapter03LogisticAsGLMPage />} />
          <Route path="/ch03/softmax-as-glm" element={<Chapter03SoftmaxAsGLMPage />} />
          <Route path="/ch03/summary" element={<Chapter03SummaryPage />} />

          {/* Chapter 4 routes */}
          <Route path="/ch04/overview" element={<Chapter04OverviewPage />} />
          <Route path="/ch04/generative-vs-discriminative" element={<Chapter04GenerativeVsDiscriminativePage />} />
          <Route path="/ch04/gaussian-discriminant-analysis" element={<Chapter04GaussianDiscriminantAnalysisPage />} />
          <Route path="/ch04/naive-bayes" element={<Chapter04NaiveBayesPage />} />

          {/* Chapter 5 routes */}
          <Route path="/ch05/overview" element={<Chapter05OverviewPage />} />
          <Route path="/ch05/feature-mapping" element={<Chapter05FeatureMappingPage />} />
          <Route path="/ch05/lms-in-feature-space" element={<Chapter05LMSInFeatureSpacePage />} />
          <Route path="/ch05/kernel-trick" element={<Chapter05KernelTrickPage />} />
          <Route path="/ch05/kernel-properties" element={<Chapter05KernelPropertiesPage />} />

          {/* Chapter 6 routes */}
          <Route path="/ch06/overview" element={<Chapter06OverviewPage />} />
          <Route path="/ch06/margin-intuition" element={<Chapter06MarginIntuitionPage />} />
          <Route path="/ch06/svm-theory" element={<Chapter06SVMTheoryPage />} />

          {/* Chapter 7 routes */}
          <Route path="/ch07/overview" element={<Chapter07OverviewPage />} />
          <Route path="/ch07/nonlinear-supervised-learning" element={<Chapter07NonlinearSupervisedLearningPage />} />
          <Route path="/ch07/neural-networks" element={<Chapter07NeuralNetworksPage />} />
          <Route path="/ch07/modern-nn-modules" element={<Chapter07ModernNNModulesPage />} />
          <Route path="/ch07/backpropagation" element={<Chapter07BackpropagationPage />} />
          <Route path="/ch07/vectorization" element={<Chapter07VectorizationPage />} />

          {/* Chapter 8 routes */}
          <Route path="/ch08/overview" element={<Chapter08OverviewPage />} />
          <Route path="/ch08/bias-variance" element={<Chapter08BiasVariancePage />} />
          <Route path="/ch08/double-descent" element={<Chapter08DoubleDescentPage />} />
          <Route path="/ch08/sample-complexity" element={<Chapter08SampleComplexityPage />} />

          {/* Chapter 9 routes */}
          <Route path="/ch09/overview" element={<Chapter09OverviewPage />} />
          <Route path="/ch09/regularization" element={<Chapter09RegularizationPage />} />
          <Route path="/ch09/implicit-regularization" element={<Chapter09ImplicitRegularizationPage />} />
          <Route path="/ch09/cross-validation" element={<Chapter09CrossValidationPage />} />
          <Route path="/ch09/bayesian-regularization" element={<Chapter09BayesianRegularizationPage />} />

          {/* Chapter 10 routes */}
          <Route path="/ch10/overview" element={<Chapter10OverviewPage />} />
          <Route path="/ch10/k-means" element={<Chapter10KMeansPage />} />

          {/* Chapter 11 routes */}
          <Route path="/ch11/overview" element={<Chapter11OverviewPage />} />
          <Route path="/ch11/gaussian-mixture-em" element={<Chapter11GaussianMixtureEMPage />} />
          <Route path="/ch11/jensen-inequality" element={<Chapter11JensenInequalityPage />} />
          <Route path="/ch11/general-em" element={<Chapter11GeneralEMPage />} />
          <Route path="/ch11/gmm-revisited" element={<Chapter11GMMRevisitedPage />} />
          <Route path="/ch11/variational-inference" element={<Chapter11VariationalInferencePage />} />

          {/* Chapter 12 routes */}
          <Route path="/ch12/overview" element={<Chapter12OverviewPage />} />
          <Route path="/ch12/pca" element={<Chapter12PCAPage />} />

          {/* Chapter 13 routes */}
          <Route path="/ch13/overview" element={<Chapter13OverviewPage />} />
          <Route path="/ch13/ica" element={<Chapter13ICAPage />} />

          {/* Chapter 14 routes */}
          <Route path="/ch14/overview" element={<Chapter14OverviewPage />} />
          <Route path="/ch14/pretraining-adaptation" element={<Chapter14PretrainingAdaptationPage />} />
          <Route path="/ch14/computer-vision-pretraining" element={<Chapter14ComputerVisionPretrainingPage />} />
          <Route path="/ch14/large-language-models" element={<Chapter14LargeLanguageModelsPage />} />

          {/* Chapter 15 routes */}
          <Route path="/ch15/overview" element={<Chapter15OverviewPage />} />
          <Route path="/ch15/mdp" element={<Chapter15MDPPage />} />
          <Route path="/ch15/value-policy-iteration" element={<Chapter15ValuePolicyIterationPage />} />
          <Route path="/ch15/learning-mdp" element={<Chapter15LearningMDPPage />} />
          <Route path="/ch15/continuous-state-mdp" element={<Chapter15ContinuousStateMDPPage />} />
          <Route path="/ch15/value-policy-connection" element={<Chapter15ValuePolicyConnectionPage />} />

          {/* Chapter 16 routes */}
          <Route path="/ch16/finite-horizon-mdp" element={<Chapter16FiniteHorizonMDPPage />} />
          <Route path="/ch16/lqr" element={<Chapter16LQRPage />} />
          <Route path="/ch16/nonlinear-to-lqr" element={<Chapter16NonlinearToLQRPage />} />
          <Route path="/ch16/lqg" element={<Chapter16LQGPage />} />

          {/* Chapter 17 routes */}
          <Route path="/ch17/policy-gradient" element={<Chapter17PolicyGradientPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
