export interface IngredientNode {
  id: string;
  name: string;
  weight: number;
  standardWeight: number;
  color: string;
  children?: IngredientNode[];
}

export const rootIngredients: IngredientNode[] = [
  {
    id: 'bean',
    name: '豆',
    weight: 60,
    standardWeight: 50,
    color: '#D4A853',
    children: [
      { id: 'soybean', name: '黄豆', weight: 45, standardWeight: 38, color: '#F0D070' },
      { id: 'black-bean', name: '黑豆', weight: 15, standardWeight: 12, color: '#5C4033' },
    ],
  },
  {
    id: 'bran',
    name: '麸',
    weight: 20,
    standardWeight: 22,
    color: '#E8D9A0',
  },
  {
    id: 'salt',
    name: '盐',
    weight: 5,
    standardWeight: 4,
    color: '#C8D5D9',
  },
  {
    id: 'water',
    name: '水',
    weight: 100,
    standardWeight: 104,
    color: '#7CB3D4',
  },
];

export const ROOT_LABEL = '总投料';
