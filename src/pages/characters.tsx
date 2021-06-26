import { GetServerSideProps } from 'next';
import { api } from 'services/api';
import { useSession } from 'next-auth/client';
import {
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
} from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { Character } from 'components/Character';
import { CharItem, CharacterList } from 'components';
import { CHARACTER } from 'constants/endpoints';
import { useDebounce } from 'hooks';
import { prisma } from 'services/prisma';

export type Character = {
  index: number;
  id: string;
  name: string;
  image: string;
  gender: string;
  species: string;
  status: 'Dead' | 'Alive';
  location: {
    name: string;
  }
  origin: {
    name: string;
  }
  episode: [];
}

type CharactersProps = {
  characters: Character[];
}

type CharItems = Record<string, Character[]>;

type Chars = {
  characters: Character[];
  title: 'Personagens' | 'Favoritos'
}

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const Characters = ({ characters }: CharactersProps) => {
  const [searchedName, setSearchedName] = useState('');
  const [activeItem, setActiveItem] = useState<Character>({} as Character);
  const [items, setItems] = useState<CharItems>({
    A: [...characters.slice(0, 10)],
    B: [],
  });

  const chars: Chars[] = useMemo(() => Object.entries(items).map(([key, value]) => ({
    characters: [...value],
    title: key === 'A' ? 'Personagens' : 'Favoritos',
  })), [items]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    if (searchedName) {
      const getCharsByName = async () => {
        try {
          const { data } = await api.get<{ results: Character[] }>(CHARACTER.BY_NAME(searchedName));

          const items = data.results.map((item) => ({
            ...item,
            id: String(item.id),
          }));

          setItems((prevState) => ({
            ...prevState,
            A: items,
          }));
        } catch (error) {
          setItems({
            A: [],
          });
        }
      };
      getCharsByName();
    }
  }, [searchedName]);

  const handleSearchByName = useDebounce((value: string) => setSearchedName(value), 250);

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].find((i) => i.id === id));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeContainer = findContainer(active.id);

    if (!activeContainer) return;

    const activeItem = items[activeContainer].find(({ id }) => String(id) === active.id);
    setActiveItem(activeItem!);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findContainer(active.id);
    const overId = over?.id;
    const overContainer = findContainer(overId!);

    if (activeContainer && overContainer) {
      const activeIndexById = items[activeContainer].find(({ id }) => String(id) === active.id);
      const overIndexById = items[overContainer].find(({ id }) => String(id) === over?.id);

      const activeIndex = items[activeContainer].indexOf(activeIndexById!);
      const overIndex = items[activeContainer].indexOf(overIndexById!);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex,
          ),
        }));
      }
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;
    const activeContainer = findContainer(active.id);

    if (!overId) {
      const overContainer = Object.keys(items).find((key) => key !== activeContainer);
      if (!overContainer || !activeContainer) return;

      return setItems((prevState) => {
        const activeItems = prevState[activeContainer];
        const item = activeItems.find(({ id }) => id === active.id);

        const itemsWithKeys = {
          [activeContainer]: [
            ...activeItems.filter(({ id }) => id !== active.id),
          ],
          [overContainer]: [
            ...prevState[overContainer],
            item!,
          ],
        };

        const keysWithValues = {
          A: itemsWithKeys.A,
          B: itemsWithKeys.B,
        };

        return {
          ...keysWithValues,
        };
      });
    }

    const overContainer = findContainer(overId);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];

        const activeIndexById = items[activeContainer]
          .find(({ id }) => String(id) === active.id);
        const overIndexById = items[overContainer]
          .find(({ id }) => String(id) === overId);

        const overIndex = overItems.indexOf(overIndexById!);
        const activeIndex = activeItems.indexOf(activeIndexById!);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowLastItem = over
            && overIndex === overItems.length - 1
            && active.rect.current.translated
            && active.rect.current.translated.offsetTop
              > over.rect.offsetTop + over.rect.height;

          const modifier = isBelowLastItem ? 1 : 0;

          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...items,
          [activeContainer]: [
            ...activeItems.filter(({ id }) => id !== active.id),
          ],
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            activeItems[activeIndex],
            ...overItems.slice(
              newIndex,
              overItems.length + 1,
            ),
          ],
        };
      });
    }
  };

  const handleDragCancel = () => {
    setActiveItem({} as Character);
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full justify-center items-center bg-indigo-800"
    >
      <div>
        <input
          className="w-80 mb-8 p-3 rounded-md items-start self-start outline-none"
          placeholder="Pesquise um personagem"
          onChange={({ target: { value } }) => handleSearchByName(value)}
        />

        <div className="flex gap-8">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onDragOver={handleDragOver}
          >
            {chars.map(({ characters, title }) => (
              <SortableContext key={title} items={characters}>
                <CharacterList id={title} title={title}>
                  {characters.map((char, index) => (
                    <Character
                      {...char}
                      key={char.id}
                      index={index}
                    />
                  ))}
                </CharacterList>
              </SortableContext>
            ))}
            <DragOverlay dropAnimation={dropAnimation}>
              {activeItem && (
                <CharItem
                  {...activeItem}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const chars = await prisma.favorites.findMany({
    where: {
      userId: 0,
    },
  });

  if (chars.length) {
    return {
      props: {
        characters: chars,
      },
    };
  }

  const page = Math.floor(Math.random() * 25);
  const { data } = await api.get(CHARACTER.BY_PAGE(page));

  const items = data.results.map((item: Character) => ({ ...item, id: String(item.id) }));

  return {
    props: {
      characters: items,
    },
  };
};

export default Characters;
