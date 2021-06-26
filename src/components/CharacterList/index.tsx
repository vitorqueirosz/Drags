type CharacterListProps = {
  children: React.ReactNode;
  title?: string;
  id: string;
  isDroppable?: boolean;
}

export const CharacterList = ({
  children, title,
}: CharacterListProps) => (
  <div
    className="flex flex-col max-h-xvh h-auto w-80 rounded-lg items-center justify-items-center bg-pink-100"
  >
    <h3
      className="w-full text-xl p-2 mb-2 bg-pink-500 text-gray-100 rounded-tl-lg rounded-tr-lg"
    >
      {title}
    </h3>
    <div className="flex flex-col w-full pl-2 pb-4 overflow-y-auto gap-2 h-full scrollbar scrollbar-thin  scrollbar-thumb-pink-400 scrollbar-track-pink-300  hover:scrollbar-thumb-pink-600">
      {children}
    </div>
  </div>
);
