"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";
import { useWaitlist } from "@/hooks/useWaitlist";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  role: z.enum(["student", "parent", "organization", "other"], { error: "Please select a role" }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  additionalInfo: z.string().optional(),
  consent: z
    .boolean()
    .refine((val) => val, { error: "Consent is required" }),
  website: z.string().max(0),
});

export default function Waitlist() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
      name: "",
      email: "",
      additionalInfo: "",
      consent: false,
      website: "",
    },
  });

  const role = form.watch("role");
  const { submit, status } = useWaitlist();

  const additionalInfoLabels: Record<string, string> = {
    student: "Tell us about your community service needs",
    parent: "Tell us about your community service needs",
    organization: "Describe the opportunities your organization offers",
    other: "How would you like to work with us?",
  };
  const additionalInfoPlaceholders: Record<string, string> = {
    student: "E.g., your interests, skills, or availability",
    parent: "E.g., your interests, skills, or availability",
    organization: "E.g., tutoring, food drives, or environmental projects",
    other: "Share extra info or context (if any)"
  }

  const nameLabel = role === "organization" ? "Contact Name" : "Name";
  const additionalInfoLabel = role
    ? additionalInfoLabels[role]
    : "Additional Information";

  const additionalInfoPlaceholder = role ? additionalInfoPlaceholders[role] : "Add any details you’d like us to know"

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.website) {
      return;
    }

    await submit({
      role: values.role,
      name: values.name,
      email: values.email,
      additional_info: values.additionalInfo,
      consent: values.consent,
    });
  }

  return (
    <section id="waitlist" className="scroll-mt-24 py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 flex justify-center">
        <motion.div
          className="w-full max-w-2xl"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-text mb-8"
            variants={fadeInUp}
          >
            Get Early Access
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset
                  disabled={status === "success" || form.formState.isSubmitting}
                  className="space-y-6"
                >
                  <input
                    type="text"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    {...form.register("website")}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>I am a:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="student"
                                  id="student"
                                  className="border border-primary"
                                />
                              </FormControl>
                              <FormLabel htmlFor="student" className="font-normal">
                                Student
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="parent"
                                  id="parent"
                                  className="border border-primary"
                                />
                              </FormControl>
                              <FormLabel htmlFor="parent" className="font-normal">
                                Parent
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="organization"
                                  id="organization"
                                  className="border border-primary"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="organization"
                                className="font-normal"
                              >
                                Organization
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="other"
                                  id="other"
                                  className="border border-primary"
                                />
                              </FormControl>
                              <FormLabel htmlFor="other" className="font-normal">
                                Other
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{nameLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{additionalInfoLabel} (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={additionalInfoPlaceholder}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-border hover:cursor-pointer"
                            checked={field.value}
                            onChange={field.onChange}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I consent to be contacted about Vocatio
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </fieldset>
              </form>
            </Form>
            {status === "success" &&
              toast.success("Thanks for joining the waitlist!", {
                description: "Check your email for more information",
              })}
            {status === "error" && (
              <p className="mt-4 text-center text-danger">
                Something went wrong. Please try again.
              </p>
            )}
          </motion.div>
          <motion.p
            className="mt-6 text-sm text-center text-text-mute"
            variants={fadeInUp}
          >
            We’ll only contact you about early access and your interest in Vocatio.
            No spam, ever.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

