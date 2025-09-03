
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Search, UploadCloud, X, FileText } from "lucide-react";
import React from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [".eml"];

// Define the base schema first to access its parts for validation
const baseSchema = z.object({
  query: z.string().optional(),
  file: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files[0].name.slice(files[0].name.lastIndexOf('.'))),
      "Only .eml files are accepted."
    ),
});

// Apply refinements to the base schema
const formSchema = baseSchema.refine(
    (data) => !!data.query || (data.file && data.file.length > 0),
    {
        message: "Please enter a domain/email or upload a file.",
        path: ["query"],
    }
).refine(
    (data) => !(data.query && data.file && data.file.length > 0),
    {
        message: "Please provide either a domain/email or a file, not both.",
        path: ["query"],
    }
);


type TrustCheckFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
};

export function TrustCheckForm({ onSubmit, isLoading }: TrustCheckFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Manually validate the file using the base schema
      const fileValidation = baseSchema.shape.file.safeParse(files);
      if (!fileValidation.success) {
        form.setError("file", { type: "manual", message: fileValidation.error.errors[0].message });
        return;
      }

      setSelectedFile(file);
      form.setValue("file", files);
      form.setValue("query", ""); // Clear text input when file is selected
      form.clearErrors(); // Clear all errors

      // Trigger submission automatically
      const formData = new FormData();
      formData.append("file", file);
      onSubmit(formData);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    form.setValue("file", undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    if (values.query) {
        formData.append("query", values.query);
    } else if (values.file && values.file.length > 0) {
        // This path is now less likely to be used, but kept for robustness
        formData.append("file", values.file[0]);
    }
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-start gap-2">
            <div className="relative w-full">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Wprowadź adres email lub domenę"
                        {...field}
                        className="h-12 text-base"
                        disabled={isLoading || !!selectedFile}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormMessage className="absolute -bottom-5 left-0 text-xs">
                {form.formState.errors.query?.message || form.formState.errors.file?.message}
              </FormMessage>
            </div>
          <Button type="submit" disabled={isLoading || !!selectedFile} className="w-auto h-12 text-base px-6 font-bold">
            {isLoading && !selectedFile ? (
              <Loader2 className="animate-spin" />
            ) : (
                "Sprawdź"
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full border-2 border-primary/80 hover:bg-primary/10" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading && selectedFile ? <Loader2 className="animate-spin" /> : <UploadCloud className="h-6 w-6 text-primary" />}
            <span className="sr-only">Upload .eml file</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".eml"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
        {selectedFile && !isLoading && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>{selectedFile.name}</span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="h-6 w-6">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                </Button>
            </div>
        )}
        <p className="text-xs text-center text-muted-foreground pt-2">
            Wprowadź adres email, domenę lub kliknij przycisk <UploadCloud className="inline h-3 w-3 align-middle" />, aby dodać plik .eml do analizy.
        </p>
      </form>
    </Form>
  );
}
