import { notFound } from "next/navigation";
import { StepAccountType } from "@/components/onboarding/StepAccountType";
import { StepPhone } from "@/components/onboarding/StepPhone";
import { StepCode } from "@/components/onboarding/StepCode";
import { StepIdentity } from "@/components/onboarding/StepIdentity";
import { StepCedulaPhotos } from "@/components/onboarding/StepCedulaPhotos";
import { StepSelfie } from "@/components/onboarding/StepSelfie";
import { StepPin } from "@/components/onboarding/StepPin";

const stepComponents = {
  "1": StepAccountType,
  "2": StepPhone,
  "3": StepCode,
  "4": StepIdentity,
  "5": StepCedulaPhotos,
  "6": StepSelfie,
  "7": StepPin,
} as const;

export function generateStaticParams() {
  return Object.keys(stepComponents).map((step) => ({ step }));
}

interface Props {
  params: Promise<{ step: string }>;
}

export default async function RegistrarseStepPage({ params }: Props) {
  const { step } = await params;
  const Component = stepComponents[step as keyof typeof stepComponents];
  if (!Component) notFound();
  return <Component />;
}
