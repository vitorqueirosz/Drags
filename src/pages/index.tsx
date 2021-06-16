import { GetServerSideProps } from 'next';
import { api } from 'services/api';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { Character } from 'components/Character';
import { CharItem, CharacterList } from 'components';
import { CHARACTER } from 'constants/endpoints';

import { useDebounce } from 'hooks';

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
  characters: {
    results: Character[];
  }
}

const Characters = ({ characters }: CharactersProps) => {
  const [searchedName, setSearchedName] = useState('');
  const [activeItem, setActiveItem] = useState<number | null>(0);
  const [items, setItems] = useState(characters.results);

  const chars = useMemo(() => items.map((char) => ({
    ...char,
    id: String(char.id),
  })), [items]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    if (searchedName) {
      const getCharsByName = async () => {
        try {
          const { data } = await api.get<{ results: Character[] }>(CHARACTER.BY_NAME(searchedName));
          setItems(data.results);
        } catch (error) {
          setItems([]);
        }
      };
      getCharsByName();
    }
  }, [searchedName]);

  const handleSearchByName = useDebounce((value: string) => setSearchedName(value), 250);

  const handleDragStart = (event: DragStartEvent) => {
    const oldIndexById = items.find((i) => String(i.id) === event.active.id);
    setActiveItem(items.indexOf(oldIndexById!));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const parsedActive = active.id;
    const parsedOver = over?.id;

    if (parsedActive === parsedOver) return;

    setItems((items) => {
      const newIndexById = items.find(({ id }) => String(id) === parsedOver);
      const oldIndexById = items.find(({ id }) => String(id) === parsedActive);

      const oldIndex = items.indexOf(oldIndexById!);
      const newIndex = items.indexOf(newIndexById!);

      return arrayMove(items, oldIndex, newIndex);
    });
    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveItem(null);
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
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={chars} strategy={rectSortingStrategy}>
              <CharacterList title="Personagens">
                {chars.map((char, index) => (
                  <Character
                    {...char}
                    key={char.id}
                    index={index}
                  />
                ))}
              </CharacterList>
              <CharacterList title="Favoritos">
                {[]}
              </CharacterList>
            </SortableContext>
            <DragOverlay adjustScale>
              {activeItem && (
                <CharItem
                  {...items[activeItem]}
                  index={items.indexOf(items[activeItem])}
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
  const page = Math.floor(Math.random() * 25);
  const { data } = await api.get(CHARACTER.BY_PAGE(page));

  return {
    props: {
      characters: data,
    },
  };
};

export default Characters;
