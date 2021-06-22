import { forwardRef, HTMLAttributes } from 'react';
import { Character } from '../../pages';

type CharItemProps = Omit<Character, 'id'> & HTMLAttributes<HTMLDivElement>;

export const CharItem = forwardRef<HTMLDivElement, CharItemProps>(({
  image, style, name, ...props
}, ref) => (
  <div
    className="flex items-center p-2  bg-indigo-600  rounded-lg w-72"
    style={style}
    ref={ref}
    {...props}
  >
    <img
      className="rounded-full w-16 mr-4"
      src={image}
      alt="char"
    />
    <span className="text-gray-100">{name}</span>
  </div>
));
