import Loading from "@/components/Loading";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home(props: any) {
  const router = useRouter();

  useEffect(() => {
    const to = setTimeout(() => {
      router.push("/home");
    }, 1000);

    return () => clearTimeout(to);
  }, [router]);

  return <Loading text="Redirecting..." />;
}
