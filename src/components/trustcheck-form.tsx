"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  query: z
    .string()
    .min(1, { message: "Please enter a domain or email." })
    .refine(
      (value) => {
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return domainRegex.test(value) || emailRegex.test(value);
      },
      { message: "Please enter a valid domain or email address." }
    ),
});

type TrustCheckFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
};

export function TrustCheckForm({ onSubmit, isLoading }: TrustCheckFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("query", values.query);
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col sm:flex-row items-start gap-2">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  placeholder="e.g., example.com or user@example.com"
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12 text-base px-6">
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          Check
        </Button>
      </form>
    </Form>
  );
}
