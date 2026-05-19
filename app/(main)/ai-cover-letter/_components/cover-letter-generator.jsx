"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Cover Letter Generator</CardTitle>
          <CardDescription>
            Fill in all details below. Every field is required for a perfect result.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* SECTION 1: PERSONAL & CONTACT INFO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Your Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Your Address</Label>
                  <Input id="address" placeholder="City, Country" {...register("address")} />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 2: CURRENT BACKGROUND */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Current Role</Label>
                  <Input id="currentTitle" placeholder="e.g. Senior Developer" {...register("currentTitle")} />
                  {errors.currentTitle && <p className="text-sm text-red-500">{errors.currentTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentOrganization">Current Company</Label>
                  <Input id="currentOrganization" placeholder="e.g. Tech Solutions Inc." {...register("currentOrganization")} />
                  {errors.currentOrganization && <p className="text-sm text-red-500">{errors.currentOrganization.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input id="yearsOfExperience" type="number" placeholder="5" {...register("yearsOfExperience")} />
                  {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keySkills">Key Skills</Label>
                  <Input id="keySkills" placeholder="React, Python, Project Management" {...register("keySkills")} />
                  {errors.keySkills && <p className="text-sm text-red-500">{errors.keySkills.message}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 3: TARGET JOB DETAILS */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold border-b pb-2">Target Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Target Company</Label>
                  <Input id="companyName" placeholder="Company you are applying to" {...register("companyName")} />
                  {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Target Position</Label>
                  <Input id="jobTitle" placeholder="Job title you are applying for" {...register("jobTitle")} />
                  {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea 
                  id="jobDescription" 
                  placeholder="Paste the target job description here..." 
                  className="h-32" 
                  {...register("jobDescription")} 
                />
                {errors.jobDescription && <p className="text-sm text-red-500">{errors.jobDescription.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={generating} className="w-full md:w-auto">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Perfect Letter...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Link href="/resume">
          <Button variant="outline">← Back to Resume Builder</Button>
        </Link>
        <Link href="/interview">
          <Button className="gap-2">Go to Interview Prep <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
}