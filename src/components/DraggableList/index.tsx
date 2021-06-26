import {
 arrayMove, rectSortingStrategy, SortingStrategy, SortableContext, useSortable,
} from '@dnd-kit/sortable';
   import {
    closestCenter, useSensor, useSensors, DndContext, DragEndEvent, MouseSensor, TouchSensor,
   } from '@dnd-kit/core';
import { SetStateAction } from 'react';
import { CSS } from '@dnd-kit/utilities';

export type SortableItemProps = Omit<DraggableItem, 'id'> & {
    id: string;
    element: React.ElementType;
  };

  export const SortableItem = ({
    code,
    isDraggable = true,
    element: Element,
    ...props
  }: SortableItemProps) => {
    const {
 attributes, listeners, setNodeRef, transform, transition,
} = useSortable({ id: String(code) });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    return isDraggable ? (
      <Element
        isDraggable
        selected={!!props.name}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        {...props}
      />
    ) : (
      <Element {...props} />
    );
  };

export type DraggableItem = {
    id?: string;
    name: string;
    priority: number;
    code: number;
    isDraggable?: boolean;
    selected?: boolean;
  };

export type DraggableListProps = {
    items: DraggableItem[];
    setItems: (items: SetStateAction<DraggableItem[]>) => void;
    element: React.ElementType;
    strategy?: SortingStrategy;
    handleSwapItems: (from: number, to: number) => void;
  };

  export const DraggableList = ({
    items,
    setItems,
    element,
    strategy = rectSortingStrategy,
    handleSwapItems,
  }: DraggableListProps) => {
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const itemsWithId = items.map((i) => ({ ...i, id: String(i.code) }));

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      const activeItem = active.id;
      const overItem = over?.id;

      if (activeItem === overItem) return;

      const newIndexByCode = items.find(
        ({ code }) => String(code) === overItem,
      );
      const oldIndexByCode = items.find(
        ({ code }) => String(code) === activeItem,
      );

      const oldIndex = items.indexOf(oldIndexByCode!);
      const newIndex = items.indexOf(newIndexByCode!);

      setItems((prevState) => {
        const itemsResult = arrayMove(prevState, oldIndex, newIndex);
        const itemsWithNewPriority = itemsResult.map((item, index) => ({
          ...item,
          priority: index,
        }));

        return itemsWithNewPriority;
      });

      handleSwapItems(oldIndex, newIndex);
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemsWithId} strategy={strategy}>
          {itemsWithId.map((item) => (
            <SortableItem key={item.id} element={element} {...item} />
          ))}
        </SortableContext>
      </DndContext>
    );
  };
