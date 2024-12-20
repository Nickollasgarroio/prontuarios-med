import {
  Spacer,
  Button,
  useDisclosure,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";
import DefaultLayout from "@/layouts/default";
import { UserProfileSchema } from "@/schemas/cadastroUserSchema";
import { UserProfile } from "@/types/FormDataTypes";
import { BgCard } from "@/components/bg-card";
import { GeneralModal } from "@/components/modals/GeneralModal";
import { supabase } from "@/supabaseClient";
import {
  PersonalInfoStep,
  ProfessionalInfoStep,
  ContactInfoStep,
  LocalidadeInfoStep,
} from "@/components/ProfileForm/steps/ProfileFormSteps";
import { BackButton } from "@/components/BackButton";

export default function UserProfileEditPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("pessoal");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const steps = ["pessoal", "localidade", "profissional", "contato"];
  const currentStepIndex = steps.indexOf(currentPage);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // Redireciona para a página de login se o usuário não estiver logado
  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [loading, session, navigate]);

  const methods = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    mode: "onChange",
    defaultValues: {
      id: session?.user.id || "", // Preenche o valor de "id" automaticamente se o usuário estiver logado
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
  } = methods;

  // Função para buscar dados do usuário no Supabase ao carregar a página
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar perfil:", error.message);
          reset({ id: session.user.id });
          setError("error");
          setModalMessage(
            "Ops! Parece que você ainda não tem um perfil cadastrado conosco, por favor preencha os dados abaixo para prosseguir!"
          );
          onOpen(); // Abre o modal em caso de erro
        } else if (!data) {
          console.log("Nenhum perfil encontrado, abrindo modal...");
          reset({ id: session.user.id });
          setModalMessage(
            "Ops! Parece que você ainda não tem um perfil cadastrado conosco, por favor preencha os dados abaixo para prosseguir!"
          );
          onOpen(); // Abre o modal quando não houver dados
        } else {
          console.log("Perfil encontrado:", data);
          reset(data); // Reseta o formulário com os dados do perfil
          setProfileId(data.id); // Armazena o ID do perfil encontrado
        }
      }
    };

    fetchUserProfile();
  }, [session, reset, onOpen]);

  const onSubmitSupabase = async (data: UserProfile) => {
    if (profileId) {
      // Atualiza os dados existentes
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profileId);

      if (error) {
        setError(error.message);
      } else {
        onOpen();
      }
    } else {
      // Cria um novo registro se o perfil não existir
      const { error } = await supabase.from("profiles").insert([data]);

      if (error) {
        setError(error.message);
      } else {
        onOpen();
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentPage(steps[currentStepIndex + 1]);
    } else {
      handleSubmit(onSubmitSupabase)();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentPage(steps[currentStepIndex - 1]);
    }
  };

  const renderStepComponent = () => {
    switch (currentPage) {
      case "pessoal":
        return (
          <PersonalInfoStep
            control={control}
            errors={errors}
            register={register}
          />
        );
      case "localidade":
        return (
          <LocalidadeInfoStep
            control={control}
            errors={errors}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        );
      case "profissional":
        return (
          <ProfessionalInfoStep
            control={control}
            errors={errors}
            register={register}
          />
        );
      case "contato":
        return (
          <ContactInfoStep
            control={control}
            errors={errors}
            register={register}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <BackButton subtitulo="Editar" titulo="Profissional" />

      <div>
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-4 max-w-[400px] mx-auto"
            onSubmit={handleSubmit(onSubmitSupabase)}
          >
            <Spacer />
            <Breadcrumbs underline="active">
              <BreadcrumbItem
                isCurrent={currentPage === "pessoal"}
                onPress={() => setCurrentPage("pessoal")}
              >
                Pessoal
              </BreadcrumbItem>
              <BreadcrumbItem
                isCurrent={currentPage === "localidade"}
                onPress={() => setCurrentPage("localidade")}
              >
                Localidade
              </BreadcrumbItem>
              <BreadcrumbItem
                isCurrent={currentPage === "profissional"}
                onPress={() => setCurrentPage("profissional")}
              >
                Profissional
              </BreadcrumbItem>
              <BreadcrumbItem
                isCurrent={currentPage === "contato"}
                onPress={() => setCurrentPage("contato")}
              >
                Contato
              </BreadcrumbItem>
            </Breadcrumbs>
            <BgCard className="flex flex-col gap-4 max-w-[400px]">
              {renderStepComponent()}
            </BgCard>
            <Spacer />
            <div className="flex flex-row gap-4 mx-auto">
              {currentStepIndex > 0 && (
                <Button color="danger" onPress={handlePreviousStep}>
                  Voltar
                </Button>
              )}
              <Button color="primary" onPress={handleNextStep}>
                {currentStepIndex === steps.length - 1 ? "Enviar" : "Próximo"}
              </Button>
            </div>
          </form>
        </FormProvider>
        <GeneralModal
          error={error ? error : ""}
          isOpen={isOpen}
          message={modalMessage}
          status={error ? "error" : "success"}
          onOpenChange={onOpenChange}
        />
        {/* <pre>{JSON.stringify(valores, null, 2)}</pre> */}
      </div>
    </DefaultLayout>
  );
}
