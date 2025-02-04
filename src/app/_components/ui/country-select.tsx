import PhoneInputBase from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Props = {
  onChange: (value: string) => void;
  value?: string;
};

export default function CountrySelect({ onChange, value }: Props) {
  return (
    <PhoneInputBase
      inputStyle={{ width: "0", border: "none" }}
      containerStyle={{ width: "auto" }}
      onChange={(_, country) =>
        "countryCode" in country && onChange(country.countryCode.toUpperCase())
      }
      country={value?.toLowerCase?.()}
    />
  );
}
