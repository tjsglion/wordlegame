"use client";

import { signInWithProvider } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignInPanelProps {
  title: string;
  description: string;
  googleLabel: string;
  githubLabel: string;
  callbackUrl: string;
  errorMessage?: string | null;
  className?: string;
}

export function SignInPanel({
  title,
  description,
  googleLabel,
  githubLabel,
  callbackUrl,
  errorMessage,
  className,
}: SignInPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {errorMessage ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}
        <form className="flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button
            type="submit"
            formAction={signInWithProvider.bind(null, "google")}
            size="lg"
            className="h-11"
          >
            {googleLabel}
          </Button>
          <Button
            type="submit"
            formAction={signInWithProvider.bind(null, "github")}
            size="lg"
            variant="outline"
            className="h-11"
          >
            {githubLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
