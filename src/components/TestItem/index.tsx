import { forwardRef, HTMLAttributes } from 'react';

export type InterestProps = {
  name: string;
} & HTMLAttributes<HTMLDivElement>;

export const TestItem = forwardRef<HTMLDivElement, InterestProps>(
  ({
 name, ...props
}, ref) => (
  <div className="bg-indigo-600" ref={ref} {...props}>
    <div>
      <span>{name}</span>
    </div>
  </div>
  ),
);
