"use client"

import React from 'react';
import {
    Search, ClipboardList, Award, FileText, Users, Handshake
} from 'lucide-react';
import { container, fadeInSide, fadeInUp } from '@/lib/variants';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';

const features = [
    {
        icon: Search,
        description: (
            <>Search real, <span className="text-secondary font-semibold">approved</span> community service opportunities in your area</>
        ),
    },
    {
        icon: ClipboardList,
        description: (
            <>See exactly how many <span className="text-secondary font-semibold">official</span> hours are offered per activity</>
        ),
    },
    {
        icon: Award,
        description: (
            <>Track your hours and automatically see progress toward major milestones</>
        ),
    },
    {
        icon: FileText,
        description: (
            <>Download reports and documentation for your school</>
        ),
    },
    {
        icon: Users,
        description: (
            <>Parents: Find <span className="text-secondary font-semibold">approved</span> opportunities and track required family hours</>
        ),
    },
    {
        icon: Handshake,
        description: (
            <>Organizations: Easily list your <span className="text-secondary font-semibold">approved</span> hours and reach local students</>
        ),
    },
];

const HowItWorks = () => {
    const MotionCard = motion(Card);
    return (
        <section id='how-it-works' className="scroll-mt-20">
            <motion.div
                className="max-w-7xl mx-auto px-4 p-10"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}

            >
                <motion.h2
                    className="text-3xl md:text-4xl text-center font-bold mb-12"
                    variants={fadeInUp}
                >
                    How Vocatio Works
                </motion.h2>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
                    variants={container}
                >
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <MotionCard key={idx} variants={fadeInSide}>
                                <Icon className="w-6 h-6 text-primary flex-shrink-0 mr-4 mt-1" />
                                <p className="text-base text-text-mute leading-relaxed">
                                    {feature.description}
                                </p>
                            </MotionCard>
                        );
                    })}
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HowItWorks;
