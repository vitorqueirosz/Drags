import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties } from 'react';
// import { Character as CharProps } from '../../pages';
import { CharItem } from '../CharItem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Character = ({ id, ...props }: any) => {
  const sortable = useSortable({ id });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties;

  return (
    <CharItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
};
