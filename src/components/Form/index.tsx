import { InterestsFormModel, InterestType } from 'pages/test';
import {
  DeepMap,
  FieldError,
  UseFieldArrayMethods,
  UseFormMethods,
} from 'react-hook-form';

type FormMethods = Pick<UseFormMethods, 'register'> &
  Pick<UseFieldArrayMethods, 'remove' | 'fields'>;

type FormProps = FormMethods & {
  interests: InterestType[];
};

const MAX_INTEREST_LENGTH = 25;

export const Form = ({
  fields,
  register,
}: FormProps) => (
  <div>
    {fields.map((field, index) => (
      <div key={field.id}>
        <input
          ref={register()}
          name={`interests[${index}].name`}
          placeholder="Nome do interesse"
          autoComplete="off"
          defaultValue={field.name}
          maxLength={MAX_INTEREST_LENGTH}
        />
      </div>
      ))}
  </div>
  );
