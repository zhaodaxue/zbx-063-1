import { create } from 'zustand';
import type { IngredientNode } from '@/data/ingredients';
import { rootIngredients, ROOT_LABEL } from '@/data/ingredients';

interface PathNode {
  id: string;
  name: string;
  node?: IngredientNode;
}

interface DrillState {
  path: PathNode[];
  currentLevel: IngredientNode[];
  currentParentName: string;
  drillDown: (node: IngredientNode) => void;
  drillUp: () => void;
  goToLevel: (index: number) => void;
  canDrillDown: (node: IngredientNode) => boolean;
  isAtRoot: () => boolean;
}

const rootPathNode: PathNode = { id: 'root', name: ROOT_LABEL };

export const useDrillStore = create<DrillState>((set, get) => ({
  path: [rootPathNode],
  currentLevel: rootIngredients,
  currentParentName: ROOT_LABEL,

  drillDown: (node: IngredientNode) => {
    if (!node.children || node.children.length === 0) return;
    set((state) => ({
      path: [...state.path, { id: node.id, name: node.name, node }],
      currentLevel: node.children!,
      currentParentName: node.name,
    }));
  },

  drillUp: () => {
    const state = get();
    if (state.path.length <= 1) return;
    const newPath = state.path.slice(0, -1);
    const lastNode = newPath[newPath.length - 1];
    set({
      path: newPath,
      currentLevel: lastNode.node?.children ?? rootIngredients,
      currentParentName: lastNode.name,
    });
  },

  goToLevel: (index: number) => {
    const state = get();
    if (index < 0 || index >= state.path.length) return;
    const newPath = state.path.slice(0, index + 1);
    const targetNode = newPath[newPath.length - 1];
    set({
      path: newPath,
      currentLevel: targetNode.node?.children ?? rootIngredients,
      currentParentName: targetNode.name,
    });
  },

  canDrillDown: (node: IngredientNode) => {
    return !!node.children && node.children.length > 0;
  },

  isAtRoot: () => {
    return get().path.length <= 1;
  },
}));
