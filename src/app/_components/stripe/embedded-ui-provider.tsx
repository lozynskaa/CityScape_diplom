import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51QRE6V2UAWvfi77XVRUcVq1fEBt434Nhs8KQzj6hgQQU8FZMjzX2d8iP579u0zTkbs93t532W3EPGFqvhrJLu0XF00mX8GQBJ3",
);

type Props = {
  fetchClientSecret: (() => Promise<string>) | null;
};

export default function EmbeddedUIProvider({ fetchClientSecret }: Props) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: fetchClientSecret,
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
