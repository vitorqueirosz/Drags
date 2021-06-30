import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { api } from 'services/api';
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
import { Character } from 'components/Character';
import { CharItem, CharacterList } from 'components';
import { CHARACTER } from 'constants/endpoints';
import { useDebounce } from 'hooks';
import { prisma } from 'services/prisma';
import { useCreateFavorites } from 'useCases/favorites';
import { getSession, useSession } from 'next-auth/client';

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
  charId: string;
  priority: number;
}

type CharactersProps = {
  characters: Character[];
  favorites: Character[];
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

const Characters = ({ characters, favorites }: CharactersProps) => {
  const handleCreateFavorites = useCreateFavorites();
  const [session] = useSession();
  const [searchedName, setSearchedName] = useState('');
  const [activeItem, setActiveItem] = useState<Character>({} as Character);
  const [items, setItems] = useState<CharItems>({
    A: [...characters.slice(0, 10)],
    B: [...favorites],
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
            B: [],
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

  const handleNewPriority = <T extends Record<string, unknown>>(items: T[]): T[] => {
    return items.map((item, index) => ({ ...item, priority: index }));
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
      const activeIndexById = items[activeContainer].find(
        ({ id }) => String(id) === String(active.id));
      const overIndexById = items[overContainer].find(
        ({ id }) => String(id) === String(over?.id));

      const activeIndex = items[activeContainer].indexOf(activeIndexById!);
      const overIndex = items[activeContainer].indexOf(overIndexById!);

      if (activeIndex !== overIndex) {
        const sortableItems = arrayMove(
          items[overContainer],
          activeIndex,
          overIndex,
        );

        if (overContainer === 'B') {
          const itemsWithNewPriority = handleNewPriority(sortableItems);
          handleCreateFavorites({
            characters: itemsWithNewPriority,
            email: String(session?.user?.email),
          });
        }

        setItems((items) => ({
          ...items,
          [overContainer]: sortableItems,
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

        const itemsWithNewPriority = handleNewPriority(keysWithValues.B);

        handleCreateFavorites({
          characters: itemsWithNewPriority,
          email: String(session?.user?.email),
        });

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

        const sortableResult = {
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

        const itemsWithNewPriority = handleNewPriority(sortableResult.B);

        handleCreateFavorites({
          characters: itemsWithNewPriority,
          email: String(session?.user?.email),
        });

        return {
          ...items,
          ...sortableResult,
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) return { props: { characters: [] } };

  const user = await prisma.user.findUnique({ where: { email: String(session.user.email) } });
  const favorites = await prisma.favorites.findMany({
    where: {
      userId: user?.id,
    },
    include: {
      char: true,
    },
  });

  const sortableFavorites = favorites
  .sort((prevFav, nextFav) => prevFav.priority - nextFav.priority)
  .map((fav) => fav.char);

  const page = Math.floor(Math.random() * 25);
  const { data } = await api.get(CHARACTER.BY_PAGE(page));

  const items = data.results.map((item: Character) => ({ ...item, id: String(item.id) }));

  return {
    props: {
      characters: items,
      favorites: sortableFavorites,
    },
  };
};

export default Characters;
