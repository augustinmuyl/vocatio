"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";
import { useWaitlist } from "@/hooks/useWaitlist";
import { CheckCircle2, Shield, Lock, Clock, Mail } from "lucide-react";

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
  role: z.enum(["student", "parent", "organization", "other"], {
    error: "Please select a role",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  additionalInfo: z.string().optional(),
  consent: z.boolean().refine((val) => val, { error: "Consent is required" }),
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

  useEffect(() => {
    if (status === "success") {
      toast.success("Thanks for joining the waitlist!", {
        description: "Check your email for more information",
      });
    }
  }, [status]);

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
    other: "Share extra info or context (if any)",
  };

  const nameLabel = role === "organization" ? "Contact Name" : "Name";
  const additionalInfoLabel = role
    ? additionalInfoLabels[role]
    : "Additional Information";

  const additionalInfoPlaceholder = role
    ? additionalInfoPlaceholders[role]
    : "Add any details you’d like us to know";

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
    <section id="waitlist" className="scroll-mt-24 py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-text"
            variants={fadeInUp}
          >
            Get Early Access
          </motion.h2>
          <motion.p
            className="mt-3 text-center text-text-mute max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Be first to try Vocatio. We’ll notify you when invites roll out.
          </motion.p>

          <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Info / Why Join */}
            <motion.div className="lg:col-span-5" variants={fadeInUp}>
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle2,
                      text: "Find approved opportunities faster",
                    },
                    {
                      icon: CheckCircle2,
                      text: "Track hours and requirements clearly",
                    },
                    { icon: CheckCircle2, text: "Export school-ready reports" },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-base text-text leading-9">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 shadow-custom">
                  <div className="flex items-center gap-2 text-text font-medium">
                    <Shield className="w-5 h-5 text-primary" /> Privacy matters
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-text-mute">
                    <li className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" /> We only send
                      early‑access updates
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" /> Your info is
                      never shared
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div className="lg:col-span-7" variants={fadeInUp}>
              <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 shadow-custom">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <fieldset
                      disabled={
                        status === "success" || form.formState.isSubmitting
                      }
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
                          <FormItem>
                            <FormLabel>Who are you?</FormLabel>
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
                                  <FormLabel
                                    htmlFor="student"
                                    className="font-normal"
                                  >
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
                                  <FormLabel
                                    htmlFor="parent"
                                    className="font-normal"
                                  >
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
                                  <FormLabel
                                    htmlFor="other"
                                    className="font-normal"
                                  >
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
                            <FormLabel>
                              {additionalInfoLabel} (optional)
                            </FormLabel>
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
                          {form.formState.isSubmitting
                            ? "Submitting..."
                            : "Submit"}
                        </Button>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-mute">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            We’ll email you when invites open
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            Unsubscribe anytime
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </form>
                </Form>
                {status === "error" && (
                  <p className="mt-4 text-center text-danger">
                    Something went wrong. Please try again.
                  </p>
                )}
                {status === "duplicate" && (
                  <p className="mt-4 text-center text-danger">
                    This email is already registered.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
