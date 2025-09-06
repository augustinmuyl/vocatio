"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";
import { Card } from "@/components/ui/card";
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <section id="waitlist" className="scroll-mt-24 py-24 md:py-32">
            <div className="container mx-auto px-6">
                <motion.div
                    className="max-w-7xl mx-auto"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-text" variants={fadeInUp}>
                        Get Early Access
                    </motion.h2>
                    <motion.p className="mt-3 text-center text-text-mute max-w-2xl mx-auto" variants={fadeInUp}>
                        Be first to try Vocatio. We’ll notify you when invites roll out.
                    </motion.p>

                    <div className="mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Left: Info / Why Join */}
                        <motion.div className="lg:col-span-5" variants={fadeInUp}>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { icon: CheckCircle2, text: "Find approved opportunities faster" },
                                        { icon: CheckCircle2, text: "Track hours and requirements clearly" },
                                        { icon: CheckCircle2, text: "Export school-ready reports" },
                                    ].map(({ icon: Icon, text }, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <p className="text-base text-text">{text}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 shadow-custom">
                                    <div className="flex items-center gap-2 text-text font-medium">
                                        <Shield className="w-5 h-5 text-primary" /> Privacy matters
                                    </div>
                                    <ul className="mt-2 space-y-1 text-sm text-text-mute">
                                        <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> We only send early‑access updates</li>
                                        <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Your info is never shared</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Form */}
                        <motion.div className="lg:col-span-7" variants={fadeInUp}>
                            <Card className="p-6 sm:p-8">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-5 sm:space-y-6"
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

                                        <div className="pt-2">
                                            <Button type="submit" className="w-full">
                                                Submit
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
                                    </form>
                                </Form>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
