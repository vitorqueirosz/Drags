import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Preview } from 'components/Preview';
import { Form } from 'components/Form';

export type InterestType = {
  id?: string;
  name: string;
  priority: number;
  code: number;
  fieldId?: string;
};

export type InterestsFormModel = {
  interests: InterestType[];
};

export type InterestError = {
  message: string;
};

export const defaultValues = {
    interests: [{ name: '', priority: 0, code: 0 }],
  };

const Interest = () => {
  const {
 register, control, reset, watch, handleSubmit,
} = useForm<InterestsFormModel>({
      defaultValues,
    });
  const {
 fields, swap, remove, append,
} = useFieldArray<InterestType>({
    name: 'interests',
    control,
  });

  const interests = useMemo(() => {
    const interestsFields = watch('interests');

    const interestsWithProps = interestsFields.reduce(
      (items: InterestType[], item, index) => {
        const interest = { ...fields[index] };

        const interestWithProps = {
          ...fields[index],
          id: interest.fieldId,
          name: item.name,
          priority: index,
          code: index,
        };
        items.push(interestWithProps);

        return items;
      },
      [],
    );

    return interestsWithProps;
  }, [watch, fields]);

  const handleAppendItems = () => {
    append({
      name: '',
      priority: fields.length,
      code: fields.length,
    });
  };

  const handleSwapItems = (from: number, to: number) => {
    swap(from, to);
  };

  return (
    <div className="w-full flex justify-center">
      <aside>
        <div>
          <h3>
            teste
          </h3>
          <Form
            register={register}
            remove={remove}
            fields={fields}
            interests={interests}
          />
          {fields.length < 15 && (
            <button type="button" onClick={handleAppendItems}>ADD</button>
          )}
        </div>
      </aside>
      <Preview
        interests={interests}
        handleSwapItems={handleSwapItems}
      />
    </div>
  );
};

export default Interest;
