import { notFound } from "next/navigation";

import ServicePolicyTemplate from "@/components/pages/service-policy/ServicePolicyTemplate";
import type { PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";

const ServicePolicyPage = async (props: PageProps) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return <ServicePolicyTemplate />;
};

ServicePolicyPage.displayName = "ServicePolicyPage";
export default ServicePolicyPage;
