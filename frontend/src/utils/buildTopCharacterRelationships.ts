const buildTopCharacterRelationships = (networkData: { nodes: any[], edges: any[] }) => {
    const relationships: Record<string, Record<string, number>> = {};
  
    networkData.edges.forEach(edge => {
      const sourceNode = networkData.nodes.find(node => node.id === edge.source);
      const targetNode = networkData.nodes.find(node => node.id === edge.target);
  
      if (sourceNode && targetNode) {
        const sourceName = sourceNode.label.toLowerCase();
        const targetName = targetNode.label.toLowerCase();
  
        if (!relationships[sourceName]) {
          relationships[sourceName] = {};
        }
        if (!relationships[targetName]) {
          relationships[targetName] = {};
        }
  
        relationships[sourceName][targetName] = (relationships[sourceName][targetName] || 0) + 1;
        relationships[targetName][sourceName] = (relationships[targetName][sourceName] || 0) + 1;
      }
    });
  
    const topRelationships: Record<string, [string, number][]> = {};
  
    Object.keys(relationships).forEach(character => {
      const sortedRelationships = Object.entries(relationships[character])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
  
      topRelationships[character] = sortedRelationships as [string, number][];
    });
  
    return topRelationships;
  };
  
export default buildTopCharacterRelationships;