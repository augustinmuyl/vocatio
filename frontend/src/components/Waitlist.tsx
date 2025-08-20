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

const formSchema = z.discriminatedUnion("role", [
    z.object({
        role: z.literal("student"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        school: z.string().optional(),
        requirement: z.enum([
            "graduation",
            "bright_futures",
            "honor_cord",
            "other",
        ]),
        hoursNeeded: z.string().optional(),
    }),
    z.object({
        role: z.literal("parent"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        school: z.string().optional(),
        requirement: z.enum([
            "graduation",
            "bright_futures",
            "honor_cord",
            "other",
        ]),
        hoursNeeded: z.string().optional(),
    }),
    z.object({
        role: z.literal("organization"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        orgName: z.string().min(1, "Organization name is required"),
        orgRole: z.string().min(1, "Role is required"),
        orgOpportunities: z.string().min(1, "Please describe your opportunities"),
    }),
    z.object({
        role: z.literal("other"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
    }),
]);

export default function Waitlist() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        } as Partial<z.infer<typeof formSchema>>,
    });

    const role = form.watch("role");
    const { submit, status, isSubmitted } = useWaitlist();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: Record<string, unknown> = {
            role: values.role,
            name: values.name,
            email: values.email,
        };

        if ("school" in values && values.school) {
            payload.school = values.school;
        }
        if ("requirement" in values && values.requirement) {
            payload.requirement = values.requirement;
        }
        if ("hoursNeeded" in values && values.hoursNeeded) {
            payload.hours_needed = parseInt(values.hoursNeeded, 10);
        }
        if ("orgName" in values && values.orgName) {
            payload.org_name = values.orgName;
        }
        if ("orgRole" in values && values.orgRole) {
            payload.org_role = values.orgRole;
        }
        if ("orgOpportunities" in values && values.orgOpportunities) {
            payload.org_opportunities = values.orgOpportunities;
        }

        await submit(payload);
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
                    <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-text mb-8" variants={fadeInUp}>
                        Get Early Access
                    </motion.h2>
                    <motion.div variants={fadeInUp}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <fieldset
                                    disabled={isSubmitted || form.formState.isSubmitting}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
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
                                                                <RadioGroupItem value="student" id="student" className="border border-primary" />
                                                            </FormControl>
                                                            <FormLabel htmlFor="student" className="font-normal">
                                                                Student
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="parent" id="parent" className="border border-primary" />
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
                                                                <RadioGroupItem value="other" id="other" className="border border-primary" />
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

                                    {(role === "student" || role === "parent") && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="school"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>School or District (optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your school" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="requirement"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>Which requirement matters most?</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                className="flex flex-wrap gap-4"
                                                            >
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem
                                                                            value="graduation"
                                                                            id="graduation"
                                                                            className="border border-primary"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel
                                                                        htmlFor="graduation"
                                                                        className="font-normal"
                                                                    >
                                                                        Graduation
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem
                                                                            value="bright_futures"
                                                                            id="bright_futures"
                                                                            className="border border-primary"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel
                                                                        htmlFor="bright_futures"
                                                                        className="font-normal"
                                                                    >
                                                                        Bright Futures
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem
                                                                            value="honor_cord"
                                                                            id="honor_cord"
                                                                            className="border border-primary"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel
                                                                        htmlFor="honor_cord"
                                                                        className="font-normal"
                                                                    >
                                                                        Honor Cord
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="other" id="req_other" className="border border-primary" />
                                                                    </FormControl>
                                                                    <FormLabel htmlFor="req_other" className="font-normal">
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
                                                name="hoursNeeded"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>How many hours do you still need? (optional)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {role === "organization" && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="orgName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Organization Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Organization" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="orgRole"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Role/Position</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your role" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="orgOpportunities"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            What type of opportunities/hours do you offer?
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Tell us about the opportunities you provide"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    <div className="pt-4">
                                        <Button type="submit" className="w-full">
                                            {form.formState.isSubmitting
                                                ? "Submitting..."
                                                : "Submit"}
                                        </Button>
                                    </div>
                                </fieldset>
                            </form>
                        </Form>
                        {status === "success" && (
                            toast.success("Thanks for joining the waitlist!", {
                                description: "Check your email for more information",
                            })
                        )}
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
                        We’ll only contact you about early access and your interest in
                        Vocatio. No spam, ever.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
