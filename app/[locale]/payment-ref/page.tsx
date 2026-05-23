import { Suspense } from "react";

import PaymentRefForm from "./PaymentRefForm";

const PaymentRefPage = () => {
  return (
    <Suspense>
      <PaymentRefForm />
    </Suspense>
  );
};

PaymentRefPage.displayName = "PaymentRefPage";
export default PaymentRefPage;
