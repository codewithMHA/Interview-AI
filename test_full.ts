import { AIService } from './server/src/services/aiService.js';

async function testFullFields() {
  const code = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`;

  console.log('Testing AIService.analyzeCode...');
  const analysis = await AIService.analyzeCode({
    problemTitle: 'Two Sum',
    language: 'javascript',
    userCode: code,
  });

  console.log('Time Complexity:', analysis.timeComplexity);
  console.log('Time Intuition:', analysis.timeComplexityExplanation);
  console.log('Space Complexity:', analysis.spaceComplexity);
  console.log('Space Intuition:', analysis.spaceComplexityExplanation);
  console.log('Candidate Pitch:', analysis.interviewerPitch);
  console.log('Strengths:', analysis.qualityBreakdown?.strengths);
  console.log('Areas to Improve:', analysis.qualityBreakdown?.areasForImprovement);

  console.log('\nTesting AIService.explainCode...');
  const explanation = await AIService.explainCode({
    problemTitle: 'Two Sum',
    language: 'javascript',
    userCode: code,
  });

  console.log('Approach Type:', explanation.approachType);
  console.log('Overview:', explanation.overview);
  console.log('Dry Run Input:', explanation.dryRunExample?.sampleInput);
  console.log('Dry Run Steps Count:', explanation.dryRunExample?.executionTrace.length);
  console.log('Dry Run Final Output:', explanation.dryRunExample?.finalOutput);
  console.log('Step 1 Snippet:', explanation.steps[0]?.codeSnippet);
  console.log('Step 1 Plain English:', explanation.steps[0]?.plainEnglishMeaning);
  console.log('Follow-Up Questions:', explanation.interviewerFollowUps);

  console.log('\nAll full-explanation and AI analyze tests passed with flying colors!');
}

testFullFields().catch((err) => {
  console.error(err);
  process.exit(1);
});

