import { create } from 'zustand';
import type { IngredientNode } from '@/data/ingredients';
import { rootIngredients, ROOT_LABEL } from '@/data/ingredients';

export interface PathNode {
  id: string;
  name: string;
  node?: IngredientNode;
}

export type TransitionPhase = 'idle' | 'exiting' | 'entering';

interface ViewState {
  path: PathNode[];
  targetLevel: IngredientNode[];
  targetParentName: string;
  displayLevel: IngredientNode[];
  displayParentName: string;
  phase: TransitionPhase;
  compareMode: boolean;
  setCompareMode: (enabled: boolean) => void;
  drillDown: (node: IngredientNode) => void;
  drillUp: () => void;
  goToLevel: (index: number) => void;
  canDrillDown: (node: IngredientNode) => boolean;
  isAtRoot: () => boolean;
  isLocked: () => boolean;
  commitTransition: () => void;
}

const TRANSITION_DURATION = 300;
const EXIT_PHASE_MS = 150;

const rootPathNode: PathNode = { id: 'root', name: ROOT_LABEL };

function resolveLevel(path: PathNode[]): IngredientNode[] {
  const last = path[path.length - 1];
  return last.node?.children ?? rootIngredients;
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;
let commitTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }
  if (commitTimer) { clearTimeout(commitTimer); commitTimer = null; }
}

export const useViewStore = create<ViewState>((set, get) => ({
  path: [rootPathNode],
  targetLevel: rootIngredients,
  targetParentName: ROOT_LABEL,
  displayLevel: rootIngredients,
  displayParentName: ROOT_LABEL,
  phase: 'idle',
  compareMode: false,
  setCompareMode: (enabled: boolean) => set({ compareMode: enabled }),

  isAtRoot: () => get().path.length <= 1,
  canDrillDown: (node: IngredientNode) => !!node.children && node.children.length > 0,
  isLocked: () => get().phase !== 'idle',

  commitTransition: () => {
    const { targetLevel, targetParentName } = get();
    set({
      displayLevel: targetLevel,
      displayParentName: targetParentName,
      phase: 'entering',
    });
    transitionTimer = setTimeout(() => {
      set({ phase: 'idle' });
      transitionTimer = null;
    }, TRANSITION_DURATION - EXIT_PHASE_MS);
  },

  drillDown: (node: IngredientNode) => {
    const state = get();
    if (state.phase !== 'idle') return;
    if (!state.canDrillDown(node)) return;

    clearTimers();
    const newPath = [...state.path, { id: node.id, name: node.name, node }];

    set({
      phase: 'exiting',
      path: newPath,
      targetLevel: node.children!,
      targetParentName: node.name,
    });

    commitTimer = setTimeout(() => {
      get().commitTransition();
      commitTimer = null;
    }, EXIT_PHASE_MS);
  },

  drillUp: () => {
    const state = get();
    if (state.phase !== 'idle') return;
    if (state.path.length <= 1) return;

    clearTimers();
    const newPath = state.path.slice(0, -1);
    const lastNode = newPath[newPath.length - 1];

    set({
      phase: 'exiting',
      path: newPath,
      targetLevel: resolveLevel(newPath),
      targetParentName: lastNode.name,
    });

    commitTimer = setTimeout(() => {
      get().commitTransition();
      commitTimer = null;
    }, EXIT_PHASE_MS);
  },

  goToLevel: (index: number) => {
    const state = get();
    if (state.phase !== 'idle') return;
    if (index < 0 || index >= state.path.length) return;
    if (index === state.path.length - 1) return;

    clearTimers();
    const newPath = state.path.slice(0, index + 1);
    const targetNode = newPath[newPath.length - 1];

    set({
      phase: 'exiting',
      path: newPath,
      targetLevel: resolveLevel(newPath),
      targetParentName: targetNode.name,
    });

    commitTimer = setTimeout(() => {
      get().commitTransition();
      commitTimer = null;
    }, EXIT_PHASE_MS);
  },
}));
