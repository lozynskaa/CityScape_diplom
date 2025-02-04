import PhoneInputBase from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Props = {
  onChange: (value: string) => void;
  value?: string;
  country?: string;
};

export default function PhoneInput({ onChange, value, country }: Props) {
  if (value === undefined || value === null) return null;
  return (
    <PhoneInputBase
      inputClass="!w-full !rounded-md"
      onChange={onChange}
      value={value}
      country={country?.toLowerCase?.()}
      inputProps={{
        name: "phone",
        required: true,
      }}
    />
  );
}
