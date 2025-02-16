import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";

export const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Head>
          <title>Zdrofit</title>
          <meta name="description" content="Zdrofit" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <Toaster />
        <Component {...pageProps} />
      </Provider>
    </QueryClientProvider>
  );
}
