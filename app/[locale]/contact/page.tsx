import { notFound } from "next/navigation";
import { Suspense } from "react";

import ContactTemplate from "@/components/pages/contact/ContactTemplate";
import type { PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";

const ContactPage = async (props: PageProps) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <Suspense>
      <ContactTemplate />
    </Suspense>
  );
};

ContactPage.displayName = "ContactPage";
export default ContactPage;
