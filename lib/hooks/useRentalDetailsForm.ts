import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { CLOTHING_SIZES, SHOE_SIZES } from "@/lib/constants";
import type { RegistrationFormInput } from "@/lib/validations/registrations";

type ClothingSize = (typeof CLOTHING_SIZES)[number];

function isValidClothingSize(value: string): value is ClothingSize {
  return (CLOTHING_SIZES as readonly string[]).includes(value);
}

interface UseRentalDetailsFormReturn {
  wantsRental: boolean;
  clothingSize: string;
  shoeSize: string;
  onRentalToggle: (checked: boolean) => void;
  onClothingSizeChange: (value: string) => void;
  onShoeSizeChange: (value: string) => void;
  clothingSizeOptions: { value: string; label: string }[];
  shoeSizeOptions: { value: string; label: string }[];
}

export function useRentalDetailsForm(): UseRentalDetailsFormReturn {
  const { control, setValue } = useFormContext<RegistrationFormInput>();
  const rentalDetails = useWatch({ control, name: "rental_details" });

  const [wantsRental, setWantsRental] = useState(rentalDetails != null);
  const [clothingSize, setClothingSize] = useState(
    rentalDetails?.clothing_size ?? ""
  );
  const [shoeSize, setShoeSize] = useState(
    rentalDetails?.shoe_size != null ? String(rentalDetails.shoe_size) : ""
  );

  useEffect(
    function syncRentalFromFormValues() {
      if (rentalDetails != null) {
        setWantsRental(true);
        if (rentalDetails.clothing_size) {
          setClothingSize(String(rentalDetails.clothing_size));
        }
        if (rentalDetails.shoe_size) {
          setShoeSize(String(rentalDetails.shoe_size));
        }
      }
    },
    [rentalDetails]
  );

  function onRentalToggle(checked: boolean) {
    setWantsRental(checked);
    if (checked) {
      const cs = clothingSize;
      const ss = SHOE_SIZES.find((s) => String(s) === shoeSize);
      if (isValidClothingSize(cs) && ss != null) {
        setValue("rental_details", { clothing_size: cs, shoe_size: ss });
      }
    } else {
      setClothingSize("");
      setShoeSize("");
      setValue("rental_details", null);
    }
  }

  function onClothingSizeChange(value: string) {
    setClothingSize(value);
    const ss = SHOE_SIZES.find((s) => String(s) === shoeSize);
    if (isValidClothingSize(value) && ss != null) {
      setValue("rental_details", { clothing_size: value, shoe_size: ss });
    }
  }

  function onShoeSizeChange(value: string) {
    setShoeSize(value);
    const ss = SHOE_SIZES.find((s) => String(s) === value);
    if (isValidClothingSize(clothingSize) && ss != null) {
      setValue("rental_details", {
        clothing_size: clothingSize,
        shoe_size: ss,
      });
    }
  }

  const clothingSizeOptions = CLOTHING_SIZES.map((size) => ({
    value: size,
    label: size,
  }));

  const shoeSizeOptions = SHOE_SIZES.map((size) => ({
    value: String(size),
    label: `${size} cm`,
  }));

  return {
    wantsRental,
    clothingSize,
    shoeSize,
    onRentalToggle,
    onClothingSizeChange,
    onShoeSizeChange,
    clothingSizeOptions,
    shoeSizeOptions,
  };
}
