"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { editSong } from "@/components/song/actions";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editSongSchema, type EditSongFormData } from "./edit-schema";

export function EditDialog({
  rkey,
  title,
  description,
  genre,
}: {
  rkey: string;
  title: string;
  description: string | null;
  genre: string | null;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditSongFormData>({
    resolver: zodResolver(editSongSchema),
    defaultValues: {
      title,
      description: description ?? undefined,
      genre: genre ?? undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title,
        description: description ?? undefined,
        genre: genre ?? undefined,
      });
    }
  }, [open, reset, title, description, genre]);

  const [state, action, pending] = useActionState(
    async (
      prevState: { success?: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const result = await editSong(prevState, formData);
      if (result.success) {
        setOpen(false);
      }
      return result;
    },
    null,
  );

  async function onSubmit(data: EditSongFormData) {
    const formData = new FormData();
    formData.set("rkey", rkey);
    formData.set("title", data.title);
    formData.set("description", data.description ?? "");
    formData.set("genre", data.genre ?? "");
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit song</DialogTitle>
        </DialogHeader>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="edit-title">Title</FieldLabel>
            <Input id="edit-title" {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.genre}>
            <FieldLabel htmlFor="edit-genre">Genre</FieldLabel>
            <Input id="edit-genre" {...register("genre")} />
            <FieldError>{errors.genre?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="edit-description">Description</FieldLabel>
            <Textarea id="edit-description" {...register("description")} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
