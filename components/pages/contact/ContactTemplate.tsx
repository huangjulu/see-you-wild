"use client";

import { useState } from "react";

import Heading from "@/components/ui/atoms/Heading";
import Section from "@/components/ui/atoms/Section";
import { useTranslations } from "@/lib/i18n/client";

import ContactForm from "./ContactForm";
import TemplateSelector from "./TemplateSelector";

const ContactTemplate = () => {
  const t = useTranslations("contact");
  const [selectedTemplate, setSelectedTemplate] = useState("group4");

  return (
    <main className="bg-page-gradient">
      <Section as="div" className="pt-24 pb-24">
        <div className="hidden lg:block lg:col-span-5 lg:pr-6">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <div className="relative rounded-2xl overflow-clip h-full">
              <img
                src="/images/hero.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-180 from-brand-400/20 to-surface-frost/20" />
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-7 space-y-8">
          <Heading.H1
            variant="display"
            overline={t("overline")}
            overlineClassName="my-2"
            description={t("subtitle")}
            descriptionClassName="mt-2"
          >
            {t("title")}
          </Heading.H1>

          <TemplateSelector
            value={selectedTemplate}
            onChange={setSelectedTemplate}
          />

          <ContactForm template={selectedTemplate} />
        </div>
      </Section>
    </main>
  );
};

ContactTemplate.displayName = "ContactTemplate";
export default ContactTemplate;
