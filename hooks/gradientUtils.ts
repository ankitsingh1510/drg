export function getRandomGradient() {
  const gradients = [
    ['#3B82F6', '#06B6D4'],
    ['#EC4899', '#F87171'],
    ['#10B981', '#3B82F6'],
    ['#F59E0B', '#EF4444'],
    ['#8B5CF6', '#6366F1'],
    ['#14B8A6', '#0EA5E9'],
    ['#F472B6', '#C084FC'],
    ['#4ADE80', '#86EFAC'],
    ['#38BDF8', '#818CF8'],
  ];

  const randomIndex = Math.floor(Math.random() * gradients.length);
  const selected = gradients[randomIndex];

  const start = { x: Math.random(), y: Math.random() };
  const end = { x: Math.random(), y: Math.random() };

  return { colors: selected, start, end };
}
