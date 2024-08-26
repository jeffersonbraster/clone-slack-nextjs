"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Home() {
  const { signOut } = useAuthActions();

  return (
    <div>
      logado
      <Button onClick={() => signOut()}>Sair</Button>
    </div>
  );
}
