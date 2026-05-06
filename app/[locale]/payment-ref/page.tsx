import { Suspense } from "react";
import PaymentRefForm from "./PaymentRefForm";

const PaymentRefPage: React.FC = () => {
  return (
    <Suspense>
      <PaymentRefForm />
    </Suspense>
  );
};

PaymentRefPage.displayName = "PaymentRefPage";
export default PaymentRefPage;
