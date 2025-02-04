import { type PropsWithChildren } from "react";

export default function If({
  condition,
  children,
}: PropsWithChildren<{ condition?: boolean }>) {
  return condition ? <>{children}</> : null;
}
