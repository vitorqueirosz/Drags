import { useState, useEffect } from 'react';
import { InterestType } from 'pages/test';
import { DraggableList } from 'components/DraggableList';
import { TestItem } from 'components/TestItem';

type PreviewInterestsProps = {
  interests: InterestType[];
  handleSwapItems: (from: number, to: number) => void;
};

export const Preview = ({
  interests,
  handleSwapItems,
}: PreviewInterestsProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [interestList, setInterestList] = useState<any[]>([]);

  useEffect(() => {
    const currentArrayLength = interests.length;

    if (currentArrayLength < 15) {
      const arrayDiffLength = 15 - currentArrayLength;
      const currentArray = [...interests];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previewItems = Array.from<unknown, any>(
        { length: arrayDiffLength },
        (_, index) => ({
          id: String(index),
          name: 'test1',
          priority: currentArrayLength + index,
          code: currentArrayLength + index,
          isDraggable: false,
        }),
      );

      const result = [...currentArray, ...previewItems];
      return setInterestList(result);
    }

    setInterestList(interests);
  }, [interests]);

  return (
    <div>
      <p>
        preview1
      </p>
      <div className="grid grid-cols-3 gap-4 bg-indigo-800 h-screen w-80">
        <DraggableList
          items={interestList}
          setItems={setInterestList}
          element={TestItem}
          handleSwapItems={handleSwapItems}
        />
      </div>
    </div>
  );
};
