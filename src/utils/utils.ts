export const calculateHandlePosition = (
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  radius: number
) => {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const handleX = (dx / dist) * radius;
  const handleY = (dy / dist) * radius;
  return { x: handleX, y: handleY };
};

export const getRestoredPosition = (
  node: any,
  fallback: { x: number; y: number }
): { x: number; y: number } => {
  return node.positionX !== undefined &&
    node.positionX !== null &&
    node.positionX !== -1 &&
    node.positionY !== undefined &&
    node.positionY !== null &&
    node.positionY !== -1
    ? { x: node.positionX, y: node.positionY }
    : fallback;
};
