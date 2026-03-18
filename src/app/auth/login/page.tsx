"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/oauth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      // Redirect to authorization server
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-4">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your handle to sign in to your account.
          </CardDescription>
        </div>
        <ThemeToggle />
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4"
        >
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="handle">Handle</FieldLabel>
            <Input
              id="handle"
              type="text"
              value={handle}
              onChange={(event) => {
                setHandle(event.target.value);
              }}
              placeholder="user.example.com"
              disabled={loading}
            />
            <FieldError>{error}</FieldError>
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !handle}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
