import React from "react";
import {
  Button,
  Select,
  SelectItem,
  DatePicker,
  Spacer,
  Checkbox,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, z } from "zod";
import { DateValue } from "@internationalized/date";
import { useHookFormMask, useInputMask } from "use-mask-input";

import { BgCard } from "@/components/bg-card";
import DefaultLayout from "@/layouts/default";

export default function CadastroPage() {
  type FormData = {
    pac_name: string;
    pac_sex: "Masculino" | "Feminino" | "Não Binário";
    pac_whatsapp: string;
    pac_cpf: string;
    pac_birth_date: string;
    pac_email?: string;
    pac_addrs_street_name: string;
    pac_addrs_num: string;
    pac_addrs_city: string;
    pac_addrs_uf: string;
    pac_addrs_zip: string;
    pac_addrs_has_comp: boolean;
    pac_addrs_comp?: string;
    pac_has_resp: boolean;
    pac_resp_name?: string;
    pac_resp_email?: string;
    pac_resp_whatsapp?: string;
    pac_resp_education?: string;
    pac_resp_occupation?: string;
  };

  const schema: ZodType<FormData> = z
    .object({
      pac_name: z.string().min(3, { message: "Nome é obrigatório" }),
      pac_sex: z.enum(["Masculino", "Feminino", "Não Binário"], {
        message: "Sexo é obrigatório",
      }),
      pac_whatsapp: z.string().min(11, { message: "Campo obrigatório" }),
      pac_cpf: z.string().min(11, { message: "CPF inválido" }),
      pac_birth_date: z.string().refine((value) => !isNaN(Date.parse(value)), {
        message: "Data de nascimento inválida",
      }),
      pac_email: z.string().email({ message: "Email inválido" }).optional(),
      pac_addrs_street_name: z
        .string()
        .min(1, { message: "Endereço é obrigatório" }),
      pac_addrs_num: z.string().min(1, { message: "Número é obrigatório" }),
      pac_addrs_city: z.string().min(1, { message: "Cidade é obrigatória" }),
      pac_addrs_uf: z.string().min(1, { message: "Estado é obrigatório" }),
      pac_addrs_zip: z.string().min(8, { message: "CEP inválido" }),
      pac_addrs_has_comp: z.boolean(),
      pac_addrs_comp: z.string().optional(),
      pac_has_resp: z.boolean(),
      pac_resp_name: z.string().optional(),
      pac_resp_email: z.string().optional(),
      pac_resp_whatsapp: z.string().optional(),
      pac_resp_education: z.string().optional(),
      pac_resp_occupation: z.string().optional(),
    })
    .superRefine((data) => {
      if (data.pac_has_resp === true) {
        data.pac_resp_name = "";
        data.pac_resp_education = "";
        data.pac_resp_whatsapp = "";
        data.pac_resp_education = "";
        data.pac_resp_occupation = "";
      }
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pac_has_resp: true,
      pac_addrs_has_comp: false,
    },
  });

  const registerWithMask = useHookFormMask(register);
  const formatCEP = (e: string) => {
    const CEP = e.replace(/\D/g, "");
    const CEPFormatado = CEP.match(/\d{5}-\d{3}/g)?.[0]?.substring(0, 8);
    return CEPFormatado;
  };

  const alerta = (data: FormData) => console.log("Funcionou", data);

  const watchedFormData = watch();
  const handleDateChange = (value: DateValue | null) => {
    if (value) {
      const formattedDate = value.toString(); // Convert to string

      setValue("pac_birth_date", formattedDate);
    } else {
      setValue("pac_birth_date", ""); // Clear the value if null
    }
  };
  // Usar o hook para buscar o endereço com base no CEP

  const hasResp = watch("pac_has_resp");

  const checkCEP = (event: React.FocusEvent<HTMLInputElement> | FocusEvent) => {
    const inputEvent = event as React.FocusEvent<HTMLInputElement>;
    const CEP = inputEvent.target.value.replace(/\D/g, "");

    fetch(`https://viacep.com.br/ws/${CEP}/json`, {})
      .then((response) => response.json())
      .then((data) => {
        console.log("Funcionou", data);
        setValue("pac_addrs_street_name", data.logradouro);
        setValue("pac_addrs_city", data.localidade);
        setValue("pac_addrs_uf", data.uf);
        setValue("pac_addrs_zip", CEP);
      });
  };

  // Preencher os campos de endereço quando o hook retornar dados

  return (
    <DefaultLayout>
      <form onSubmit={handleSubmit(alerta)}>
        <div className="flex flex-col gap-4 max-w-[400px] mx-auto">
          <BgCard className="flex flex-col gap-4">
            <Input
              isRequired
              errorMessage={errors.pac_name?.message}
              isInvalid={errors.pac_name ? true : false}
              label="Nome do Paciente"
              labelPlacement="outside"
              placeholder="Digite seu Nome"
              {...register("pac_name", { required: true })}
            />
            <Select
              isRequired
              errorMessage={errors.pac_sex?.message}
              isInvalid={errors.pac_sex ? true : false}
              label="Sexo"
              labelPlacement="outside"
              placeholder="Masculino"
              {...(register("pac_sex"), { required: true })}
            >
              <SelectItem key={"Masculino"} value="Masculino">
                Masculino
              </SelectItem>
              <SelectItem key={"Feminino"} value="Feminino">
                Feminino
              </SelectItem>
              <SelectItem key={"Não Binário"} value="Não Binário">
                Não Binário
              </SelectItem>
            </Select>
            <Controller
              control={control}
              name="pac_birth_date"
              rules={{ required: true }}
              render={({}) => (
                <DatePicker
                  isRequired
                  label="Data de Nascimento"
                  labelPlacement="outside"
                  onChange={handleDateChange}
                />
              )}
            />
            <Input
              isRequired
              errorMessage={errors.pac_whatsapp?.message}
              isInvalid={errors.pac_whatsapp ? true : false}
              label="Telefone"
              labelPlacement="outside"
              placeholder="11 12345-6789"
              {...registerWithMask("pac_whatsapp", "99 99999-9999")}
            />
            <Input
              isRequired
              errorMessage={errors.pac_email?.message}
              isInvalid={errors.pac_email ? true : false}
              label="Email"
              labelPlacement="outside"
              placeholder="exemplo@exemplo.com"
              {...(register("pac_email"), { required: true })}
            />
            <Input
              isRequired
              errorMessage={errors.pac_cpf?.message}
              isInvalid={errors.pac_cpf ? true : false}
              label="CPF"
              labelPlacement="outside"
              placeholder="Digite seu CPF"
              {...registerWithMask("pac_cpf", "cpf")}
            />

            <Controller
              control={control}
              name="pac_addrs_zip"
              render={({}) => (
                <Input
                  isRequired
                  errorMessage={errors.pac_addrs_zip?.message}
                  isInvalid={!!errors.pac_addrs_zip}
                  label="CEP"
                  labelPlacement="outside"
                  placeholder="00000-000"
                  value={watchedFormData.pac_addrs_zip}
                  {...registerWithMask("pac_addrs_zip", "99999-999")}
                  onBlur={(e) =>
                    checkCEP(e as React.FocusEvent<HTMLInputElement>)
                  }
                />
              )}
            />

            <div className="flex gap-4">
              <Input
                isRequired
                className="w-3/4"
                errorMessage={errors.pac_addrs_street_name?.message}
                isInvalid={errors.pac_addrs_street_name ? true : false}
                label="Endereço"
                labelPlacement="outside"
                placeholder="Av. Paulista"
                value={watchedFormData.pac_addrs_street_name}
                {...(register("pac_addrs_street_name"), { required: true })}
              />

              <Input
                isRequired
                className="w-1/4"
                errorMessage={errors.pac_addrs_num?.message}
                isInvalid={errors.pac_addrs_num ? true : false}
                label="Número"
                labelPlacement="outside"
                placeholder="304"
                value={watchedFormData.pac_addrs_num}
                {...(register("pac_addrs_num"), { required: true })}
              />
            </div>
            <div className="flex gap-4">
              <Input
                isRequired
                className="w-3/4"
                errorMessage={errors.pac_addrs_city?.message}
                isInvalid={errors.pac_addrs_city ? true : false}
                label="Cidade"
                labelPlacement="outside"
                placeholder="São Paulo"
                value={watchedFormData.pac_addrs_city}
                {...(register("pac_addrs_city"), { required: true })}
              />
              <Input
                isRequired
                className="w-1/4"
                errorMessage={errors.pac_addrs_uf?.message}
                isInvalid={errors.pac_addrs_uf ? true : false}
                label="Estado"
                labelPlacement="outside"
                placeholder="SP"
                value={watchedFormData.pac_addrs_uf}
                {...(register("pac_addrs_uf"), { required: true })}
              />
            </div>
            <Controller
              control={control}
              name="pac_addrs_has_comp"
              render={() => (
                <Input
                  errorMessage={errors.pac_addrs_comp?.message}
                  isInvalid={errors.pac_addrs_comp ? true : false}
                  isRequired={
                    control._formValues.pac_addrs_has_comp ? false : true
                  }
                  label="Complemento"
                  labelPlacement="outside"
                  placeholder="Apartamento 204"
                  {...register("pac_addrs_comp")}
                />
              )}
            />
            <Controller
              control={control}
              name="pac_addrs_has_comp"
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  size="sm"
                  onChange={() => field.onChange(!field.value)} // Inverte o valor atual
                >
                  Endereço não tem Complemento
                </Checkbox>
              )}
            />
          </BgCard>
          <Spacer />
          <BgCard className="flex flex-col gap-4">
            <Controller
              control={control}
              name="pac_has_resp"
              render={({ field }) => (
                <Checkbox
                  defaultChecked={watchedFormData.pac_has_resp}
                  size="sm"
                  onChange={() => field.onChange(!field.value)} // Inverte o valor atual
                >
                  Paciente não tem Responsável
                </Checkbox>
              )}
            />

            <Controller
              control={control}
              name="pac_resp_name"
              render={() => (
                <Input
                  errorMessage={errors.pac_resp_name?.message}
                  isInvalid={errors.pac_resp_name ? true : false}
                  isRequired={hasResp} // Torna o campo obrigatório se o checkbox estiver desmarcado
                  label="Nome do Responsável"
                  labelPlacement="outside"
                  placeholder="Emilia Rodrigues"
                  {...(register("pac_resp_name"), { required: hasResp })}
                />
              )}
            />

            {/* Repita para os outros campos de responsável */}
            <Controller
              control={control}
              name="pac_resp_whatsapp"
              render={() => (
                <Input
                  errorMessage={errors.pac_resp_whatsapp?.message}
                  isInvalid={errors.pac_resp_whatsapp ? true : false}
                  isRequired={hasResp} // Torna o campo obrigatório se o checkbox estiver desmarcado
                  label="Telefone do Responsável"
                  labelPlacement="outside"
                  placeholder="11 99999-9999"
                  {...registerWithMask("pac_resp_whatsapp", "99 99999-9999")}
                />
              )}
            />

            <Controller
              control={control}
              name="pac_resp_email"
              render={() => (
                <Input
                  errorMessage={errors.pac_resp_email?.message}
                  isInvalid={!!errors.pac_resp_email ? true : false}
                  isRequired={hasResp} // Torna o campo obrigatório se o checkbox estiver desmarcado
                  label="Email do Responsável"
                  labelPlacement="outside"
                  placeholder="johndean@example.com"
                  type="email"
                  {...(register("pac_resp_email"), { required: hasResp })}
                />
              )}
            />

            <Controller
              control={control}
              name="pac_resp_occupation"
              render={() => (
                <Input
                  errorMessage={errors.pac_resp_occupation?.message}
                  isInvalid={errors.pac_resp_occupation ? true : false}
                  isRequired={hasResp} // Torna o campo obrigatório se o checkbox estiver desmarcado
                  label="Ocupação do Responsável"
                  labelPlacement="outside"
                  placeholder="Bancário"
                  {...(register("pac_resp_occupation"), { required: hasResp })}
                />
              )}
            />
          </BgCard>
          <Button className="mx-auto" color="primary" type="submit">
            Enviar
          </Button>
        </div>
        <div>
          {" "}
          <pre>{JSON.stringify(watchedFormData, null, 2)}</pre>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="error-messages">
            <h4>Por favor, corrija os seguintes erros:</h4>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </DefaultLayout>
  );
}
