import axios, { AxiosResponse } from "axios";
import {
  ClassConstructor,
  classToPlain,
  plainToClass,
} from "class-transformer";
import { useState } from "react";
import { FormException } from "../exceptions";
import { validateDto } from "../helpers";

type FormixProps<V, E> = {
  initialValues: V;
  initialErrors: E;
};

export function useFormix<V, E>(props: FormixProps<V, E>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [values, setValues] = useState<V>(props.initialValues);
  const [errors, setErrors] = useState<E>(props.initialErrors);
  const [isCompleted, setIsCompleted] = useState(false);

  const onChange = (key: string, value: unknown) => {
    setValues({ ...values, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  async function processForm<R>(_props: {
    dtoClass: ClassConstructor<unknown>;
    apiCall: (v: unknown) => Promise<AxiosResponse<R>>;
    preCall?: (v: V) => V;
  }): Promise<R> {
    setIsLoading(true);
    setErrors(props.initialErrors);

    const dto = plainToClass(
      _props.dtoClass,
      _props.preCall ? _props.preCall(values) : values
    );

    const dtoErrors = await validateDto(dto);

    if (dtoErrors) {
      setIsLoading(false);
      throw new FormException<E>({ ...errors, ...dtoErrors });
    }

    let res: AxiosResponse<R>;

    try {
      res = await _props.apiCall(classToPlain(dto));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.data.validations) {
          throw new FormException(e.response.data.validations);
        }

        if (e.response?.data.message) {
          throw new Error(e.response.data.message);
        }
      }

      throw e;
    } finally {
      setIsLoading(false);
    }

    return res.data;
  }

  const setErrorById = (key: keyof E, value: string) => {
    setErrors({ ...errors, [key]: value });
  };

  return {
    isLoading,
    setIsLoading,
    values,
    setValues,
    errors,
    setErrors,
    onChange,
    processForm,
    setErrorById,
    isCompleted,
    setIsCompleted,
  };
}
