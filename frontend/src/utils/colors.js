/* Pseudo-random dot color based on string */
export function siteColor(str) {
  if (!str) return '#ccc';
  const colors = ['#f5d94e', '#e57373', '#81c784', '#64b5f6', '#ffb74d', '#ba68c8'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
