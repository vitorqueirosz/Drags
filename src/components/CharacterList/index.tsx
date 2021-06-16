type CharacterListProps = {
  children: React.ReactNode;
  title: string;
}

export const CharacterList = ({ children, title }: CharacterListProps) => (
  <div
    className="flex flex-col max-h-xvh overflow-y-auto pb-4 w-80 rounded-lg items-center justify-items-center bg-pink-100 gap-2"
  >
    <h3
      className="w-full text-xl p-2 mb-2 bg-indigo-500 text-gray-100 rounded-tl-lg rounded-tr-lg"
    >
      {title}
    </h3>
    {children}
  </div>
);
