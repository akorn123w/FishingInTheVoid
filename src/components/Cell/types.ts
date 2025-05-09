import type { Cell as CellType } from '@/types/game';

export interface CellProps extends Omit<CellType, 'id'> { }